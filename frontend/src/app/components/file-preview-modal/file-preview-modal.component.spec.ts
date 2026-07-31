import { TestBed } from '@angular/core/testing';
import { FilePreviewModalComponent } from './file-preview-modal.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('FilePreviewModalComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilePreviewModalComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(FilePreviewModalComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
