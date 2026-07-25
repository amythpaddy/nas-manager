import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ShareResponse } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class ShareService {
  private apiUrl = '/api/shares';

  constructor(private http: HttpClient) {}

  createShare(payload: {
    fileId?: string;
    folderId?: string;
    targetUsername?: string;
    permission?: 'READ' | 'WRITE';
    createPublicLink?: boolean;
    expirationDays?: number;
  }): Observable<ShareResponse> {
    return this.http.post<ShareResponse>(this.apiUrl, payload);
  }

  getSharedWithMe(): Observable<ShareResponse[]> {
    return this.http.get<ShareResponse[]>(`${this.apiUrl}/shared-with-me`);
  }

  getPublicShare(token: string): Observable<ShareResponse> {
    return this.http.get<ShareResponse>(`${this.apiUrl}/public/${token}`);
  }
}
