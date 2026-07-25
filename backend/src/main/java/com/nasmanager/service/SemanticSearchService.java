package com.nasmanager.service;

import com.nasmanager.dto.SearchDtos.*;
import com.nasmanager.model.FileItem;
import com.nasmanager.repository.FileEmbeddingRepository;
import com.nasmanager.repository.FileItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class SemanticSearchService {

    private final OllamaEmbeddingService embeddingService;
    private final FileEmbeddingRepository fileEmbeddingRepository;
    private final FileItemRepository fileItemRepository;

    public List<SearchResultItem> search(UUID userId, String queryText, int limit) {
        if (queryText == null || queryText.trim().isEmpty()) {
            return Collections.emptyList();
        }

        // 1. Generate query vector embedding via Ollama / fallback model
        List<Double> queryVector = embeddingService.getEmbedding(queryText);
        String vectorStr = embeddingService.formatVectorForPgVector(queryVector);

        // 2. Perform cosine similarity search via pgvector
        List<Object[]> rawResults = fileEmbeddingRepository.searchSimilarChunks(userId, vectorStr, limit);

        Map<UUID, SearchResultItem> resultMap = new HashMap<>();

        for (Object[] row : rawResults) {
            UUID fileId = (UUID) row[0];
            String chunkText = (String) row[1];
            Double similarityScore = ((Number) row[2]).doubleValue();

            if (!resultMap.containsKey(fileId)) {
                Optional<FileItem> fileOpt = fileItemRepository.findById(fileId);
                if (fileOpt.isPresent()) {
                    FileItem file = fileOpt.get();
                    SearchResultItem item = SearchResultItem.builder()
                            .fileId(file.getId())
                            .fileName(file.getName())
                            .mimeType(file.getMimeType())
                            .sizeBytes(file.getSizeBytes())
                            .matchedSnippet(chunkText)
                            .similarityScore(similarityScore)
                            .ownerUsername(file.getOwner().getUsername())
                            .build();
                    resultMap.put(fileId, item);
                }
            }
        }

        List<SearchResultItem> sortedResults = new ArrayList<>(resultMap.values());
        sortedResults.sort((a, b) -> Double.compare(b.getSimilarityScore(), a.getSimilarityScore()));
        return sortedResults;
    }
}
