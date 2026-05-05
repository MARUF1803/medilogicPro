import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { CalculationService } from '../../core/services/calculation.service';

@Component({
  selector: 'app-ledger',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="animate-in main-container" style="padding-bottom: 60px;">
      <!-- Page Header -->
      <div class="flex justify-between items-center mb-8 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div class="flex items-center gap-5">
           <div style="padding: 16px; background: rgba(12, 99, 228, 0.1); border-radius: 20px; border: 1px solid rgba(12, 99, 228, 0.2);">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="3"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
           </div>
           <div>
              <h1 class="m-0" style="font-size: 28px; font-weight: 900; letter-spacing: -1px; color: #0f172a;">Financial General Ledger</h1>
              <p style="color: #64748b; font-weight: 600; font-size: 13px; margin-top: 2px; text-transform: uppercase; letter-spacing: 1px;">Debit/Credit audit trail & double-entry validation</p>
           </div>
        </div>
        <div class="flex gap-4 items-center">
          <div style="text-align: right; margin-right: 12px;">
             <div style="font-size: 10px; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">Entity Selection</div>
             <select class="form-input-custom" style="width: 300px;" [(ngModel)]="selectedPartyId" (change)="loadLedger()">
               <option [value]="null">🏢 Consolidated Enterprise View</option>
               @for (p of parties; track p.partyId) {
                 <option [value]="p.partyId">👤 {{ p.fullName }} ({{ p.partyType }})</option>
               }
             </select>
          </div>
        </div>
      </div>

      @if (loading) {
        <div class="loading-center">
           <div class="spinner"></div>
           <p style="font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 16px;">Reconciling Accounts...</p>
        </div>
      } @else {
        <div class="card p-0 overflow-hidden shadow-premium border border-slate-100" style="border-radius: 28px; background: white;">
          <table class="data-table">
            <thead>
              <tr style="background: #f8fafc;">
                <th style="padding-left: 32px;">Transaction Date</th>
                <th>Classification</th>
                <th>Reference / Narrative</th>
                <th class="text-right">Debit (In)</th>
                <th class="text-right">Credit (Out)</th>
                <th style="padding-right: 32px; text-align: right;">Cumulative Balance</th>
              </tr>
            </thead>
            <tbody>
              @for (entry of entries; track entry.ledgerId; let idx = $index) {
                <tr class="hover-row animate-in" style="animation-delay: {{ idx * 0.02 }}s">
                  <td style="padding-left: 32px; font-weight: 800; color: #475569;">{{ entry.transactionDate | date:'mediumDate' }}</td>
                  <td>
                    <span class="type-badge" 
                      [class.sale]="entry.transactionType?.includes('Sale')" 
                      [class.purchase]="entry.transactionType?.includes('Purchase')" 
                      [class.return]="entry.transactionType?.includes('Return')" 
                      [class.payment]="entry.transactionType?.includes('Payment')">
                      {{ entry.transactionType }}
                    </span>
                  </td>
                  <td>
                    <div style="font-weight: 900; color: #0f172a; font-size: 15px;">{{ entry.referenceNo || 'N/A' }}</div>
                    <div style="font-size: 12px; font-weight: 600; color: #94a3b8; margin-top: 2px;">{{ entry.description }}</div>
                  </td>
                  <td class="text-right" style="font-weight: 800; color: #be123c;">{{ entry.debitAmount ? calc.formatCurrency(entry.debitAmount) : '—' }}</td>
                  <td class="text-right" style="font-weight: 800; color: #15803d;">{{ entry.creditAmount ? calc.formatCurrency(entry.creditAmount) : '—' }}</td>
                  <td style="padding-right: 32px; text-align: right;">
                    <div style="font-size: 18px; font-weight: 950;" [style.color]="entry.balance < 0 ? '#ef4444' : '#10b981'">
                      {{ calc.formatCurrency(entry.balance || 0) }}
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="6" class="text-center p-20 text-slate-400 font-bold uppercase tracking-widest">No ledger records found for this scope.</td></tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
  styles: [`
    .main-container { max-width: 1400px; margin: 0 auto; }
    .loading-center { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 120px; }
    .spinner { width: 44px; height: 44px; border: 4px solid rgba(14, 165, 233, 0.1); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .form-input-custom { height: 52px; border-radius: 16px; border: 2px solid #f1f5f9; background: #f8fafc; padding: 0 20px; font-size: 14px; font-weight: 800; outline: none; transition: all 0.2s; color: #0f172a; }
    .form-input-custom:focus { border-color: var(--primary); background: white; box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.1); }
    .hover-row { transition: all 0.2s; border-bottom: 1.5px solid #f1f5f9; }
    .hover-row:hover { background: #f8fafc !important; transform: scale(1.001); }
    .type-badge { font-size: 10px; font-weight: 950; letter-spacing: 1px; padding: 6px 12px; border-radius: 8px; text-transform: uppercase; }
    .type-badge.sale { background: rgba(14, 165, 233, 0.1); color: #0c63e4; }
    .type-badge.purchase { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }
    .type-badge.return { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
    .type-badge.payment { background: rgba(16, 185, 129, 0.1); color: #10b981; }
    .animate-in { animation: slideUpFade 0.5s cubic-bezier(0.16, 1, 0.3, 1) both; }
    @keyframes slideUpFade { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .data-table th { padding: 24px 20px; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 900; color: #64748b; }
  `]
})
export class LedgerComponent implements OnInit {
  entries: any[] = [];
  parties: any[] = [];
  selectedPartyId: number | null = null;
  loading = true;

  constructor(private api: ApiService, public calc: CalculationService) {}

  ngOnInit(): void {
    this.loadParties();
    this.loadLedger();
  }

  loadParties() {
    this.api.get<any[]>('Party').subscribe(data => this.parties = data);
  }

  loadLedger() {
    this.loading = true;
    const url = this.selectedPartyId ? `Report/Ledger?partyId=${this.selectedPartyId}` : 'Report/Ledger';
    this.api.get<any[]>(url).subscribe({
      next: (data) => { 
        this.entries = data; 
        this.loading = false; 
      },
      error: () => { this.entries = []; this.loading = false; }
    });
  }
}
