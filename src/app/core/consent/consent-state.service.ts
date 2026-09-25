import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ConsentStateService {
  private readonly approvedIds = new Set<string>();

  approve(applicationId: string): void {
    this.approvedIds.add(applicationId);
  }

  isApproved(applicationId: string): boolean {
    return this.approvedIds.has(applicationId);
  }
}
