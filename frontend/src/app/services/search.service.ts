import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SearchResultItem } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private apiUrl = '/api/search';

  constructor(private http: HttpClient) {}

  search(query: string, limit: number = 10): Observable<SearchResultItem[]> {
    const params = new HttpParams().set('q', query).set('limit', limit.toString());
    return this.http.get<SearchResultItem[]>(this.apiUrl, { params });
  }
}
