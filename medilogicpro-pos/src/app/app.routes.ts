import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { AuthCallbackComponent } from './modules/auth-callback/auth-callback.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';

export const routes: Routes = [
  // Auth callback — no guard, this is the entry point from MVC
  { path: 'auth-callback', component: AuthCallbackComponent },

  // Protected routes — inside main layout
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'reports', pathMatch: 'full' },
      {
        path: 'pos',
        loadComponent: () => import('./modules/pos/pos.component').then(m => m.PosComponent)
      },
      {
        path: 'sales',
        loadComponent: () => import('./modules/sales-history/sales-history.component').then(m => m.SalesHistoryComponent)
      },
      {
        path: 'sales-returns',
        loadComponent: () => import('./modules/sales-returns/sales-returns.component').then(m => m.SalesReturnsComponent)
      },
      {
        path: 'sales-returns/create',
        loadComponent: () => import('./modules/sales-return-create/sales-return-create.component').then(m => m.SalesReturnCreateComponent)
      },
      {
        path: 'purchase',
        loadComponent: () => import('./modules/purchase-history/purchase-history.component').then(m => m.PurchaseHistoryComponent)
      },
      { 
        path: 'purchase/create', 
        loadComponent: () => import('./modules/purchase-create/purchase-create.component').then(m => m.PurchaseCreateComponent)
      },
      {
        path: 'purchase-returns',
        loadComponent: () => import('./modules/purchase-returns/purchase-returns.component').then(m => m.PurchaseReturnsComponent)
      },
      { 
        path: 'purchase-returns/create', 
        loadComponent: () => import('./modules/purchase-return-create/purchase-return-create.component').then(m => m.PurchaseReturnCreateComponent)
      },
      {
        path: 'inventory',
        loadComponent: () => import('./modules/inventory/inventory.component').then(m => m.InventoryComponent)
      },
      {
        path: 'products',
        loadComponent: () => import('./modules/products/product-list.component').then(m => m.ProductListComponent)
      },
      {
        path: 'ledger',
        loadComponent: () => import('./modules/ledger/ledger.component').then(m => m.LedgerComponent)
      },
      {
        path: 'party-statement',
        loadComponent: () => import('./modules/party-statement/party-statement.component').then(m => m.PartyStatementComponent)
      },
      {
        path: 'reports',
        loadComponent: () => import('./modules/reports/reports.component').then(m => m.ReportsComponent)
      }
    ]
  },

  // Fallback
  { path: '**', redirectTo: 'reports' }
];
