import { Injectable, signal } from '@angular/core';
import { ApiService } from './api.service';

export interface LowStockItem {
  productId: number;
  productName: string;
  batchNumber: string;
  currentBalance: number;
  branchId: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  lowStockItems = signal<LowStockItem[]>([]);
  unreadCount = signal<number>(0);

  constructor(private api: ApiService) {
    this.refreshNotifications();
    // Refresh every 5 minutes
    setInterval(() => this.refreshNotifications(), 5 * 60 * 1000);
  }

  refreshNotifications() {
    this.api.get<LowStockItem[]>('BatchStock/GetLowStock').subscribe({
      next: (items) => {
        this.lowStockItems.set(items);
        this.unreadCount.set(items.length);
      },
      error: (err) => console.error('Error fetching low stock alerts', err)
    });
  }
}
