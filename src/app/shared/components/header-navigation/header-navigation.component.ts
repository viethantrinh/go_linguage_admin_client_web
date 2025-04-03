import {Component, EventEmitter, inject, Output} from '@angular/core';
import {
  AvatarComponent,
  ButtonDirective,
  DropdownComponent,
  DropdownDividerDirective,
  DropdownItemDirective,
  DropdownMenuDirective,
  DropdownToggleDirective,
  HeaderBrandComponent,
  HeaderComponent,
  HeaderNavComponent
} from '@coreui/angular';

import {RouterLink} from '@angular/router';
import {IconComponent} from '@coreui/icons-angular';
import {IconSubset} from '../../../icons/icon-subset';
import {AuthService} from '../../../core/services/auth.service';

@Component({
  selector: 'gl-header',
  imports: [
    HeaderBrandComponent,
    RouterLink,
    DropdownComponent,
    AvatarComponent,
    IconComponent,
    DropdownItemDirective,
    DropdownDividerDirective,
    DropdownMenuDirective,
    DropdownToggleDirective,
    HeaderComponent,
    HeaderNavComponent,
    ButtonDirective
  ],
  templateUrl: './header-navigation.component.html',
  styleUrl: './header-navigation.component.scss'
})
export class HeaderNavigationComponent {
  protected readonly IconSubset = IconSubset;
  @Output() toggleSidebar = new EventEmitter<void>();

  authService = inject(AuthService);

  onCloseSideBar() {
    this.toggleSidebar.emit();
  }

  onSignOut() {
    console.log('sign out...')
    this.authService.signOut();
  }
}
