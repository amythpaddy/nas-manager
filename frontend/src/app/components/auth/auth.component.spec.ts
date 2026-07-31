import { TestBed } from '@angular/core/testing';
import { AuthComponent } from './auth.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('AuthComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(AuthComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
