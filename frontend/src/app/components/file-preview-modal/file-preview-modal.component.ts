import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
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
}
