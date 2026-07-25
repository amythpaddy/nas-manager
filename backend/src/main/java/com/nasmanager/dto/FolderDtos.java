package com.nasmanager.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

public class FolderDtos {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateFolderRequest {
        private String name;
        private UUID parentId;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FolderDto {
        private UUID id;
        private String name;
        private UUID parentId;
        private UUID ownerId;
        private String ownerUsername;
        private LocalDateTime createdAt;
    }
}
