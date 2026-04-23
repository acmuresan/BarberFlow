import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BarberoModel } from '../models/barbero.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BarberosService {
  private apiUrl = `${environment.apiUrl}/api/servicios`;

  constructor(private http: HttpClient) {}

  getBarberosActivos(): Observable<BarberoModel[]> {
    return this.http.get<BarberoModel[]>(this.apiUrl);
  }
}
