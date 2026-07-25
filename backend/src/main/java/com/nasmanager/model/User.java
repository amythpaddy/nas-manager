package com.nasmanager.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(nullable = false, length = 255)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(name = "storage_quota_bytes")
    private Long storageQuotaBytes;

    @Column(name = "storage_used_bytes")
    private Long storageUsedBytes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (storageQuotaBytes == null) {
            storageQuotaBytes = 10737418240L; // 10 GB
        }
        if (storageUsedBytes == null) {
            storageUsedBytes = 0L;
        }
        if (role == null) {
            role = Role.ROLE_USER;
        }
    }
}
