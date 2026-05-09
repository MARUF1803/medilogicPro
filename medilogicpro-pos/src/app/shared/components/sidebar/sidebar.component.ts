import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { BranchService, Branch } from '@core/services/branch.service';

const REACT_SETUP_URL = 'http://localhost:5173';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="sidebar">
      <!-- Brand -->
      <div class="brand" routerLink="/pos" style="cursor: pointer;">
        <div class="brand-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/>
            <path d="m8.5 8.5 7 7"/>
          </svg>
        </div>
        <div>
          <h2 class="brand-title"><span class="brand-main">MediLogic</span><span class="brand-accent">Pro</span></h2>
          <span class="brand-sub">Point of Sale (POS)</span>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="nav">
        @if (auth.hasRole('Admin')) {
          <div class="nav-group">
            <span class="nav-group-title">Main Dashboard</span>
            <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              <span>Dashboard</span>
            </a>
          </div>
        }

        <div class="nav-group">
          <span class="nav-group-title">Operations</span>
          <a routerLink="/pos" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
            <span>Point of Sale (POS)</span>
          </a>
        </div>

        <div class="nav-group">
          <span class="nav-group-title">Sales</span>
          <a routerLink="/sales" routerLinkActive="active" class="nav-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
            <span>Sales History</span>
          </a>
          <a routerLink="/sales-returns" [routerLinkActiveOptions]="{exact: true}" routerLinkActive="active" class="nav-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/></svg>
            <span>Return History</span>
          </a>
          <a routerLink="/sales-returns/create" routerLinkActive="active" class="nav-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <span>New Sales Return</span>
          </a>

        </div>

        <div class="nav-group">
          <span class="nav-group-title">Purchase & Inventory</span>
          <a routerLink="/purchase/create" routerLinkActive="active" class="nav-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <span>New Purchase</span>
          </a>
          <a routerLink="/purchase" [routerLinkActiveOptions]="{exact: true}" routerLinkActive="active" class="nav-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
            <span>Purchase History</span>
          </a>
          <a routerLink="/purchase-returns/create" routerLinkActive="active" class="nav-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/></svg>
            <span>New Purchase Return</span>
          </a>
          <a routerLink="/purchase-returns" [routerLinkActiveOptions]="{exact: true}" routerLinkActive="active" class="nav-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><path d="M16 13H8"/></svg>
            <span>Purchase Return History</span>
          </a>
          <a routerLink="/inventory" routerLinkActive="active" class="nav-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
            <span>Stock / Inventory</span>
          </a>
          <a routerLink="/products" routerLinkActive="active" class="nav-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" y1="22" x2="12" y2="12"/></svg>
            <span>Medicine List</span>
          </a>
        </div>

        @if (auth.hasRole('Admin')) {
          <div class="nav-group">
            <span class="nav-group-title">Accounting</span>
            <a routerLink="/ledger" routerLinkActive="active" class="nav-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
              <span>Daily Ledger</span>
            </a>
            <a routerLink="/party-statement" routerLinkActive="active" class="nav-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/></svg>
              <span>Party Statement</span>
            </a>
          </div>
        }
      </nav>

      <!-- Go to Setup Link -->
      @if (auth.hasRole('Admin')) {
        <div class="setup-link" (click)="goToSetup()">
          <div class="setup-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
          </div>
          <div class="setup-text">
            <span class="setup-title">Go to Setup
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </span>
            <span class="setup-sub">Master Data & Configuration</span>
          </div>
        </div>
      }
      <div style="padding:10px 24px; font-size:10px; color:var(--text-muted); border-top:1px solid var(--border); text-align:center;">
        v1.0.8 • System Synchronized
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 280px; min-height: 100vh; position: fixed; left: 0; top: 0; bottom: 0; z-index: 100;
      background: var(--white); border-right: 1px solid var(--border-color);
      display: flex; flex-direction: column; overflow-y: auto;
      box-shadow: 4px 0 24px rgba(0,0,0,0.05);
    }
    .brand {
      padding: 24px; display: flex; align-items: center; gap: 12px;
      border-bottom: 1px solid var(--border-color);
    }
    .brand-icon {
      width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center;
      background: linear-gradient(135deg, #0077b6, #2d6a4f); box-shadow: 0 8px 16px rgba(0, 119, 182, 0.2);
    }
    .brand-title { margin: 0; font-size: 20px; font-weight: 900; letter-spacing: -0.04em; line-height: 1.2; }
    .brand-main { color: #00509d; }
    .brand-accent { color: #70e000; }
    .brand-sub { font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; }
    .nav { flex: 1; padding: 12px; }
    .nav-group { margin-top: 8px; }
    .nav-group-title {
      display: block; padding: 12px 16px 6px; font-size: 10px; font-weight: 700;
      color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em;
    }
    .nav-item {
      display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: 12px;
      color: var(--text-muted); text-decoration: none; font-size: 14px; font-weight: 500;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer; margin: 4px 8px;
      position: relative; overflow: hidden;
    }
    .nav-item:hover { 
      background: rgba(0, 119, 182, 0.05); 
      color: #0077b6; 
      transform: translateX(4px);
    }
    .nav-item.active {
      background: linear-gradient(135deg, rgba(0, 119, 182, 0.15), rgba(45, 106, 79, 0.1));
      color: #0077b6; font-weight: 800;
      backdrop-filter: blur(8px);
      border: 1px solid rgba(0, 119, 182, 0.1);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
    }
    .nav-item.active::before {
      content: ''; position: absolute; left: 0; top: 0; height: 100%; width: 5px;
      background: linear-gradient(to bottom, #0077b6, #2d6a4f); border-radius: 0 4px 4px 0;
    }
    .setup-link {
      margin: 12px; padding: 14px; border-radius: 12px; cursor: pointer;
      background: linear-gradient(135deg, rgba(12,99,228,0.08), rgba(6,182,212,0.06));
      border: 1px solid rgba(12,99,228,0.15); display: flex; align-items: center; gap: 10px;
      transition: all 0.2s ease;
    }
    .setup-link:hover { transform: translateY(-1px); border-color: rgba(12,99,228,0.3); }
    .setup-icon {
      width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center;
      background: linear-gradient(135deg, #06b6d4, #0c63e4); box-shadow: 0 4px 12px rgba(6,182,212,0.25);
    }
    .setup-text { flex: 1; }
    .setup-title { display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 700; color: #f8fafc; }
    .setup-sub { display: block; font-size: 11px; color: #64748b; font-weight: 500; }
    .setup-badge {
      font-size: 10px; font-weight: 700; color: #06b6d4; background: rgba(6,182,212,0.12);
      padding: 2px 8px; border-radius: 6px; border: 1px solid rgba(6,182,212,0.2);
    }
  `]
})
export class SidebarComponent {
  constructor(
    public auth: AuthService,
    public branchService: BranchService
  ) {}

  goToSetup(): void {
    const user = localStorage.getItem('user');
    if (user) {
      const encoded = btoa(user);
      window.location.href = `${REACT_SETUP_URL}/auth-callback?auth=${encoded}`;
    } else {
      window.location.href = REACT_SETUP_URL;
    }
  }
}
