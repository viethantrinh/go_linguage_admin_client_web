import {HttpClient, HttpHeaders} from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import {map, Observable} from 'rxjs';
import {DashboardData} from '../models/dashboard-data';
import {ApiResponse} from '../../../core/models/api-response.model';
import {BASE_REMOTE_URL, BASE_URL, TOKEN_KEY} from '../../../shared/utils/app.constants';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  readonly http = inject(HttpClient);

  getDashboardData(): Observable<DashboardData> {
    let headers = new HttpHeaders();
    headers = headers.append('Authorization', `Bearer ${localStorage.getItem(TOKEN_KEY)}`);
    return this.http.get<ApiResponse<DashboardData>>(`${BASE_URL}/dashboards`, {
      headers: headers
    })
      .pipe(
        map(response => response.result)
      );
  }


}
