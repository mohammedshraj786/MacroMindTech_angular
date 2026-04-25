import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/service/app.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  loginData = {
    username: '',
    password: ''
  };

  showPassword: boolean = false;
  isLoading: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }

  onSubmit(form: NgForm): void {
    this.clearMessages();

    if (form.invalid) {
      Object.keys(form.controls).forEach(key => {
        form.controls[key].markAsTouched();
      });
      return;
    }

    this.isLoading = true;

    const payload = {
      username: this.loginData.username,
      password: Number(this.loginData.password)
    };

    this.authService.login(payload).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = 'Login successful! Redirecting...';

        const token = response.access_token || response.token;
        if (token) {
          localStorage.setItem('authToken', token);
        }
        localStorage.setItem('loginResponse', JSON.stringify(response));
        this.router.navigate(['/cash-register'])
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 401) {
          this.errorMessage = 'Invalid username or password. Please try again.';
        } else {
          this.errorMessage = err?.error?.message || 'Something went wrong. Please try again.';
        }
      }
    });
  }
}