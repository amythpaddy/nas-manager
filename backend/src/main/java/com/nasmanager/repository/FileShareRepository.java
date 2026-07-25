package com.nasmanager.repository;

import com.nasmanager.model.FileShare;
import com.nasmanager.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FileShareRepository extends JpaRepository<FileShare, UUID> {
    List<FileShare> findBySharedWithUser(User user);
    Optional<FileShare> findByPublicToken(String publicToken);
    Optional<FileShare> findByFileItemIdAndSharedWithUser(UUID fileId, User user);
    Optional<FileShare> findByFolderIdAndSharedWithUser(UUID folderId, User user);
}
