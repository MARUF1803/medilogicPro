import { Injectable, signal, effect } from '@angular/core';
import { ApiService } from './api.service';

export interface LocalSale {
  id?: string;
  data: any;
  status: 'pending' | 'synced';
}

@Injectable({
  providedIn: 'root'
})
export class OfflineSyncService {
  isOnline = signal<boolean>(navigator.onLine);
  pendingCount = signal<number>(0);

  constructor(private api: ApiService) {
    window.addEventListener('online', () => this.isOnline.set(true));
    window.addEventListener('offline', () => this.isOnline.set(false));

    this.updatePendingCount();

    // Auto-sync when coming back online
    effect(() => {
      if (this.isOnline()) {
        this.sync();
      }
    });
  }

  saveOfflineSale(saleData: any) {
    const pending: LocalSale[] = JSON.parse(localStorage.getItem('pending_sales') || '[]');
    pending.push({
      id: Date.now().toString(),
      data: saleData,
      status: 'pending'
    });
    localStorage.setItem('pending_sales', JSON.stringify(pending));
    this.updatePendingCount();
  }

  private updatePendingCount() {
    const pending = JSON.parse(localStorage.getItem('pending_sales') || '[]');
    this.pendingCount.set(pending.length);
  }

  async sync() {
    const pending: LocalSale[] = JSON.parse(localStorage.getItem('pending_sales') || '[]');
    if (pending.length === 0) return;

    console.log(`Syncing ${pending.length} offline sales...`);
    
    const remaining: LocalSale[] = [];
    
    for (const sale of pending) {
      try {
        await this.api.post('SalesHistory/Create', sale.data).toPromise();
      } catch (err) {
        console.error('Failed to sync sale', err);
        remaining.push(sale);
      }
    }

    localStorage.setItem('pending_sales', JSON.stringify(remaining));
    this.updatePendingCount();
  }
}
