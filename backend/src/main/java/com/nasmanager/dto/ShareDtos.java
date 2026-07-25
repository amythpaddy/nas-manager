package com.nasmanager.dto;

import com.nasmanager.model.SharePermission;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

public class ShareDtos {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ShareRequest {
        private UUID fileId;
        private UUID folderId;
        private String targetUsername;
        private SharePermission permission;
        private Boolean createPublicLink;
        private Integer expirationDays;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ShareResponseDto {
        private UUID id;
        private UUID fileId;
        private String fileName;
        private UUID folderId;
        private String folderName;
        private String sharedWithUsername;
        private SharePermission permission;
        private String publicToken;
        private String publicUrl;
        private LocalDateTime expiresAt;
        private LocalDateTime createdAt;
    }
}
