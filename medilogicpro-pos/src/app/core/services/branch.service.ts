import { Injectable, signal, computed } from '@angular/core';
import { ApiService } from './api.service';

export interface Branch {
  branchId: number;
  branchName: string;
  branchCode?: string;
  address?: string;
  phone?: string;
}

@Injectable({ providedIn: 'root' })
export class BranchService {
  private branchesSignal = signal<Branch[]>([]);
  private activeBranchSignal = signal<Branch | null>(null);
  private loadingSignal = signal(true);

  readonly branches = this.branchesSignal.asReadonly();
  readonly activeBranch = this.activeBranchSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly activeBranchId = computed(() => this.activeBranchSignal()?.branchId ?? null);

  constructor(private api: ApiService) {
    this.loadBranches();
  }

  private loadBranches(): void {
    this.api.get<Branch[]>('Branch').subscribe({
      next: (data) => {
        this.branchesSignal.set(data);
        const savedId = localStorage.getItem('activeBranchId');
        if (savedId) {
          const found = data.find(b => b.branchId === parseInt(savedId));
          this.activeBranchSignal.set(found ?? data[0] ?? null);
        } else if (data.length > 0) {
          this.activeBranchSignal.set(data[0]);
          localStorage.setItem('activeBranchId', data[0].branchId.toString());
        }
        this.loadingSignal.set(false);
      },
      error: () => {
        this.loadingSignal.set(false);
      }
    });
  }

  switchBranch(branch: Branch): void {
    this.activeBranchSignal.set(branch);
    localStorage.setItem('activeBranchId', branch.branchId.toString());
    window.location.reload();
  }
}
