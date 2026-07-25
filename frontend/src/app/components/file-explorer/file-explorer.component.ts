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
  template: `
    <div class="explorer-container glass-panel">
      <!-- Top Action Bar -->
      <div class="explorer-toolbar">
        <div class="breadcrumbs">
          <button class="breadcrumb-item" (click)="navigateToRoot()">
            <i class="ri-home-4-line"></i> Root
          </button>
          <ng-container *ngFor="let crumb of breadcrumbs(); let last = last">
            <i class="ri-chevron-right-line separator"></i>
            <button class="breadcrumb-item" [class.current]="last" (click)="navigateToFolder(crumb)">
              {{ crumb.name }}
            </button>
          </ng-container>
        </div>

        <div class="toolbar-actions">
          <button class="btn-secondary" (click)="openCreateFolderDialog()">
            <i class="ri-folder-add-line"></i> New Folder
          </button>

          <label class="btn-primary file-upload-btn">
            <i class="ri-upload-cloud-2-line"></i> Upload File
            <input type="file" (change)="onFileSelected($event)" style="display: none;" multiple>
          </label>

          <div class="view-toggle">
            <button [class.active]="viewMode() === 'grid'" (click)="viewMode.set('grid')" title="Grid View">
              <i class="ri-grid-fill"></i>
            </button>
            <button [class.active]="viewMode() === 'list'" (click)="viewMode.set('list')" title="List View">
              <i class="ri-list-check"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Drag & Drop Zone -->
      <div 
        class="drag-drop-overlay" 
        [class.drag-over]="isDragging()"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)"
      >
        <!-- Content Loading Indicator -->
        <div *ngIf="loading()" class="loading-state">
          <div class="spinner"></div>
          <p>Loading files & folders...</p>
        </div>

        <div *ngIf="!loading() && folders().length === 0 && files().length === 0" class="empty-state">
          <div class="empty-icon"><i class="ri-folder-open-line"></i></div>
          <h3>This folder is empty</h3>
          <p>Drag and drop files here or click Upload to get started.</p>
        </div>

        <!-- Grid View Mode -->
        <div *ngIf="!loading() && viewMode() === 'grid'" class="items-grid">
          <!-- Folders -->
          <div class="grid-card folder-card" *ngFor="let folder of folders()" (click)="openFolder(folder)">
            <div class="card-icon folder-color"><i class="ri-folder-3-fill"></i></div>
            <div class="card-details">
              <div class="card-title">{{ folder.name }}</div>
              <div class="card-meta">Folder</div>
            </div>
            <button class="icon-btn delete-btn" (click)="$event.stopPropagation(); deleteFolder(folder.id)" title="Delete Folder">
              <i class="ri-delete-bin-line"></i>
            </button>
          </div>

          <!-- Files -->
          <div class="grid-card file-card" *ngFor="let file of files()">
            <div class="card-header">
              <div class="card-icon file-color"><i class="ri-file-3-fill"></i></div>
              <span class="badge" [ngClass]="{
                'badge-indexed': file.status === 'INDEXED',
                'badge-processing': file.status === 'PROCESSING',
                'badge-error': file.status === 'ERROR'
              }">
                {{ file.status }}
              </span>
            </div>

            <div class="card-details">
              <div class="card-title" [title]="file.name">{{ file.name }}</div>
              <div class="card-meta">{{ formatBytes(file.sizeBytes) }} • {{ file.mimeType.split('/')[1] || 'file' }}</div>
            </div>

            <div class="card-actions">
              <button class="action-btn" (click)="previewFile(file)" title="Preview">
                <i class="ri-eye-line"></i>
              </button>
              <button class="action-btn" (click)="downloadFile(file.id)" title="Download">
                <i class="ri-download-line"></i>
              </button>
              <button class="action-btn" (click)="shareFile(file)" title="Share">
                <i class="ri-share-line"></i>
              </button>
              <button class="action-btn danger" (click)="deleteFile(file.id)" title="Delete">
                <i class="ri-delete-bin-line"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- List View Mode -->
        <div *ngIf="!loading() && viewMode() === 'list'" class="items-list">
          <table class="file-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Size</th>
                <th>Owner</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let folder of folders()" class="folder-row" (click)="openFolder(folder)">
                <td class="name-cell"><i class="ri-folder-3-fill folder-color"></i> {{ folder.name }}</td>
                <td><span class="badge">Folder</span></td>
                <td>--</td>
                <td>{{ folder.ownerUsername }}</td>
                <td>
                  <button class="icon-btn delete-btn" (click)="$event.stopPropagation(); deleteFolder(folder.id)"><i class="ri-delete-bin-line"></i></button>
                </td>
              </tr>

              <tr *ngFor="let file of files()" class="file-row">
                <td class="name-cell"><i class="ri-file-3-fill file-color"></i> {{ file.name }}</td>
                <td>
                  <span class="badge" [ngClass]="{
                    'badge-indexed': file.status === 'INDEXED',
                    'badge-processing': file.status === 'PROCESSING',
                    'badge-error': file.status === 'ERROR'
                  }">{{ file.status }}</span>
                </td>
                <td>{{ formatBytes(file.sizeBytes) }}</td>
                <td>{{ file.ownerUsername }}</td>
                <td class="actions-cell">
                  <button class="action-btn" (click)="previewFile(file)"><i class="ri-eye-line"></i></button>
                  <button class="action-btn" (click)="downloadFile(file.id)"><i class="ri-download-line"></i></button>
                  <button class="action-btn" (click)="shareFile(file)"><i class="ri-share-line"></i></button>
                  <button class="action-btn danger" (click)="deleteFile(file.id)"><i class="ri-delete-bin-line"></i></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Create Folder Modal Dialog -->
    <dialog id="createFolderDialog" class="glass-panel modal-box">
      <form method="dialog" (submit)="confirmCreateFolder()">
        <h3>Create New Folder</h3>
        <div class="form-group my-3">
          <input type="text" class="input-glass" placeholder="Folder Name..." [(ngModel)]="newFolderName" name="folderName" required autofocus>
        </div>
        <div class="modal-buttons">
          <button type="button" class="btn-secondary" (click)="closeCreateFolderDialog()">Cancel</button>
          <button type="submit" class="btn-primary">Create</button>
        </div>
      </form>
    </dialog>
  `,
  styles: [`
    .explorer-container {
      padding: 1.5rem;
      min-height: calc(100vh - 120px);
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .explorer-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--border-glass);
    }
    .breadcrumbs { display: flex; align-items: center; gap: 0.4rem; }
    .breadcrumb-item {
      background: none;
      border: none;
      color: var(--text-muted);
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.3rem;
    }
    .breadcrumb-item.current { color: var(--text-main); }
    .separator { color: var(--text-dim); font-size: 0.8rem; }

    .toolbar-actions { display: flex; align-items: center; gap: 0.75rem; }
    .file-upload-btn { cursor: pointer; margin: 0; }
    .view-toggle {
      display: flex;
      background: rgba(15, 20, 36, 0.6);
      border: 1px solid var(--border-glass);
      border-radius: var(--radius-md);
      padding: 3px;
    }
    .view-toggle button {
      background: none;
      border: none;
      color: var(--text-muted);
      padding: 0.4rem 0.6rem;
      border-radius: var(--radius-sm);
      cursor: pointer;
    }
    .view-toggle button.active { background: var(--primary); color: #fff; }

    .drag-drop-overlay {
      flex: 1;
      border: 2px dashed transparent;
      border-radius: var(--radius-md);
      transition: all var(--transition-fast);
      min-height: 400px;
    }
    .drag-drop-overlay.drag-over {
      border-color: var(--primary);
      background: rgba(99, 102, 241, 0.08);
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem;
      color: var(--text-muted);
    }
    .empty-icon { font-size: 4rem; color: var(--text-dim); margin-bottom: 1rem; }

    /* Grid Styles */
    .items-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 1.25rem;
    }
    .grid-card {
      background: var(--bg-card);
      border: 1px solid var(--border-glass);
      border-radius: var(--radius-md);
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      transition: all var(--transition-fast);
      position: relative;
    }
    .grid-card:hover {
      transform: translateY(-4px);
      border-color: var(--border-glass-hover);
      box-shadow: var(--shadow-glass);
    }
    .folder-card { cursor: pointer; flex-direction: row; align-items: center; }
    .folder-color { color: #F59E0B; font-size: 2rem; }
    .file-color { color: var(--primary); font-size: 2rem; }

    .card-header { display: flex; justify-content: space-between; align-items: center; }
    .card-details { flex: 1; min-width: 0; }
    .card-title { font-weight: 600; font-size: 0.95rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .card-meta { font-size: 0.78rem; color: var(--text-muted); margin-top: 0.2rem; }

    .card-actions {
      display: flex;
      gap: 0.4rem;
      border-top: 1px solid var(--border-glass);
      padding-top: 0.6rem;
    }
    .action-btn {
      background: rgba(255, 255, 255, 0.05);
      border: none;
      color: var(--text-muted);
      width: 32px;
      height: 32px;
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .action-btn:hover { background: var(--primary); color: #fff; }
    .action-btn.danger:hover { background: var(--accent-danger); }

    /* List Table Styles */
    .file-table { width: 100%; border-collapse: collapse; text-align: left; }
    .file-table th { padding: 0.75rem; color: var(--text-dim); font-size: 0.8rem; font-weight: 700; border-bottom: 1px solid var(--border-glass); }
    .file-table td { padding: 0.85rem 0.75rem; border-bottom: 1px solid rgba(255, 255, 255, 0.04); font-size: 0.9rem; }
    .folder-row { cursor: pointer; }
    .folder-row:hover, .file-row:hover { background: rgba(255, 255, 255, 0.03); }

    .modal-box {
      padding: 2rem;
      width: 400px;
      background: var(--bg-glass-solid);
      border: 1px solid var(--border-glass);
      border-radius: var(--radius-lg);
      color: var(--text-main);
    }
    .modal-buttons { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem; }
    .my-3 { margin: 1rem 0; }
  `]
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
