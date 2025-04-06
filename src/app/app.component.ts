import {Component, inject, OnInit} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {AuthService} from './features/auth/services/auth.service';

@Component({
  selector: 'gl-root',
  standalone: true,
  imports: [
    RouterOutlet,


  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  readonly authService = inject(AuthService);

  ngOnInit() {
    this.authService.checkAuthStatus().subscribe();
  }

}
