import {Component} from '@angular/core';
import {DefaultLayoutComponent} from './shared/components/default-layout/default-layout.component';

@Component({
  selector: 'gl-root',
  standalone: true,
  imports: [
    DefaultLayoutComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {

}
