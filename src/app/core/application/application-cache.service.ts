import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ApplicationCacheService {
  private readonly http = inject(HttpClient);
  private readonly cache = new Map<string, Observable<unknown>>();

  get<T>(applicationId: string): Observable<T> {
    if (!this.cache.has(applicationId)) {
      this.cache.set(
        applicationId,
        this.http.get<T>(`/Buyer/Application/${applicationId}`).pipe(shareReplay(1))
      );
    }

    return this.cache.get(applicationId) as Observable<T>;
  }

  invalidate(applicationId: string): void {
    this.cache.delete(applicationId);
  }

  fetch<T>(applicationId: string): Observable<T> {
    return this.http.get<T>(`/Buyer/Application/${applicationId}`);
  }
}
