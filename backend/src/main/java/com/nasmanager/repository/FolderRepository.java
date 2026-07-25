package com.nasmanager.repository;

import com.nasmanager.model.Folder;
import com.nasmanager.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FolderRepository extends JpaRepository<Folder, UUID> {
    List<Folder> findByOwnerAndParentIsNull(User owner);
    List<Folder> findByOwnerAndParentId(User owner, UUID parentId);
    Optional<Folder> findByIdAndOwner(UUID id, User owner);
}
