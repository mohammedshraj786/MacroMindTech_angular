import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, Location, Product } from '../../../core/service/app.service';

@Component({
  selector: 'app-cash-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cash-register.html',
  styleUrls: ['./cash-register.css']
})
export class CashRegister implements OnInit {

  locations: Location[] = [];
  selectedLocation: Location | null = null;


  formData = {
    amount: null as number | null,
    location_id: ''
  };

  isLoading: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.locations = this.authService.getLocations();

    if (!this.locations.length) {
      this.router.navigate(['/login']);
    }
  }

  onLocationChange(): void {
    this.selectedLocation = this.locations.find(
      loc => loc.location_id === this.formData.location_id
    ) || null;
  }

  onSubmit(form: NgForm): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (form.invalid) {
      Object.values(form.controls).forEach(ctrl => ctrl.markAsTouched());
      return;
    }

    this.isLoading = true;

    const payload = {
      amount: Number(this.formData.amount),
      location_id: this.formData.location_id
    };

    this.authService.openCashRegister(payload).subscribe({
      next: (response) => {
        this.successMessage = 'Cash register opened! Loading products...';

        const numericId = Number(this.selectedLocation?.location_id?.replace(/\D/g, '') ?? '0');
        const apiLocationId = response.data?.location_id;
        const locationId = (apiLocationId != null && Number(apiLocationId) > 0) ? apiLocationId : numericId;

        this.authService.getProducts(String(locationId)).subscribe({
          next: (productsResponse) => {
            this.isLoading = false;
            const products: Product[] = productsResponse.product || [];
            this.router.navigate(['/product-table'], {
              state: { products, locationId: String(locationId) }
            });
          },
          error: () => {
            this.isLoading = false;
            this.errorMessage = 'Cash register opened but failed to load products.';
          }
        });
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 401) {
          this.errorMessage = 'Session expired. Please login again.';
          setTimeout(() => this.router.navigate(['/login']), 1000);
        } else {
          this.errorMessage = err?.error?.message || 'Failed to open register. Try again.';
        }
      }
    });
  }
}
