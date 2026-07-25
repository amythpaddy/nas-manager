package com.nasmanager.dto;

import lombok.*;
import java.util.UUID;

public class SearchDtos {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SearchRequest {
        private String query;
        private int limit = 10;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SearchResultItem {
        private UUID fileId;
        private String fileName;
        private String mimeType;
        private Long sizeBytes;
        private String matchedSnippet;
        private Double similarityScore;
        private String ownerUsername;
    }
}
