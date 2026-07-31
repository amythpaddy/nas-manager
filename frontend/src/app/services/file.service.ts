import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpParams, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FileItem } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  private apiUrl = '/api/files';

  constructor(private http: HttpClient) {}

  uploadFile(file: File, folderId?: string): Observable<HttpEvent<FileItem>> {
    const formData: FormData = new FormData();
    formData.append('file', file);
    if (folderId) {
      formData.append('folderId', folderId);
    }

    const req = new HttpRequest('POST', `${this.apiUrl}/upload`, formData, {
      reportProgress: true,
      responseType: 'json'
    });

    return this.http.request<FileItem>(req);
  }

  getFiles(folderId?: string): Observable<FileItem[]> {
    let params = new HttpParams();
    if (folderId) {
      params = params.set('folderId', folderId);
    }
    return this.http.get<FileItem[]>(this.apiUrl, { params });
  }

  downloadFile(fileId: string): void {
    const token = localStorage.getItem('token');
    window.open(`${this.apiUrl}/${fileId}/download?token=${token}`, '_blank');
  }

  getPreviewUrl(fileId: string): string {
    const token = localStorage.getItem('token');
    return `${this.apiUrl}/${fileId}/preview?token=${token}`;
  }

  renameFile(fileId: string, newName: string): Observable<FileItem> {
    return this.http.patch<FileItem>(`${this.apiUrl}/${fileId}/rename`, { newName });
  }

  deleteFile(fileId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${fileId}`);
  }

  reindexFolder(folderId?: string): Observable<FileItem[]> {
    let params = new HttpParams();
    if (folderId) {
      params = params.set('folderId', folderId);
    }
    return this.http.post<FileItem[]>(`${this.apiUrl}/reindex`, null, { params });
  }
}
