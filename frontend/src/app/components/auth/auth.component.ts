import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="auth-container">
      <div class="glass-panel auth-card">
        <div class="brand-header">
          <div class="logo-icon">
            <i class="ri-hard-drive-2-fill"></i>
          </div>
          <h1>NAS Manager</h1>
          <p class="subtitle">Secure Smart Storage with Vector AI Search</p>
        </div>

        <div class="tab-switcher">
          <button [class.active]="isLogin()" (click)="isLogin.set(true)">
            <i class="ri-lock-password-line"></i> Sign In
          </button>
          <button [class.active]="!isLogin()" (click)="isLogin.set(false)">
            <i class="ri-user-add-line"></i> Register
          </button>
        </div>

        <div *ngIf="errorMessage()" class="error-banner">
          <i class="ri-error-warning-line"></i> {{ errorMessage() }}
        </div>

        <!-- Login Form -->
        <form *ngIf="isLogin()" (ngSubmit)="onLogin()" class="auth-form">
          <div class="form-group">
            <label for="username">Username or Email</label>
            <input type="text" id="username" class="input-glass" [(ngModel)]="loginData.usernameOrEmail" name="usernameOrEmail" required placeholder="admin or admin@nas.local" autocomplete="username">
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" class="input-glass" [(ngModel)]="loginData.password" name="password" required placeholder="••••••••" autocomplete="current-password">
          </div>

          <button type="submit" class="btn-primary w-full" [disabled]="loading()">
            <i class="ri-login-box-line" *ngIf="!loading()"></i>
            <span *ngIf="loading()">Authenticating...</span>
            <span *ngIf="!loading()">Sign In</span>
          </button>
        </form>

        <!-- Register Form -->
        <form *ngIf="!isLogin()" (ngSubmit)="onRegister()" class="auth-form">
          <div class="form-group">
            <label for="reg-username">Username</label>
            <input type="text" id="reg-username" class="input-glass" [(ngModel)]="regData.username" name="username" required placeholder="john_doe" autocomplete="username">
          </div>

          <div class="form-group">
            <label for="reg-email">Email Address</label>
            <input type="email" id="reg-email" class="input-glass" [(ngModel)]="regData.email" name="email" required placeholder="john@example.com" autocomplete="email">
          </div>

          <div class="form-group">
            <label for="reg-password">Password</label>
            <input type="password" id="reg-password" class="input-glass" [(ngModel)]="regData.password" name="password" required placeholder="••••••••" autocomplete="new-password">
          </div>

          <button type="submit" class="btn-primary w-full" [disabled]="loading()">
            <i class="ri-user-add-line" *ngIf="!loading()"></i>
            <span *ngIf="loading()">Creating Account...</span>
            <span *ngIf="!loading()">Create Account</span>
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 2rem;
    }
    .auth-card {
      width: 100%;
      max-width: 440px;
      padding: 2.5rem;
      animation: slideUp 0.4s ease-out;
    }
    .brand-header {
      text-align: center;
      margin-bottom: 2rem;
    }
    .logo-icon {
      width: 64px;
      height: 64px;
      background: var(--primary-gradient);
      border-radius: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      color: #fff;
      margin: 0 auto 1rem;
      box-shadow: var(--shadow-glow);
    }
    .brand-header h1 {
      font-size: 1.8rem;
      font-weight: 700;
      letter-spacing: -0.5px;
    }
    .subtitle {
      color: var(--text-muted);
      font-size: 0.88rem;
      margin-top: 0.25rem;
    }
    .tab-switcher {
      display: flex;
      background: rgba(15, 20, 36, 0.6);
      border: 1px solid var(--border-glass);
      border-radius: var(--radius-md);
      padding: 4px;
      margin-bottom: 1.5rem;
    }
    .tab-switcher button {
      flex: 1;
      background: transparent;
      border: none;
      color: var(--text-muted);
      padding: 0.6rem;
      font-size: 0.9rem;
      font-weight: 600;
      border-radius: calc(var(--radius-md) - 2px);
      cursor: pointer;
      transition: all var(--transition-fast);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
    }
    .tab-switcher button.active {
      background: var(--bg-card);
      color: var(--text-main);
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }
    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }
    .form-group label {
      font-size: 0.85rem;
      font-weight: 500;
      color: var(--text-muted);
    }
    .w-full { width: 100%; justify-content: center; }
    .error-banner {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.4);
      color: var(--accent-danger);
      padding: 0.75rem;
      border-radius: var(--radius-md);
      font-size: 0.85rem;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
  `]
})
export class AuthComponent {
  public isLogin = signal<boolean>(true);
  public loading = signal<boolean>(false);
  public errorMessage = signal<string>('');

  public loginData = { usernameOrEmail: '', password: '' };
  public regData = { username: '', email: '', password: '' };

  constructor(private authService: AuthService, private router: Router) {}

  onLogin(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.authService.login(this.loginData).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message || 'Invalid username or password');
      }
    });
  }

  onRegister(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.authService.register(this.regData).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message || 'Registration failed');
      }
    });
  }
}
