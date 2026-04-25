import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environment/environment';

export interface LoginPayload {
  username: string;
  password: number;
}

export interface LoginResponse {
  token?: string;
  access_token?: string;
  message?: string;
  locations?: Location[];
  user?: {
    id: number | string;
    username: string;
    email?: string;
    role?: string;
  };
  [key: string]: any;
}

export interface CashRegisterPayload {
  amount: number;
  location_id: string;
}

export interface CashRegisterData {
  id: number;
  business_id: number;
  location_id: number | null;
  user_id: number;
  status: string;
  closing_amount: string;
  created_at: string;
  updated_at: string;
}

export interface CashRegisterResponse {
  message?: string;
  data?: CashRegisterData;
  [key: string]: any;
}

export interface Product {
  product_id: string;
  category_id: string;
  name: string;
  type: string;
  tax_type: string;
  enable_stock: string;
  variation_id: string;
  variation: string;
  qty_available: string;
  sub_sku: string;
  unit: string;
  barcode: string;
  selling_price: string;
  image_url: string;
}

export interface ProductsResponse {
  product: Product[];
}


export interface Payment {
  type: string;
  key: string;
}

export interface CashRegisterInfo {
  id: number;
  status: string;
  closing_amount: string;
}

export interface Location {
  id: number;
  location_id: string;
  name: string;
  city: string;
  state: string;
  zip_code: string;
  payment: Payment[];
  cashRegister: CashRegisterInfo | null;
}


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = environment.apiUrl;

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  };

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: object
  ) { }

  private getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  login(payload: LoginPayload): Observable<LoginResponse> {
    const url = `${this.apiUrl}/login`;
    return this.http.post<LoginResponse>(url, payload, this.httpOptions).pipe(
      map((response) => response),
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  openCashRegister(payload: CashRegisterPayload): Observable<CashRegisterResponse> {
    const url = `${this.apiUrl}/cash-register/create`;
    return this.http
      .post<CashRegisterResponse>(url, payload, { headers: this.getAuthHeaders() })
      .pipe(
        map((response) => response),
        catchError((error) => {
          return throwError(() => error);
        })
      );
  }

  getProducts(locationId: number | string): Observable<ProductsResponse> {
    const url = `${this.apiUrl}/products/list`;
    const params = new HttpParams().set('location_id', String(locationId));
    return this.http
      .get<ProductsResponse>(url, { headers: this.getAuthHeaders(), params })
      .pipe(
        catchError((error) => {
          return throwError(() => error);
        })
      );
  }

  isLoggedIn(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    return !!token;
  }

  getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  }

  getLoginResponse(): any {
    if (!isPlatformBrowser(this.platformId)) return null;
    const raw = sessionStorage.getItem('loginResponse') || localStorage.getItem('loginResponse');
    return raw ? JSON.parse(raw) : null;
  }

  getLocations(): Location[] {
    const response = this.getLoginResponse();
    return response?.locations || [];
  }
}