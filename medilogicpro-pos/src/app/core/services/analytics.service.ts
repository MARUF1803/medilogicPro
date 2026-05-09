import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  constructor(private api: ApiService) {}

  getDashboardData(): Observable<any> {
    return this.api.get<any>('analytics/dashboard');
  }

  getRedZoneAlerts(): Observable<any[]> {
    return this.api.get<any[]>('analytics/red-zone');
  }

  getBarcodeProduct(code: string, branchId: number): Observable<any> {
    return this.api.get<any>(`barcode/${code}?branchId=${branchId}`);
  }

  uploadPrescription(salesId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.api.post<any>(`prescription/upload/${salesId}`, formData);
  }
}
