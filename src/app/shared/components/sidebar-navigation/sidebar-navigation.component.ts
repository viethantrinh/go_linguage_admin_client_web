import {Component} from '@angular/core';
import {SidebarBrandComponent, SidebarComponent, SidebarHeaderComponent, SidebarNavComponent} from '@coreui/angular';
import {navItems} from '../default-layout/nav';
import {IconSubset} from '../../../icons/icon-subset';

@Component({
  selector: 'gl-sidebar-navigation',
  imports: [
    SidebarNavComponent,
    SidebarComponent,
    SidebarHeaderComponent,
    SidebarBrandComponent,
  ],
  templateUrl: './sidebar-navigation.component.html',
  styleUrl: './sidebar-navigation.component.scss'
})
export class SidebarNavigationComponent {
  protected readonly navItems = navItems;
  protected readonly IconSubset = IconSubset;
}
