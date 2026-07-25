export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  storageQuotaBytes: number;
  storageUsedBytes: number;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  user: User;
}

export interface Folder {
  id: string;
  name: string;
  parentId?: string;
  ownerId: string;
  ownerUsername: string;
  createdAt: string;
}

export interface FileItem {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  folderId?: string;
  ownerId: string;
  ownerUsername: string;
  status: 'UPLOADING' | 'PROCESSING' | 'INDEXED' | 'ERROR';
  checksum?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ShareResponse {
  id: string;
  fileId?: string;
  fileName?: string;
  folderId?: string;
  folderName?: string;
  sharedWithUsername?: string;
  permission: 'READ' | 'WRITE';
  publicToken?: string;
  publicUrl?: string;
  expiresAt?: string;
  createdAt: string;
}

export interface SearchResultItem {
  fileId: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  matchedSnippet: string;
  similarityScore: number;
  ownerUsername: string;
}

export interface UploadTask {
  id: string;
  fileName: string;
  size: number;
  progress: number;
  status: 'UPLOADING' | 'COMPLETED' | 'ERROR';
}
