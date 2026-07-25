package com.nasmanager.service;

import com.nasmanager.model.FileEmbedding;
import com.nasmanager.model.FileItem;
import com.nasmanager.model.FileStatus;
import com.nasmanager.repository.FileEmbeddingRepository;
import com.nasmanager.repository.FileItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class FileIngestionService {

    private final TextExtractorService textExtractorService;
    private final OllamaEmbeddingService embeddingService;
    private final FileItemRepository fileItemRepository;
    private final FileEmbeddingRepository fileEmbeddingRepository;

    @Async
    @Transactional
    public void processAndIndexFile(FileItem fileItem) {
        log.info("Starting ingestion & indexing pipeline for file ID: {}", fileItem.getId());
        try {
            File physicalFile = new File(fileItem.getStoragePath());
            if (!physicalFile.exists()) {
                log.error("File does not exist at storage path: {}", fileItem.getStoragePath());
                fileItem.setStatus(FileStatus.ERROR);
                fileItemRepository.save(fileItem);
                return;
            }

            // 1. Extract text via Apache Tika
            String extractedText = textExtractorService.extractText(physicalFile);
            fileItem.setExtractedText(extractedText);

            // Clear previous embeddings if re-indexing
            fileEmbeddingRepository.deleteByFileItem(fileItem);

            if (extractedText != null && !extractedText.trim().isEmpty()) {
                // 2. Chunk text (e.g. 500 characters with 100 character overlap)
                List<String> chunks = chunkText(extractedText, 500, 100);

                // 3. Generate embeddings & save
                List<FileEmbedding> embeddingsToSave = new ArrayList<>();
                for (int i = 0; i < chunks.size(); i++) {
                    String chunk = chunks.get(i);
                    List<Double> vector = embeddingService.getEmbedding(chunk);
                    String vectorStr = embeddingService.formatVectorForPgVector(vector);

                    FileEmbedding embeddingEntity = FileEmbedding.builder()
                            .fileItem(fileItem)
                            .chunkIndex(i)
                            .chunkText(chunk)
                            .embedding(vectorStr)
                            .build();

                    embeddingsToSave.add(embeddingEntity);
                }

                fileEmbeddingRepository.saveAll(embeddingsToSave);
                log.info("Successfully saved {} text chunk embeddings for file ID: {}", embeddingsToSave.size(), fileItem.getId());
            }

            fileItem.setStatus(FileStatus.INDEXED);
            fileItemRepository.save(fileItem);
            log.info("Finished ingestion for file ID: {}", fileItem.getId());
        } catch (Exception ex) {
            log.error("Error during file ingestion for file ID: {}", fileItem.getId(), ex);
            fileItem.setStatus(FileStatus.ERROR);
            fileItemRepository.save(fileItem);
        }
    }

    private List<String> chunkText(String text, int chunkSize, int overlap) {
        List<String> chunks = new ArrayList<>();
        if (text == null || text.isEmpty()) return chunks;

        int start = 0;
        int textLength = text.length();

        while (start < textLength) {
            int end = Math.min(start + chunkSize, textLength);
            chunks.add(text.substring(start, end));
            if (end == textLength) break;
            start += (chunkSize - overlap);
        }

        return chunks;
    }
}
