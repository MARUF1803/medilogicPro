import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { CalculationService } from '../../core/services/calculation.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="animate-in main-container" style="padding-bottom: 60px;">
      <!-- Dashboard Header -->
      <div class="flex justify-between items-center mb-10 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div class="flex items-center gap-6">
           <div style="padding: 16px; background: rgba(12, 99, 228, 0.1); border-radius: 22px; border: 1px solid rgba(12, 99, 228, 0.2);">
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="3"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
           </div>
           <div>
              <h1 class="m-0" style="font-size: 32px; font-weight: 950; letter-spacing: -1.5px; color: #0f172a;">Executive Intel Dashboard</h1>
              <p style="color: #64748b; font-weight: 600; font-size: 14px; margin-top: 2px; text-transform: uppercase; letter-spacing: 1.5px;">Real-time enterprise performance metrics & Predictive analytics</p>
           </div>
        </div>
        <div class="flex items-center gap-3">
           <div style="text-align: right;">
              <div style="font-size: 10px; font-weight: 950; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 2px;">Data Status</div>
              <div style="font-size: 14px; font-weight: 800; color: #10b981;" class="flex items-center gap-2">
                 <div style="width: 8px; height: 8px; background: #10b981; border-radius: 50%; box-shadow: 0 0 10px #10b981;"></div>
                 LIVE SYNCHRONIZED
              </div>
           </div>
        </div>
      </div>

      @if (loading) {
        <div class="loading-center">
           <div class="spinner"></div>
           <p style="font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 16px;">Compiling intelligence data...</p>
        </div>
      } @else {
        <!-- Primary KPI Matrix -->
        <div class="kpi-grid mb-10">
          <div class="kpi-card blue" (click)="showDetails('sales')">
            <div class="kpi-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg></div>
            <div class="kpi-info">
               <div class="kpi-label">Sales Velocity (Daily)</div>
               <div class="kpi-value">{{ calc.formatCurrency(stats?.todaySales) }}</div>
               <div class="kpi-trend up">↑ 12.4% vs Previous</div>
            </div>
          </div>

          <div class="kpi-card purple" (click)="showDetails('purchases')">
            <div class="kpi-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></div>
            <div class="kpi-info">
               <div class="kpi-label">Inward Procurement</div>
               <div class="kpi-value">{{ calc.formatCurrency(stats?.todayPurchase) }}</div>
               <div class="kpi-trend">Consistent Flow</div>
            </div>
          </div>

          <div class="kpi-card emerald">
            <div class="kpi-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg></div>
            <div class="kpi-info">
               <div class="kpi-label">Liquid Stock Value</div>
               <div class="kpi-value">{{ calc.formatCurrency(stats?.totalStockValue) }}</div>
               <div class="kpi-trend up">↑ 4.2% Asset Growth</div>
            </div>
          </div>

          <div class="kpi-card rose" (click)="showDetails('expenses')">
            <div class="kpi-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div>
            <div class="kpi-info">
               <div class="kpi-label">Operational Burn</div>
               <div class="kpi-value">{{ calc.formatCurrency(stats?.todayExpense) }}</div>
               <div class="kpi-trend down">↓ 2.1% Optimized</div>
            </div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 32px; margin-bottom: 32px;">
           <!-- Inventory Crisis Center -->
           <div class="data-container">
              <div class="container-header">
                 <h3 class="container-title">Inventory Replenishment Queue</h3>
                 <span class="badge-tag red">URGENT ACTION REQ</span>
              </div>
              <div class="overflow-hidden">
                  <table class="premium-table">
                     <thead>
                        <tr><th>Medication / Dosage</th><th class="text-center">Current Ledger</th><th>Replenishment Status</th><th class="text-right">Action</th></tr>
                     </thead>
                     <tbody>
                        @for (p of lowStockProducts; track p.productId; let idx = $index) {
                           <tr class="animate-in" style="animation-delay: {{ idx * 0.05 }}s">
                              <td>
                                 <div style="font-weight: 900; color: #0f172a;">{{ p.productName }}</div>
                                 <div style="font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase;">MASTER REF #{{ p.productId }}</div>
                              </td>
                              <td class="text-center"><span class="badge-stock-low">{{ p.currentBalance }}</span></td>
                              <td><span class="badge-status yellow">STOCK DEPLETION</span></td>
                              <td class="text-right"><button class="btn-micro">ORDER NOW</button></td>
                           </tr>
                        }
                     </tbody>
                  </table>
              </div>
           </div>

           <!-- Intelligence Alerts -->
           <div class="data-container">
              <div class="container-header">
                 <h3 class="container-title">Expiration Forensics</h3>
                 <div class="kpi-icon-sm red"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg></div>
              </div>
              
              <div style="margin-bottom: 32px;">
                  <div class="flex justify-between items-end mb-4">
                     <div>
                        <div style="font-size: 11px; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 2px;">At-Risk Exposure</div>
                        <div style="font-size: 28px; font-weight: 950; color: #ef4444;">{{ expiryStats?.highRiskCount || 0 }} SKU<span style="font-size: 12px; opacity: 0.5; margin-left: 4px;">S</span></div>
                     </div>
                     <div class="text-right">
                        <div style="font-size: 13px; font-weight: 950; color: #0f172a;">{{ ((expiryStats?.highRiskCount || 0) / 10 * 100).toFixed(1) }}%</div>
                     </div>
                  </div>
                  <div class="premium-progress-track"><div class="progress-fill-red" [style.width.%]="((expiryStats?.highRiskCount || 0) / 10) * 100"></div></div>
                  <div class="mt-4 p-4 rounded-2xl bg-rose-50 border border-rose-100">
                     <div style="font-size: 11px; font-weight: 900; color: #be123c; text-transform: uppercase; letter-spacing: 1px;">Potential Financial Loss</div>
                     <div style="font-size: 20px; font-weight: 950; color: #ef4444; margin-top: 4px;">{{ calc.formatCurrency(expiryStats?.highRiskValue) }}</div>
                  </div>
              </div>

              <div class="strategy-box">
                  <div style="font-weight: 950; color: var(--primary); font-size: 12px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px;">Clinical Strategy</div>
                  <p style="margin: 0; font-size: 13px; font-weight: 700; color: #475569; line-height: 1.5;">Execute "First-Expire-First-Out" (FEFO) protocol for <b>{{ expiryStats?.highRiskCount }}</b> identified batches immediately.</p>
              </div>
           </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 440px; gap: 32px;">
           <!-- Transactional Trend -->
           <div class="data-container">
              <div class="container-header">
                 <h3 class="container-title">Volume Analytics (30-Day Velocity)</h3>
                 <div class="flex gap-2">
                    <span class="badge-tag blue">TRENDING UP</span>
                 </div>
              </div>
              <div class="premium-chart">
                @for (t of salesTrend; track $index) {
                  <div class="premium-bar-wrapper">
                    <div class="premium-bar" [style.height.%]="(t.amount / maxTrendAmount) * 100">
                        <div class="bar-tooltip">{{ calc.formatCurrency(t.amount) }}<br/>{{ t.date | date:'MMM d' }}</div>
                    </div>
                  </div>
                }
              </div>
              <div class="flex justify-between mt-6 px-2">
                 <span style="font-size: 11px; font-weight: 900; color: #94a3b8; text-transform: uppercase;">{{ salesTrend[0]?.date | date:'mediumDate' }}</span>
                 <div style="height: 1.5px; flex: 1; background: #f1f5f9; margin: 8px 24px;"></div>
                 <span style="font-size: 11px; font-weight: 900; color: #94a3b8; text-transform: uppercase;">{{ salesTrend[salesTrend.length-1]?.date | date:'mediumDate' }}</span>
              </div>
           </div>

           <!-- Market Leaders -->
           <div class="data-container">
              <div class="container-header">
                 <h3 class="container-title">Top Revenue Contributors</h3>
                 <div class="kpi-icon-sm emerald"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></div>
              </div>
              <div class="premium-list">
                @for (p of topProducts; track p.productId; let idx = $index) {
                  <div class="premium-list-item animate-in" style="animation-delay: {{ idx * 0.05 }}s">
                     <div class="flex items-center gap-4">
                        <div class="rank-circle">{{ idx + 1 }}</div>
                        <div>
                           <div style="font-weight: 950; color: #0f172a; font-size: 16px;">{{ p.productName }}</div>
                           <div style="font-size: 11px; font-weight: 700; color: #94a3b8;">DISPENSED: {{ p.totalQuantity }} UNITS</div>
                        </div>
                     </div>
                     <div class="text-right">
                        <div style="font-size: 18px; font-weight: 950; color: var(--primary);">{{ calc.formatCurrency(p.totalRevenue) }}</div>
                        <div style="font-size: 10px; font-weight: 900; color: #10b981;">↑ CAPTURE HIGH</div>
                     </div>
                  </div>
                }
              </div>
           </div>
        </div>
      }

      <!-- Detailed Analytics Modal -->
      @if (showModal) {
        <div class="modal-backdrop" (click)="showModal = false">
          <div class="modal-content animate-in shadow-premium" (click)="$event.stopPropagation()" style="width: 1000px; border-radius: 36px; background: white; border: none; overflow: hidden;">
             <div style="padding: 32px 48px; border-bottom: 1.5px solid #f1f5f9; background: #f8fafc;" class="flex justify-between items-center">
                <div>
                   <h2 style="margin: 0; font-size: 24px; font-weight: 950; color: #0f172a; letter-spacing: -0.5px;">{{ modalTitle }}</h2>
                   <div style="font-size: 12px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px;">Deep-dive transaction auditing</div>
                </div>
                <button class="btn-close" (click)="showModal = false">&times;</button>
             </div>
             <div style="padding: 40px 48px; max-height: 70vh; overflow-y: auto;">
                @if (loadingDetails) {
                   <div class="loading-center" style="padding: 60px;"><div class="spinner"></div></div>
                } @else {
                   <table class="premium-table">
                      <thead>
                         <tr>
                            @for (h of modalHeaders; track h) { <th [style.text-align]="h === 'Amount' ? 'right' : 'left'">{{ h }}</th> }
                         </tr>
                      </thead>
                      <tbody>
                         @for (row of modalData; track $index) {
                            <tr class="hover-row">
                               @for (cell of row; track $index) { 
                                  <td [style.text-align]="row.indexOf(cell) === 2 ? 'right' : 'left'" [style.font-weight]="row.indexOf(cell) === 2 ? '950' : '700'">{{ cell }}</td> 
                               }
                            </tr>
                         }
                      </tbody>
                   </table>
                }
             </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .main-container { max-width: 1440px; margin: 0 auto; }
    .loading-center { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 120px; }
    .spinner { width: 44px; height: 44px; border: 4px solid rgba(14, 165, 233, 0.1); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
    .kpi-card { background: white; border: 1.5px solid #f1f5f9; padding: 28px; border-radius: 28px; display: flex; align-items: center; gap: 24px; cursor: pointer; transition: all 0.3s; position: relative; overflow: hidden; }
    .kpi-card:hover { transform: translateY(-6px); box-shadow: 0 15px 30px -10px rgba(0,0,0,0.1); border-color: var(--primary); }
    .kpi-icon { width: 56px; height: 56px; border-radius: 18px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .kpi-card.blue .kpi-icon { background: rgba(14, 165, 233, 0.1); color: #0c63e4; }
    .kpi-card.purple .kpi-icon { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }
    .kpi-card.emerald .kpi-icon { background: rgba(16, 185, 129, 0.1); color: #10b981; }
    .kpi-card.rose .kpi-icon { background: rgba(244, 63, 94, 0.1); color: #f43f5e; }
    
    .kpi-label { font-size: 11px; font-weight: 950; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
    .kpi-value { font-size: 24px; font-weight: 950; color: #0f172a; letter-spacing: -1px; }
    .kpi-trend { font-size: 11px; font-weight: 900; margin-top: 6px; }
    .kpi-trend.up { color: #10b981; }
    .kpi-trend.down { color: #ef4444; }
    
    .data-container { background: white; border: 1.5px solid #f1f5f9; border-radius: 32px; padding: 32px; }
    .container-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .container-title { font-size: 18px; font-weight: 950; color: #0f172a; margin: 0; letter-spacing: -0.5px; }
    
    .premium-table { width: 100%; }
    .premium-table th { padding: 16px 12px; font-size: 11px; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; border-bottom: 1.5px solid #f1f5f9; }
    .premium-table td { padding: 20px 12px; border-bottom: 1.5px solid #f8fafc; font-size: 14px; vertical-align: middle; }
    
    .badge-tag { font-size: 10px; font-weight: 950; letter-spacing: 1px; padding: 6px 14px; border-radius: 10px; }
    .badge-tag.red { background: #fff1f2; color: #ef4444; }
    .badge-tag.blue { background: #eff6ff; color: #0c63e4; }
    
    .badge-stock-low { display: inline-flex; width: 32px; height: 32px; background: #fff1f2; color: #ef4444; border-radius: 10px; align-items: center; justify-content: center; font-weight: 950; font-size: 15px; }
    .badge-status { font-size: 10px; font-weight: 950; padding: 5px 12px; border-radius: 8px; }
    .badge-status.yellow { background: #fffbeb; color: #f59e0b; }
    
    .btn-micro { padding: 8px 16px; background: #0f172a; color: white; border: none; border-radius: 10px; font-size: 11px; font-weight: 900; cursor: pointer; transition: all 0.2s; }
    .btn-micro:hover { background: var(--primary); transform: translateY(-2px); box-shadow: 0 4px 10px rgba(14, 165, 233, 0.3); }
    
    .premium-progress-track { height: 10px; background: #f1f5f9; border-radius: 5px; overflow: hidden; }
    .progress-fill-red { height: 100%; background: linear-gradient(90deg, #f43f5e, #ef4444); border-radius: 5px; }
    
    .strategy-box { background: #f8fafc; border: 1.5px dashed #e2e8f0; padding: 20px; border-radius: 24px; }
    
    .premium-chart { display: flex; align-items: flex-end; gap: 10px; height: 180px; padding: 20px 10px 0; border-bottom: 2px solid #f1f5f9; }
    .premium-bar-wrapper { flex: 1; height: 100%; display: flex; align-items: flex-end; position: relative; }
    .premium-bar { width: 100%; background: linear-gradient(to top, var(--primary), #38bdf8); border-radius: 8px 8px 0 0; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); cursor: pointer; }
    .premium-bar:hover { background: #0f172a; transform: scaleX(1.1); }
    .bar-tooltip { position: absolute; top: -50px; left: 50%; transform: translateX(-50%); background: #0f172a; color: white; padding: 8px 14px; border-radius: 12px; font-size: 11px; font-weight: 800; opacity: 0; pointer-events: none; transition: 0.2s; white-space: nowrap; box-shadow: 0 10px 20px rgba(0,0,0,0.2); }
    .premium-bar:hover .bar-tooltip { opacity: 1; top: -60px; }
    
    .premium-list-item { display: flex; justify-content: space-between; align-items: center; padding: 20px 0; border-bottom: 1.5px solid #f1f5f9; transition: all 0.2s; }
    .premium-list-item:last-child { border: none; }
    .rank-circle { width: 36px; height: 36px; background: #f1f5f9; color: #64748b; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 950; font-size: 14px; }
    .premium-list-item:hover .rank-circle { background: var(--primary); color: white; }
    
    .modal-backdrop { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.8); backdrop-filter: blur(12px); z-index: 2000; display: flex; align-items: center; justify-content: center; }
    .btn-close { width: 44px; height: 44px; border-radius: 50%; border: none; background: #fff; color: #64748b; font-size: 28px; font-weight: 300; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
    .hover-row:hover { background: #f8fafc !important; }
    
    .animate-in { animation: slideUpFade 0.5s cubic-bezier(0.16, 1, 0.3, 1) both; }
    @keyframes slideUpFade { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    
    .kpi-icon-sm { width: 32px; height: 32px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
    .kpi-icon-sm.red { background: #fff1f2; color: #ef4444; }
    .kpi-icon-sm.emerald { background: #ecfdf5; color: #10b981; }
  `]
})
export class ReportsComponent implements OnInit {
  loading = true;
  stats: any = null;
  salesTrend: any[] = [];
  topProducts: any[] = [];
  lowStockProducts: any[] = [];
  expiryStats: any = null;
  maxTrendAmount = 1;

  showModal = false;
  modalTitle = '';
  modalHeaders: string[] = [];
  modalData: any[] = [];
  loadingDetails = false;

  constructor(private api: ApiService, public calc: CalculationService) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats() {
    this.loading = true;
    forkJoin({
      stats: this.api.get<any>('Report/DashboardStats'),
      trend: this.api.get<any[]>('Report/SalesTrend'),
      top: this.api.get<any[]>('Report/TopProducts'),
      lowStock: this.api.get<any[]>('Report/LowStock'),
      expiry: this.api.get<any>('Report/ExpiryRisk')
    }).subscribe({
      next: (res) => {
        this.stats = res.stats;
        this.salesTrend = res.trend;
        this.topProducts = res.top;
        this.lowStockProducts = res.lowStock;
        this.expiryStats = res.expiry;
        this.maxTrendAmount = Math.max(...this.salesTrend.map(t => t.amount), 1);
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  showDetails(type: string) {
    this.showModal = true;
    this.loadingDetails = true;
    if (type === 'sales') {
      this.modalTitle = 'Daily Revenue Transaction Audit';
      this.modalHeaders = ['Reference ID', 'Client / Party', 'Capture Amount', 'Gateway'];
      this.api.get<any[]>('Report/TodaySalesDetails').subscribe(data => {
        this.modalData = data.map(d => [d.invoiceNo, d.customerName || 'Walk-in Consumer', this.calc.formatCurrency(d.netAmount), d.paymentMethod]);
        this.loadingDetails = false;
      });
    } else if (type === 'purchases') {
      this.modalTitle = 'Procurement Inward Logistics';
      this.modalHeaders = ['PO Reference', 'Supplier / Lab', 'Valuation'];
      this.api.get<any[]>('Report/TodayPurchaseDetails').subscribe(data => {
        this.modalData = data.map(d => [d.invoiceNo, d.supplierName, this.calc.formatCurrency(d.totalAmount)]);
        this.loadingDetails = false;
      });
    } else if (type === 'expenses') {
      this.modalTitle = 'Operational Expenditure Audit';
      this.modalHeaders = ['Category', 'Narrative', 'Disbursement'];
      this.api.get<any[]>('Report/TodayExpenseDetails').subscribe(data => {
        this.modalData = data.map(d => [d.category, d.description, this.calc.formatCurrency(d.amount)]);
        this.loadingDetails = false;
      });
    }
  }
}
