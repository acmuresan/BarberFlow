import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ServicioModel } from '../models/servicio.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ServiciosService {
  private apiUrl = `${environment.apiUrl}/api/servicios`;

  constructor(private http: HttpClient) {}

  getServicios(): Observable<ServicioModel[]> {
    return this.http.get<ServicioModel[]>(this.apiUrl);
  }
}
