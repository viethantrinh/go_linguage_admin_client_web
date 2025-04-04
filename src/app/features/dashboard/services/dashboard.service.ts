import {HttpClient} from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import {map, Observable} from 'rxjs';
import {DashboardData} from '../models/dashboard-data';
import {ApiResponse} from '../../../core/models/api-response.model';
import {BASE_REMOTE_URL} from '../../../shared/utils/app.constants';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  readonly http = inject(HttpClient);

  getDashboardData(): Observable<DashboardData> {
    return this.http.get<ApiResponse<DashboardData>>(`${BASE_REMOTE_URL}/dashboards`)
      .pipe(
        map(response => response.result)
      );
  }
}
