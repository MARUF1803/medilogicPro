import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { PdfService } from '../../core/services/pdf.service';
import { CalculationService } from '../../core/services/calculation.service';
import { Subject, debounceTime, switchMap, of } from 'rxjs';

@Component({
  selector: 'app-party-statement',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="animate-in main-container" style="padding-bottom: 60px;">
      <!-- Page Header -->
      <div class="flex justify-between items-center mb-8 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div class="flex items-center gap-5">
           <div style="padding: 16px; background: rgba(14, 165, 233, 0.1); border-radius: 20px; border: 1px solid rgba(14, 165, 233, 0.2);">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="3"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
           </div>
           <div>
              <h1 class="m-0" style="font-size: 28px; font-weight: 900; letter-spacing: -1px; color: #0f172a;">Relationship Statements</h1>
              <p style="color: #64748b; font-weight: 600; font-size: 13px; margin-top: 2px; text-transform: uppercase; letter-spacing: 1px;">Itemized transaction history for Suppliers & Customers</p>
           </div>
        </div>
      </div>

      <div class="flex gap-8 items-start">
         <!-- Left: Search & Profile -->
         <div style="width: 400px; position: sticky; top: 20px;">
            <div class="card p-7 mb-6" style="border-radius: 28px; box-shadow: var(--shadow-sm); border: 1px solid rgba(226, 232, 240, 0.6); position: relative;">
               <label style="font-size: 11px; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 12px; display: block;">Search Entity</label>
               <div style="height: 56px; background: #f8fafc; border: 2.5px solid #e2e8f0; border-radius: 18px; padding: 0 20px; display: flex; align-items: center; gap: 15px;">
                 <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                 <input type="text" (input)="onPartySearch($event)" style="border: none; background: transparent; width: 100%; outline: none; font-weight: 800; font-size: 15px;" placeholder="Name or Phone number..." />
               </div>

               @if (partyResults.length > 0) {
                 <div class="animate-in" style="position: absolute; width: calc(100% - 56px); z-index: 100; border-radius: 20px; box-shadow: var(--shadow-premium); background: white; border: 1px solid #e2e8f0; top: 105px; overflow: hidden;">
                   @for (p of partyResults; track p.partyId) {
                     <div class="search-item" (click)="selectParty(p)">
                       <div style="font-weight: 900; color: #0f172a;">{{ p.fullName }}</div>
                       <div style="font-size: 12px; font-weight: 700; color: #64748b; margin-top: 2px;">{{ p.phoneNumber }} • <span style="color: var(--primary)">{{ p.partyType }}</span></div>
                     </div>
                   }
                 </div>
               }
            </div>

            @if (selectedParty) {
               <div class="card p-7 animate-in" style="border-radius: 28px; background: white; box-shadow: var(--shadow-md); border: none;">
                  <div class="flex items-center gap-4 mb-8">
                     <div style="width: 64px; height: 64px; background: linear-gradient(135deg, var(--primary), #0c63e4); border-radius: 20px; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 10px 20px -5px rgba(14, 165, 233, 0.4);">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                     </div>
                     <div>
                        <h2 style="margin:0; font-size: 24px; font-weight: 950; color: #0f172a; letter-spacing: -0.5px;">{{ selectedParty.fullName }}</h2>
                        <span style="font-size: 11px; font-weight: 950; letter-spacing: 1px; color: var(--primary); text-transform: uppercase;">{{ selectedParty.partyType }} ACCOUNT</span>
                     </div>
                  </div>

                  <div class="space-y-4 mb-8">
                     <div class="flex justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <span style="font-size: 13px; font-weight: 800; color: #64748b;">Phone Number</span>
                        <span style="font-weight: 900; color: #0f172a;">{{ selectedParty.phoneNumber || '—' }}</span>
                     </div>
                     <div class="flex justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <span style="font-size: 13px; font-weight: 800; color: #64748b;">Total Inward</span>
                        <span style="font-weight: 950; color: #10b981;">{{ calc.formatCurrency(totalCredit) }}</span>
                     </div>
                     <div class="flex justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <span style="font-size: 13px; font-weight: 800; color: #64748b;">Total Outward</span>
                        <span style="font-weight: 950; color: #ef4444;">{{ calc.formatCurrency(totalDebit) }}</span>
                     </div>
                  </div>

                  <button class="btn btn-primary btn-block" style="height: 64px; border-radius: 20px; font-size: 18px; font-weight: 900;" (click)="printStatement()">
                     <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="margin-right: 12px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                     Generate PDF Audit
                  </button>
               </div>
            }
         </div>

         <!-- Right: Transaction Table -->
         <div class="flex-1">
            @if (selectedParty) {
               <div class="card p-0 overflow-hidden shadow-premium border border-slate-100 animate-in" style="border-radius: 32px; background: white;">
                  <table class="data-table">
                    <thead>
                      <tr style="background: #f8fafc;">
                        <th style="padding-left: 32px;">Transaction Date</th>
                        <th>Type</th>
                        <th>Reference ID</th>
                        <th class="text-right">Debit</th>
                        <th class="text-right">Credit</th>
                        <th style="padding-right: 32px; text-align: right;">Cumulative</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (t of transactions; track $index; let idx = $index) {
                        <tr class="animate-in" style="animation-delay: {{ idx * 0.02 }}s; border-bottom: 1.5px solid #f1f5f9;">
                          <td style="padding-left: 32px; font-weight: 800; color: #475569;">{{ t.transactionDate | date:'mediumDate' }}</td>
                          <td>
                             <span class="type-badge" [class.sale]="t.type === 'Sale'" [class.purchase]="t.type === 'Purchase'">{{ t.type }}</span>
                          </td>
                          <td style="font-weight: 900; color: #0f172a; font-size: 15px;">{{ t.referenceNo }}</td>
                          <td class="text-right" style="font-weight: 800; color: #ef4444;">{{ t.debit ? calc.formatCurrency(t.debit) : '—' }}</td>
                          <td class="text-right" style="font-weight: 800; color: #10b981;">{{ t.credit ? calc.formatCurrency(t.credit) : '—' }}</td>
                          <td style="padding-right: 32px; text-align: right; font-size: 18px; font-weight: 950; color: #0f172a;">
                             {{ calc.formatCurrency(t.balance) }}
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                  @if (transactions.length === 0 && !loading) {
                     <div style="padding: 100px 0; text-align: center;">
                        <div style="font-size: 14px; font-weight: 800; color: #cbd5e1; text-transform: uppercase; letter-spacing: 2px;">No transactional history found</div>
                     </div>
                  }
               </div>
            } @else {
               <div class="flex flex-col items-center justify-center p-40 bg-white rounded-3xl border-2 border-dashed border-slate-200 shadow-sm animate-in">
                  <div style="width: 100px; height: 100px; background: #f1f5f9; border-radius: 30px; display: flex; align-items: center; justify-content: center; color: #cbd5e1; margin-bottom: 24px;">
                     <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </div>
                  <h2 style="color: #94a3b8; font-weight: 900; letter-spacing: -1px; margin: 0;">Select an Entity</h2>
                  <p style="color: #cbd5e1; font-weight: 800; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin-top: 8px;">Use search bar to audit specific accounts</p>
               </div>
            }
         </div>
      </div>
    </div>
  `,
  styles: [`
    .main-container { max-width: 1400px; margin: 0 auto; }
    .search-item { padding: 15px 20px; border-bottom: 1.5px solid #f8fafc; cursor: pointer; transition: background 0.2s; }
    .search-item:hover { background: #f1f5f9; }
    .type-badge { font-size: 10px; font-weight: 950; letter-spacing: 1px; padding: 6px 12px; border-radius: 8px; text-transform: uppercase; }
    .type-badge.sale { background: rgba(16, 185, 129, 0.1); color: #10b981; }
    .type-badge.purchase { background: rgba(14, 165, 233, 0.1); color: #0c63e4; }
    .animate-in { animation: slideUpFade 0.5s cubic-bezier(0.16, 1, 0.3, 1) both; }
    @keyframes slideUpFade { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .data-table th { padding: 24px 20px; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 900; color: #64748b; }
  `]
})
export class PartyStatementComponent implements OnInit {
  partyResults: any[] = [];
  selectedParty: any = null;
  transactions: any[] = [];
  loading = false;
  totalDebit = 0;
  totalCredit = 0;
  private partySubject = new Subject<string>();

  constructor(private api: ApiService, private pdf: PdfService, public calc: CalculationService) {}

  ngOnInit(): void {
    this.partySubject.pipe(
      debounceTime(400),
      switchMap(t => t ? this.api.get<any[]>(`Party/Search/${t}`) : of([]))
    ).subscribe(r => this.partyResults = r);
  }

  onPartySearch(e: Event) {
    const val = (e.target as HTMLInputElement).value;
    this.partySubject.next(val);
  }

  selectParty(p: any) {
    this.selectedParty = p;
    this.partyResults = [];
    this.loadTransactions();
  }

  loadTransactions() {
    this.loading = true;
    this.api.get<any[]>(`Report/PartyStatement/${this.selectedParty.partyId}`).subscribe(data => {
      this.transactions = data;
      this.totalDebit = data.reduce((s, t) => s + (t.debit || 0), 0);
      this.totalCredit = data.reduce((s, t) => s + (t.credit || 0), 0);
      this.loading = false;
    });
  }

  printStatement() {
    this.pdf.generateInvoice('PartyStatement', { party: this.selectedParty, transactions: this.transactions });
  }
}
