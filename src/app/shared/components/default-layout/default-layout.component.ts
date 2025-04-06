// Import CoreUI components
import {DropdownModule, SidebarModule} from '@coreui/angular';

import {Component, inject} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {iconSubset} from '../../../icons/icon-subset';
import {IconModule, IconSetService} from '@coreui/icons-angular';
import {HeaderNavigationComponent} from '../header-navigation/header-navigation.component';
import {SidebarNavigationComponent} from '../sidebar-navigation/sidebar-navigation.component';

@Component({
  selector: 'gl-default-layout',
  imports: [
    SidebarModule,
    IconModule,
    DropdownModule,
    HeaderNavigationComponent,
    RouterOutlet,
    SidebarNavigationComponent
  ],
  providers: [IconSetService],
  templateUrl: './default-layout.component.html',
  styleUrl: './default-layout.component.scss'
})
export class DefaultLayoutComponent {

  readonly #iconService = inject(IconSetService);

  constructor() {
    this.#iconService.icons = {...iconSubset};
  }

  isSidebarVisible = true;

  toggleSideBar() {
    this.isSidebarVisible = !this.isSidebarVisible;
    console.log(this.isSidebarVisible)
  }

}
