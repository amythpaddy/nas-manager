package com.nasmanager.repository;

import com.nasmanager.model.FileEmbedding;
import com.nasmanager.model.FileItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FileEmbeddingRepository extends JpaRepository<FileEmbedding, UUID> {
    void deleteByFileItem(FileItem fileItem);

    // Similarity search via pgvector cosine distance: embedding <=> query_embedding
    @Query(value = """
        SELECT fe.file_id as fileId, fe.chunk_text as chunkText,
               (1 - (fe.embedding <=> CAST(:queryEmbedding AS vector))) as similarityScore
        FROM file_embeddings fe
        JOIN files f ON fe.file_id = f.id
        WHERE f.owner_id = :userId
           OR f.id IN (SELECT file_id FROM file_shares WHERE shared_with_user_id = :userId)
        ORDER BY fe.embedding <=> CAST(:queryEmbedding AS vector) ASC
        LIMIT :limit
        """, nativeQuery = true)
    List<Object[]> searchSimilarChunks(@Param("userId") UUID userId,
                                       @Param("queryEmbedding") String queryEmbedding,
                                       @Param("limit") int limit);
}
