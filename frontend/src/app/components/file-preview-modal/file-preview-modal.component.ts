import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileItem } from '../../models/models';
import { FileService } from '../../services/file.service';

@Component({
  selector: 'app-file-preview-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <dialog id="previewDialog" class="glass-panel modal-preview-box">
      <div class="modal-header">
        <div class="title-wrapper">
          <i class="ri-file-3-line"></i>
          <span>{{ file?.name }}</span>
        </div>
        <div class="header-actions">
          <button class="btn-secondary btn-sm" (click)="download()"><i class="ri-download-line"></i> Download</button>
          <button class="close-btn" (click)="close()"><i class="ri-close-line"></i></button>
        </div>
      </div>

      <div class="preview-body" *ngIf="file">
        <!-- Image Preview -->
        <div *ngIf="isImage()" class="image-wrapper">
          <img [src]="previewUrl()" [alt]="file.name" class="img-preview">
        </div>

        <!-- PDF Preview -->
        <div *ngIf="isPdf()" class="pdf-wrapper">
          <iframe [src]="previewUrl()" class="pdf-frame"></iframe>
        </div>

        <!-- Generic / Text / Code Fallback -->
        <div *ngIf="!isImage() && !isPdf()" class="fallback-wrapper">
          <div class="fallback-icon"><i class="ri-file-search-line"></i></div>
          <p>Preview rendering for <strong>{{ file.mimeType }}</strong></p>
          <button class="btn-primary" (click)="download()"><i class="ri-download-cloud-line"></i> Download File</button>
        </div>
      </div>
    </dialog>
  `,
  styles: [`
    .modal-preview-box {
      padding: 1.5rem;
      width: 80vw;
      max-width: 900px;
      height: 80vh;
      background: var(--bg-glass-solid);
      border: 1px solid var(--border-glass);
      border-radius: var(--radius-lg);
      color: var(--text-main);
      display: flex;
      flex-direction: column;
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid var(--border-glass);
    }
    .title-wrapper { display: flex; align-items: center; gap: 0.5rem; font-weight: 600; font-size: 1.1rem; }
    .header-actions { display: flex; align-items: center; gap: 0.75rem; }
    .btn-sm { padding: 0.4rem 0.8rem; font-size: 0.85rem; }
    .close-btn { background: none; border: none; color: var(--text-muted); font-size: 1.4rem; cursor: pointer; }

    .preview-body { flex: 1; display: flex; align-items: center; justify-content: center; overflow: hidden; padding-top: 1rem; }
    .image-wrapper { max-height: 100%; max-width: 100%; overflow: auto; display: flex; justify-content: center; }
    .img-preview { max-height: 100%; max-width: 100%; object-fit: contain; border-radius: var(--radius-md); }

    .pdf-wrapper { width: 100%; height: 100%; }
    .pdf-frame { width: 100%; height: 100%; border: none; border-radius: var(--radius-md); }

    .fallback-wrapper { display: flex; flex-direction: column; align-items: center; gap: 1rem; color: var(--text-muted); }
    .fallback-icon { font-size: 4rem; color: var(--primary); }
  `]
})
export class FilePreviewModalComponent {
  @Input() file: FileItem | null = null;
  @Output() closed = new EventEmitter<void>();

  public previewUrl = signal<string>('');

  constructor(private fileService: FileService) {}

  open(): void {
    if (this.file) {
      this.previewUrl.set(this.fileService.getPreviewUrl(this.file.id));
    }
    const dialog = document.getElementById('previewDialog') as HTMLDialogElement;
    if (dialog) dialog.showModal();
  }

  close(): void {
    const dialog = document.getElementById('previewDialog') as HTMLDialogElement;
    if (dialog) dialog.close();
    this.closed.emit();
  }

  download(): void {
    if (this.file) {
      this.fileService.downloadFile(this.file.id);
    }
  }

  isImage(): boolean {
    return !!this.file?.mimeType.startsWith('image/');
  }

  isPdf(): boolean {
    return this.file?.mimeType === 'application/pdf';
  }
}
