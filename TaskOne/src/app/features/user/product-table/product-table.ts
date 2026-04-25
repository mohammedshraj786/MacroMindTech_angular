import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, Product } from '../../../core/service/app.service';

@Component({
  selector: 'app-product-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-table.html',
  styleUrls: ['./product-table.css']
})
export class ProductTable implements OnInit {

  products: Product[] = [];
  locationId: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    const state = history.state as { products?: Product[]; locationId?: string };

    if (state?.products) {
      this.products = state.products;
      this.locationId = state.locationId ?? '';
    } else {
      this.route.queryParams.subscribe(params => {
        this.locationId = params['location_id'] ?? '';
        if (this.locationId !== '') {
          this.loadProducts();
        }
      });
    }
  }

  loadProducts(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.getProducts(this.locationId).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.products = response.product;
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 401) {
          this.errorMessage = 'Session expired. Please login again.';
          setTimeout(() => this.router.navigate(['/login']), 1500);
        } else {
          this.errorMessage = err?.error?.message || 'Failed to load products.';
        }
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/cash-register']);
  }
}