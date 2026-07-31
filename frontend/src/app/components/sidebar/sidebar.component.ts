import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  @Input() activeTab: string = 'my-files';
  @Output() tabChanged = new EventEmitter<string>();

  selectTab(tab: string): void {
    this.tabChanged.emit(tab);
  }
}
