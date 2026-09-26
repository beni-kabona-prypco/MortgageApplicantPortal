import { Injectable } from '@angular/core';

const STORAGE_KEY = 'consent_approved_ids';

@Injectable({ providedIn: 'root' })
export class ConsentStateService {
  private readonly approvedIds = new Set<string>(
    JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? '[]') as string[]
  );

  approve(applicationId: string): void {
    this.approvedIds.add(applicationId);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...this.approvedIds]));
  }

  isApproved(applicationId: string): boolean {
    return this.approvedIds.has(applicationId);
  }
}
