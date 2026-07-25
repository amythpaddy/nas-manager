package com.nasmanager.repository;

import com.nasmanager.model.FileItem;
import com.nasmanager.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FileItemRepository extends JpaRepository<FileItem, UUID> {
    List<FileItem> findByOwnerAndFolderIsNull(User owner);
    List<FileItem> findByOwnerAndFolderId(User owner, UUID folderId);
    Optional<FileItem> findByIdAndOwner(UUID id, User owner);

    @Query("SELECT f FROM FileItem f WHERE f.owner = :owner AND LOWER(f.name) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<FileItem> searchByName(@Param("owner") User owner, @Param("query") String query);
}
