import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FileItem } from '../../models/models';
import { FileService } from '../../services/file.service';

@Component({
  selector: 'app-file-preview-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './file-preview-modal.component.html',
  styleUrl: './file-preview-modal.component.css'
})
export class FilePreviewModalComponent {
  @Input() file: FileItem | null = null;
  @Output() closed = new EventEmitter<void>();

  public previewUrl = signal<string>('');
  public safePreviewUrl = signal<SafeResourceUrl | null>(null);
  public textContent = signal<string>('');

  constructor(
    private fileService: FileService,
    private sanitizer: DomSanitizer
  ) {}

  open(): void {
    if (this.file) {
      this.previewUrl.set(this.fileService.getPreviewUrl(this.file.id));

      if (this.isPdf()) {
        const rawUrl = this.fileService.getPreviewUrl(this.file.id);
        this.safePreviewUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(rawUrl));
      } else if (this.isText()) {
        this.textContent.set('Loading content...');
        this.fileService.getFileTextContent(this.file.id).subscribe({
          next: (content) => this.textContent.set(content),
          error: (err) => {
            console.error('Failed to load text content:', err);
            this.textContent.set('Error loading file content.');
          }
        });
      }
    }
    const dialog = document.getElementById('previewDialog') as HTMLDialogElement;
    if (dialog) dialog.showModal();
  }

  close(): void {
    const dialog = document.getElementById('previewDialog') as HTMLDialogElement;
    if (dialog) dialog.close();
    this.previewUrl.set('');
    this.safePreviewUrl.set(null);
    this.textContent.set('');
    this.closed.emit();
  }

  download(): void {
    if (this.file) {
      this.fileService.downloadFile(this.file.id);
    }
  }

  isImage(): boolean {
    if (!this.file) return false;
    const name = this.file.name.toLowerCase();
    const isRawExtension = name.endsWith('.cr2') || name.endsWith('.cr3') || name.endsWith('.arw') ||
                           name.endsWith('.nef') || name.endsWith('.dng') || name.endsWith('.raf') ||
                           name.endsWith('.orf') || name.endsWith('.rw2') || name.endsWith('.pef');
    return this.file.mimeType.startsWith('image/') || isRawExtension;
  }

  isPdf(): boolean {
    return this.file?.mimeType === 'application/pdf';
  }

  isText(): boolean {
    if (!this.file) return false;
    const type = this.file.mimeType;
    return type.startsWith('text/') || 
           type === 'application/json' || 
           type === 'application/xml' || 
           type === 'application/javascript';
  }
}
