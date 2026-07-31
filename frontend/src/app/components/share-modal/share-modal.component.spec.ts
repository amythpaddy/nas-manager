import { TestBed } from '@angular/core/testing';
import { ShareModalComponent } from './share-modal.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('ShareModalComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShareModalComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ShareModalComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
