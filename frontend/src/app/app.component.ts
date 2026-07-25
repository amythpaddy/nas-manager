import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { FileExplorerComponent } from './components/file-explorer/file-explorer.component';
import { ShareModalComponent } from './components/share-modal/share-modal.component';
import { FilePreviewModalComponent } from './components/file-preview-modal/file-preview-modal.component';
import { AuthComponent } from './components/auth/auth.component';
import { FileItem } from './models/models';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NavbarComponent,
    SidebarComponent,
    FileExplorerComponent,
    ShareModalComponent,
    FilePreviewModalComponent,
    AuthComponent
  ],
  template: `
    <!-- Authentication Page View -->
    <app-auth *ngIf="!isAuthenticated()"></app-auth>

    <!-- Main Dashboard View -->
    <div *ngIf="isAuthenticated()" class="app-layout">
      <app-navbar (fileSelected)="onSearchResultSelected($event)"></app-navbar>

      <div class="main-body">
        <app-sidebar [activeTab]="activeTab" (tabChanged)="activeTab = $event"></app-sidebar>

        <main class="content-area">
          <app-file-explorer
            (previewRequested)="openPreviewModal($event)"
            (shareRequested)="openShareModal($event)"
          ></app-file-explorer>
        </main>
      </div>

      <!-- Modals -->
      <app-share-modal #shareModal [file]="selectedFileForShare"></app-share-modal>
      <app-file-preview-modal #previewModal [file]="selectedFileForPreview"></app-file-preview-modal>
    </div>
  `,
  styles: [`
    .app-layout {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      padding: 1rem 1.5rem;
    }
    .main-body {
      display: flex;
      gap: 1.5rem;
      flex: 1;
    }
    .content-area {
      flex: 1;
      min-width: 0;
    }
  `]
})
export class AppComponent {
  @ViewChild('shareModal') shareModal!: ShareModalComponent;
  @ViewChild('previewModal') previewModal!: FilePreviewModalComponent;

  public activeTab: string = 'my-files';
  public selectedFileForShare: FileItem | null = null;
  public selectedFileForPreview: FileItem | null = null;

  constructor(private authService: AuthService) {}

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  openShareModal(file: FileItem): void {
    this.selectedFileForShare = file;
    setTimeout(() => this.shareModal.open(), 50);
  }

  openPreviewModal(file: FileItem): void {
    this.selectedFileForPreview = file;
    setTimeout(() => this.previewModal.open(), 50);
  }

  onSearchResultSelected(fileId: string): void {
    console.log('Search result file selected:', fileId);
  }
}
