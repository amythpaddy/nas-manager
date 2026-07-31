import { Component, Input, Output, EventEmitter, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FileItem, Folder } from '../../models/models';
import { FileService } from '../../services/file.service';
import { FolderService } from '../../services/folder.service';

@Component({
  selector: 'app-file-explorer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './file-explorer.component.html',
  styleUrl: './file-explorer.component.css'
})
export class FileExplorerComponent implements OnInit {
  @Output() fileUploadTriggered = new EventEmitter<File[]>();
  @Output() previewRequested = new EventEmitter<FileItem>();
  @Output() shareRequested = new EventEmitter<FileItem>();

  public folders = signal<Folder[]>([]);
  public files = signal<FileItem[]>([]);
  public currentFolderId = signal<string | undefined>(undefined);
  public breadcrumbs = signal<Folder[]>([]);
  public viewMode = signal<'grid' | 'list'>('grid');
  public loading = signal<boolean>(false);
  public isDragging = signal<boolean>(false);

  public newFolderName: string = '';

  constructor(private fileService: FileService, private folderService: FolderService) {}

  ngOnInit(): void {
    this.loadContent();
  }

  loadContent(): void {
    this.loading.set(true);
    const folderId = this.currentFolderId();

    this.folderService.getFolders(folderId).subscribe(folders => {
      this.folders.set(folders);
      this.fileService.getFiles(folderId).subscribe(files => {
        this.files.set(files);
        this.loading.set(false);
      });
    });
  }

  openFolder(folder: Folder): void {
    this.breadcrumbs.update(b => [...b, folder]);
    this.currentFolderId.set(folder.id);
    this.loadContent();
  }

  navigateToRoot(): void {
    this.breadcrumbs.set([]);
    this.currentFolderId.set(undefined);
    this.loadContent();
  }

  navigateToFolder(folder: Folder): void {
    const idx = this.breadcrumbs().findIndex(f => f.id === folder.id);
    if (idx !== -1) {
      this.breadcrumbs.set(this.breadcrumbs().slice(0, idx + 1));
      this.currentFolderId.set(folder.id);
      this.loadContent();
    }
  }

  onFileSelected(event: any): void {
    const selectedFiles: FileList = event.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      const filesArray = Array.from(selectedFiles);
      filesArray.forEach(file => {
        this.fileService.uploadFile(file, this.currentFolderId()).subscribe(() => {
          this.loadContent();
        });
      });
    }
  }

  onDragOver(e: DragEvent): void {
    e.preventDefault();
    this.isDragging.set(true);
  }

  onDragLeave(e: DragEvent): void {
    e.preventDefault();
    this.isDragging.set(false);
  }

  onDrop(e: DragEvent): void {
    e.preventDefault();
    this.isDragging.set(false);
    if (e.dataTransfer && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      filesArray.forEach(file => {
        this.fileService.uploadFile(file, this.currentFolderId()).subscribe(() => {
          this.loadContent();
        });
      });
    }
  }

  openCreateFolderDialog(): void {
    const dialog = document.getElementById('createFolderDialog') as HTMLDialogElement;
    if (dialog) dialog.showModal();
  }

  closeCreateFolderDialog(): void {
    const dialog = document.getElementById('createFolderDialog') as HTMLDialogElement;
    if (dialog) dialog.close();
  }

  confirmCreateFolder(): void {
    if (!this.newFolderName.trim()) return;
    this.folderService.createFolder(this.newFolderName, this.currentFolderId()).subscribe(() => {
      this.newFolderName = '';
      this.closeCreateFolderDialog();
      this.loadContent();
    });
  }

  downloadFile(fileId: string): void {
    this.fileService.downloadFile(fileId);
  }

  reindexFolder(): void {
    const folderId = this.currentFolderId();
    this.fileService.reindexFolder(folderId).subscribe({
      next: (updatedFiles) => {
        this.files.set(updatedFiles);
        setTimeout(() => this.loadContent(), 1000);
      },
      error: (err) => {
        console.error('Failed to re-index folder:', err);
      }
    });
  }

  isProcessing(): boolean {
    return this.files().some(file => file.status === 'PROCESSING');
  }

  previewFile(file: FileItem): void {
    this.previewRequested.emit(file);
  }

  shareFile(file: FileItem): void {
    this.shareRequested.emit(file);
  }

  deleteFile(fileId: string): void {
    if (confirm('Are you sure you want to delete this file?')) {
      this.fileService.deleteFile(fileId).subscribe(() => this.loadContent());
    }
  }

  deleteFolder(folderId: string): void {
    if (confirm('Are you sure you want to delete this folder and its contents?')) {
      this.folderService.deleteFolder(folderId).subscribe(() => this.loadContent());
    }
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
}
