import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Folder } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class FolderService {
  private apiUrl = '/api/folders';

  constructor(private http: HttpClient) {}

  createFolder(name: string, parentId?: string): Observable<Folder> {
    return this.http.post<Folder>(this.apiUrl, { name, parentId });
  }

  getFolders(parentId?: string): Observable<Folder[]> {
    let params = new HttpParams();
    if (parentId) {
      params = params.set('parentId', parentId);
    }
    return this.http.get<Folder[]>(this.apiUrl, { params });
  }

  deleteFolder(folderId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${folderId}`);
  }
}
