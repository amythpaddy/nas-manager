import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css'
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
