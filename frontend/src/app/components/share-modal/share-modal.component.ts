import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FileItem, ShareResponse } from '../../models/models';
import { ShareService } from '../../services/share.service';

@Component({
  selector: 'app-share-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <dialog id="shareDialog" class="glass-panel modal-box">
      <div class="modal-header">
        <h3><i class="ri-share-line"></i> Share File</h3>
        <button class="close-btn" (click)="close()"><i class="ri-close-line"></i></button>
      </div>

      <div class="modal-body" *ngIf="file">
        <div class="file-summary">
          <i class="ri-file-3-fill file-icon"></i>
          <div>
            <div class="file-name">{{ file.name }}</div>
            <div class="file-size">{{ formatBytes(file.sizeBytes) }}</div>
          </div>
        </div>

        <!-- Share with specific user -->
        <div class="share-section">
          <label>Share with User</label>
          <div class="input-with-btn">
            <input type="text" class="input-glass" placeholder="Enter target username..." [(ngModel)]="targetUsername">
            <button class="btn-secondary" (click)="grantUserShare()">Grant Access</button>
          </div>
        </div>

        <!-- Public Link Generation -->
        <div class="share-section mt-3">
          <label>Public Share Link</label>
          <div class="public-link-box" *ngIf="publicShareUrl()">
            <input type="text" class="input-glass" [value]="publicShareUrl()" readonly>
            <button class="btn-primary" (click)="copyLink()"><i class="ri-file-copy-line"></i> Copy</button>
          </div>
          <button *ngIf="!publicShareUrl()" class="btn-primary w-full" (click)="generatePublicLink()">
            <i class="ri-link"></i> Generate Public Share Link
          </button>
        </div>

        <div *ngIf="message()" class="status-msg">
          <i class="ri-checkbox-circle-line"></i> {{ message() }}
        </div>
      </div>
    </dialog>
  `,
  styles: [`
    .modal-box {
      padding: 1.75rem;
      width: 480px;
      background: var(--bg-glass-solid);
      border: 1px solid var(--border-glass);
      border-radius: var(--radius-lg);
      color: var(--text-main);
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid var(--border-glass);
    }
    .modal-header h3 { font-size: 1.15rem; font-weight: 700; display: flex; align-items: center; gap: 0.5rem; }
    .close-btn { background: none; border: none; color: var(--text-muted); font-size: 1.2rem; cursor: pointer; }

    .file-summary {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: rgba(255, 255, 255, 0.04);
      padding: 0.85rem;
      border-radius: var(--radius-md);
      margin-bottom: 1.25rem;
    }
    .file-icon { font-size: 2rem; color: var(--primary); }
    .file-name { font-weight: 600; font-size: 0.95rem; }
    .file-size { font-size: 0.78rem; color: var(--text-muted); }

    .share-section { display: flex; flex-direction: column; gap: 0.4rem; }
    .share-section label { font-size: 0.85rem; font-weight: 600; color: var(--text-muted); }
    .input-with-btn { display: flex; gap: 0.5rem; }

    .public-link-box { display: flex; gap: 0.5rem; }
    .w-full { width: 100%; justify-content: center; }
    .mt-3 { margin-top: 1rem; }

    .status-msg {
      margin-top: 1rem;
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: var(--accent-success);
      padding: 0.6rem;
      border-radius: var(--radius-sm);
      font-size: 0.85rem;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }
  `]
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
