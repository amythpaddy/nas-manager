import { TestBed } from '@angular/core/testing';
import { FileExplorerComponent } from './file-explorer.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('FileExplorerComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileExplorerComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(FileExplorerComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
