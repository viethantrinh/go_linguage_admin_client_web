import {Component, inject} from '@angular/core';
import {DefaultLayoutComponent} from './shared/components/default-layout/default-layout.component';
import {RouterOutlet} from '@angular/router';
import {AuthService} from './core/services/auth.service';

@Component({
  selector: 'gl-root',
  standalone: true,
  imports: [
    DefaultLayoutComponent,
    RouterOutlet,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  readonly authService = inject(AuthService);

  constructor() {
    this.authService.checkAuthStatus().subscribe()
  }
}
