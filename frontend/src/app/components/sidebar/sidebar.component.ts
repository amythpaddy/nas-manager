import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <aside class="sidebar glass-panel">
      <div class="nav-group">
        <div class="group-title">STORAGE MANAGER</div>
        
        <button 
          class="nav-item" 
          [class.active]="activeTab === 'my-files'"
          (click)="selectTab('my-files')"
        >
          <i class="ri-folder-shared-line"></i>
          <span>My Files</span>
        </button>

        <button 
          class="nav-item" 
          [class.active]="activeTab === 'shared'"
          (click)="selectTab('shared')"
        >
          <i class="ri-share-forward-line"></i>
          <span>Shared With Me</span>
        </button>
      </div>

      <div class="nav-group mt-auto">
        <div class="server-status-card">
          <div class="status-indicator online"></div>
          <div class="status-info">
            <span class="status-title">NAS Server Online</span>
            <span class="status-sub">PostgreSQL pgvector ready</span>
          </div>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 240px;
      height: calc(100vh - 120px);
      padding: 1.5rem 1rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .nav-group { display: flex; flex-direction: column; gap: 0.5rem; }
    .group-title {
      font-size: 0.72rem;
      font-weight: 700;
      color: var(--text-dim);
      letter-spacing: 0.8px;
      margin-bottom: 0.5rem;
      padding-left: 0.5rem;
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      border: none;
      background: transparent;
      color: var(--text-muted);
      border-radius: var(--radius-md);
      font-family: var(--font-family);
      font-size: 0.92rem;
      font-weight: 600;
      cursor: pointer;
      transition: all var(--transition-fast);
      text-align: left;
    }
    .nav-item i { font-size: 1.2rem; }
    .nav-item:hover {
      background: rgba(255, 255, 255, 0.05);
      color: var(--text-main);
    }
    .nav-item.active {
      background: var(--primary-gradient);
      color: #fff;
      box-shadow: var(--shadow-glow);
    }
    .mt-auto { margin-top: auto; }
    .server-status-card {
      background: rgba(15, 20, 36, 0.7);
      border: 1px solid var(--border-glass);
      padding: 0.85rem;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .status-indicator {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }
    .status-indicator.online {
      background: var(--accent-success);
      box-shadow: 0 0 10px var(--accent-success);
    }
    .status-info { display: flex; flex-direction: column; }
    .status-title { font-size: 0.8rem; font-weight: 600; color: var(--text-main); }
    .status-sub { font-size: 0.7rem; color: var(--text-muted); }
  `]
})
export class SidebarComponent {
  @Input() activeTab: string = 'my-files';
  @Output() tabChanged = new EventEmitter<string>();

  selectTab(tab: string): void {
    this.tabChanged.emit(tab);
  }
}
