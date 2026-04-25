import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { CashRegister } from './features/user/cash-register/cash-register';
import { ProductTable } from './features/user/product-table/product-table';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },
    {
        path: 'login',
        component: Login
    },
    {
        path: 'cash-register',
        component: CashRegister
    },
    {
        path: 'product-table',
        component: ProductTable
    },
    {
        path: '**',
        redirectTo: 'login'
    }
];