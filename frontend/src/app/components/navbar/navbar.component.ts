import { Component, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { SearchService } from '../../services/search.service';
import { SearchResultItem } from '../../models/models';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <header class="navbar glass-panel">
      <div class="nav-left">
        <div class="brand">
          <i class="ri-hard-drive-2-fill brand-icon"></i>
          <span class="brand-title">Smart NAS</span>
        </div>
      </div>

      <!-- Natural Language Semantic Vector Search -->
      <div class="nav-search">
        <div class="search-input-wrapper">
          <i class="ri-sparkling-fill ai-sparkle"></i>
          <input 
            type="text" 
            class="input-glass search-field" 
            placeholder="Ask AI to find content inside files (e.g. 'quarterly financial report')..."
            [(ngModel)]="searchQuery"
            (keyup.enter)="triggerSearch()"
          >
          <button class="search-btn" (click)="triggerSearch()">
            <i class="ri-search-2-line"></i>
          </button>
        </div>

        <!-- Quick AI Search Results Dropdown -->
        <div class="search-results-dropdown glass-panel" *ngIf="showResults() && searchResults().length > 0">
          <div class="dropdown-header">
            <span><i class="ri-ai-generate"></i> Semantic Vector Search Results</span>
            <button class="close-btn" (click)="showResults.set(false)"><i class="ri-close-line"></i></button>
          </div>
          <div class="result-list">
            <div class="result-item" *ngFor="let item of searchResults()" (click)="selectFile(item.fileId)">
              <div class="result-icon"><i class="ri-file-text-line"></i></div>
              <div class="result-info">
                <div class="result-title">{{ item.fileName }}</div>
                <div class="result-snippet">"...{{ item.matchedSnippet }}..."</div>
              </div>
              <div class="similarity-score">
                {{ (item.similarityScore * 100).toFixed(0) }}% match
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="nav-right">
        <!-- Storage Quota Bar -->
        <div class="storage-widget" *ngIf="user()">
          <div class="storage-text">
            <span>Storage</span>
            <span class="quota-val">{{ formatBytes(user()?.storageUsedBytes || 0) }} / {{ formatBytes(user()?.storageQuotaBytes || 0) }}</span>
          </div>
          <div class="storage-bar">
            <div class="storage-fill" [style.width.%]="getStoragePercentage()"></div>
          </div>
        </div>

        <!-- User Profile Dropdown -->
        <div class="user-profile" (click)="toggleMenu()">
          <div class="avatar">{{ user()?.username?.charAt(0)?.toUpperCase() }}</div>
          <span class="username">{{ user()?.username }}</span>
          <i class="ri-arrow-down-s-line"></i>
        </div>

        <button class="btn-secondary logout-btn" (click)="logout()" title="Sign Out">
          <i class="ri-logout-box-r-line"></i>
        </button>
      </div>
    </header>
  `,
  styles: [`
    .navbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 1.5rem;
      margin-bottom: 1.5rem;
      position: relative;
      z-index: 100;
    }
    .nav-left { display: flex; align-items: center; gap: 1rem; }
    .brand { display: flex; align-items: center; gap: 0.6rem; }
    .brand-icon {
      font-size: 1.6rem;
      background: var(--primary-gradient);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .brand-title { font-size: 1.25rem; font-weight: 700; letter-spacing: -0.5px; }

    .nav-search { flex: 1; max-width: 580px; margin: 0 1.5rem; position: relative; }
    .search-input-wrapper { position: relative; display: flex; align-items: center; }
    .ai-sparkle {
      position: absolute;
      left: 12px;
      color: var(--accent-cyan);
      font-size: 1.1rem;
      animation: pulse 2s infinite;
    }
    .search-field {
      padding-left: 2.4rem;
      padding-right: 2.8rem;
      background: rgba(15, 20, 36, 0.9);
      border-color: rgba(99, 102, 241, 0.3);
    }
    .search-field:focus { border-color: var(--primary); }
    .search-btn {
      position: absolute;
      right: 6px;
      background: var(--primary);
      border: none;
      color: #fff;
      width: 32px;
      height: 32px;
      border-radius: var(--radius-sm);
      cursor: pointer;
    }

    .search-results-dropdown {
      position: absolute;
      top: calc(100% + 8px);
      left: 0;
      right: 0;
      background: var(--bg-glass-solid);
      border: 1px solid var(--primary-glow);
      padding: 1rem;
      max-height: 400px;
      overflow-y: auto;
      animation: slideUp 0.2s ease-out;
    }
    .dropdown-header {
      display: flex;
      justify-content: space-between;
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--accent-cyan);
      margin-bottom: 0.75rem;
    }
    .close-btn { background: none; border: none; color: var(--text-muted); cursor: pointer; }
    .result-list { display: flex; flex-direction: column; gap: 0.5rem; }
    .result-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.6rem;
      border-radius: var(--radius-sm);
      background: rgba(255, 255, 255, 0.03);
      cursor: pointer;
      transition: background var(--transition-fast);
    }
    .result-item:hover { background: rgba(99, 102, 241, 0.15); }
    .result-icon { font-size: 1.4rem; color: var(--primary); }
    .result-info { flex: 1; min-width: 0; }
    .result-title { font-size: 0.9rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .result-snippet { font-size: 0.78rem; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .similarity-score { font-size: 0.75rem; font-weight: 700; color: var(--accent-success); background: rgba(16, 185, 129, 0.1); padding: 0.2rem 0.5rem; border-radius: 10px; }

    .nav-right { display: flex; align-items: center; gap: 1.25rem; }
    .storage-widget { display: flex; flex-direction: column; gap: 0.3rem; min-width: 140px; }
    .storage-text { display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted); }
    .quota-val { font-weight: 600; color: var(--text-main); }
    .storage-bar { height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden; }
    .storage-fill { height: 100%; background: var(--primary-gradient); border-radius: 3px; }

    .user-profile { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; }
    .avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      color: #fff;
    }
    .username { font-size: 0.9rem; font-weight: 600; }
  `]
})
export class NavbarComponent {
  @Output() fileSelected = new EventEmitter<string>();

  public searchQuery: string = '';
  public searchResults = signal<SearchResultItem[]>([]);
  public showResults = signal<boolean>(false);
  public menuOpen = signal<boolean>(false);

  constructor(private authService: AuthService, private searchService: SearchService) {}

  user() {
    return this.authService.currentUser();
  }

  triggerSearch(): void {
    if (!this.searchQuery.trim()) return;

    this.searchService.search(this.searchQuery).subscribe(results => {
      this.searchResults.set(results);
      this.showResults.set(true);
    });
  }

  selectFile(fileId: string): void {
    this.fileSelected.emit(fileId);
    this.showResults.set(false);
  }

  toggleMenu(): void {
    this.menuOpen.set(!this.menuOpen());
  }

  logout(): void {
    this.authService.logout();
    window.location.href = '/auth';
  }

  getStoragePercentage(): number {
    const u = this.user();
    if (!u || !u.storageQuotaBytes) return 0;
    return Math.min(100, Math.round((u.storageUsedBytes / u.storageQuotaBytes) * 100));
  }

  formatBytes(bytes: number): String {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
}
