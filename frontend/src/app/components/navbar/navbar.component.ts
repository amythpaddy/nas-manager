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
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
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
