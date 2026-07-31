import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FileItem, ShareResponse } from '../../models/models';
import { ShareService } from '../../services/share.service';

@Component({
  selector: 'app-share-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './share-modal.component.html',
  styleUrl: './share-modal.component.css'
})
export class ShareModalComponent {
  @Input() file: FileItem | null = null;
  @Output() closed = new EventEmitter<void>();

  public targetUsername: string = '';
  public publicShareUrl = signal<string>('');
  public message = signal<string>('');

  constructor(private shareService: ShareService) {}

  open(): void {
    this.message.set('');
    this.publicShareUrl.set('');
    this.targetUsername = '';
    const dialog = document.getElementById('shareDialog') as HTMLDialogElement;
    if (dialog) dialog.showModal();
  }

  close(): void {
    const dialog = document.getElementById('shareDialog') as HTMLDialogElement;
    if (dialog) dialog.close();
    this.closed.emit();
  }

  grantUserShare(): void {
    if (!this.file || !this.targetUsername.trim()) return;

    this.shareService.createShare({
      fileId: this.file.id,
      targetUsername: this.targetUsername,
      permission: 'READ'
    }).subscribe({
      next: () => {
        this.message.set(`Granted read access to ${this.targetUsername}`);
        this.targetUsername = '';
      },
      error: (err) => {
        this.message.set(err.error?.message || 'Failed to share file');
      }
    });
  }

  generatePublicLink(): void {
    if (!this.file) return;

    this.shareService.createShare({
      fileId: this.file.id,
      createPublicLink: true,
      expirationDays: 7
    }).subscribe(res => {
      if (res.publicUrl) {
        const fullUrl = window.location.origin + res.publicUrl;
        this.publicShareUrl.set(fullUrl);
        this.message.set('Public link generated!');
      }
    });
  }

  copyLink(): void {
    navigator.clipboard.writeText(this.publicShareUrl());
    this.message.set('Copied to clipboard!');
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
}
