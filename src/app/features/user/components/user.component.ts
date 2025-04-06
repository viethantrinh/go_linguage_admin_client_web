import {Component, inject, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {
  ButtonCloseDirective,
  ButtonDirective,
  ButtonModule,
  CardBodyComponent,
  CardComponent,
  ContainerComponent,
  FormControlDirective,
  FormDirective,
  FormLabelDirective,
  FormSelectDirective,
  ModalBodyComponent,
  ModalComponent,
  ModalFooterComponent,
  ModalHeaderComponent,
  ModalTitleDirective,
  PageItemDirective,
  PageLinkDirective,
  PaginationComponent,
  TableDirective
} from '@coreui/angular';
import {IconDirective} from '@coreui/icons-angular';
import {UserService} from '../services/user.service';
import {User, UserUpdateRequest} from '../models/user.model';
import {finalize} from 'rxjs/operators';
import {DashboardService} from '../../dashboard/services/dashboard.service';

/**
 * UserComponent is responsible for managing user data, including displaying,
 * filtering, pagination, and CRUD operations.
 */
@Component({
  selector: 'gl-user',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ContainerComponent,
    CardComponent,
    CardBodyComponent,
    ButtonDirective,
    ButtonModule,
    ButtonCloseDirective,
    IconDirective,
    TableDirective,
    FormDirective,
    FormControlDirective,
    FormLabelDirective,
    ModalComponent,
    ModalHeaderComponent,
    ModalTitleDirective,
    ModalFooterComponent,
    PaginationComponent,
    PageItemDirective,
    PageLinkDirective,
    ModalBodyComponent,
    FormSelectDirective
  ],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss',
  providers: [UserService]
})
export class UserComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  selectedFilter = 'all';
  editModalVisible = false;
  deleteModalVisible = false;
  isNewUser = false;
  selectedUser: User | null = null;
  userForm: FormGroup;
  loading = false;

  // Pagination
  currentPage = 1;
  itemsPerPage = 5;
  totalPages = 1;
  Math = Math; // To use Math in template

  readonly userService = inject(UserService);
  readonly fb = inject(FormBuilder);
  readonly dashboardService = inject(DashboardService);

  // Sample data for demonstration purposes
  sampleUsers: User[] = [
    {id: 21, name: 'John Doe', email: 'john.doe@example.com', enabled: true, roles: [{name: 'ADMIN', description: '?'}]},
    {id: 23, name: 'Jane Smith', email: 'jane.smith@example.com', enabled: true, roles: [{name: 'ADMIN', description: '?'}]},
    {id: 3, name: 'Michael Johnson', email: 'michael.j@example.com', enabled: false, roles: [{name: 'ADMIN', description: '?'}]},
    {id: 4, name: 'Emma Wilson', email: 'emma.w@example.com', enabled: true, roles: [{name: 'ADMIN', description: '?'}]},
    {id: 5, name: 'Robert Brown', email: 'robert.b@example.com', enabled: true, roles: [{name: 'ADMIN', description: '?'}]},
    {id: 6, name: 'Sarah Davis', email: 'sarah.d@example.com', enabled: false, roles: [{name: 'ADMIN', description: '?'}]},
    {id: 7, name: 'Thomas Miller', email: 'thomas.m@example.com', enabled: true, roles: [{name: 'ADMIN', description: '?'}]},
    {id: 8, name: 'Lisa Anderson', email: 'lisa.a@example.com', enabled: true, roles: [{name: 'ADMIN', description: '?'}]},
    {id: 9, name: 'David Wilson', email: 'david.w@example.com', enabled: true, roles: [{name: 'USER', description: '?'}]},
    {id: 10, name: 'Patricia Moore', email: 'patricia.m@example.com', enabled: false, roles: [{name: 'ADMIN', description: '?'}]},
    {id: 11, name: 'James Taylor', email: 'james.t@example.com', enabled: true, roles: [{name: 'ADMIN', description: '?'}]},
    {id: 12, name: 'Jennifer White', email: 'jennifer.w@example.com', enabled: true, roles: [{name: 'ADMIN', description: '?'}]},
    {id: 13, name: 'Charles Harris', email: 'charles.h@example.com', enabled: false, roles: [{name: 'ADMIN', description: '?'}]},
    {id: 14, name: 'Susan Martin', email: 'susan.m@example.com', enabled: true, roles: [{name: 'ADMIN', description: '?'}]},
    {id: 15, name: 'Joseph Thompson', email: 'joseph.t@example.com', enabled: true, roles: [{name: 'ADMIN', description: '?'}]},
    {id: 16, name: 'Margaret Garcia', email: 'margaret.g@example.com', enabled: true, roles: [{name: 'ADMIN', description: '?'}]},
    {id: 17, name: 'Daniel Martinez', email: 'daniel.m@example.com', enabled: false, roles: [{name: 'ADMIN', description: '?'}]},
    {id: 18, name: 'Nancy Robinson', email: 'nancy.r@example.com', enabled: true, roles: [{name: 'ADMIN', description: '?'}]},
    {id: 19, name: 'Paul Clark', email: 'paul.c@example.com', enabled: true, roles: [{name: 'ADMIN', description: '?'}]},
    {id: 20, name: 'Betty Lewis', email: 'betty.l@example.com', enabled: false, roles: [{name: 'ADMIN', description: '?'}]}
  ];

  constructor() {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['USER', Validators.required]
    });
  }

  /**
   * Lifecycle hook that is called after data-bound properties of a directive are initialized.
   * Initialize the component by loading users.
   */
  ngOnInit(): void {
    this.loadUsers();
  }

  /**
   * Load users from the API and apply filters.
   */
  loadUsers(): void {
    this.loading = true;
    this.userService.getUsers()
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (users) => {
          this.users = users;
          this.users = this.users.concat(this.sampleUsers)
          this.applyFilters();
        },
        error: (error) => {
          console.error('Error loading users:', error);
          // Handle error (show notification, etc.)
        }
      });
  }

  /**
   * Handle search input event to filter users based on the search term.
   * @param event - The input event.
   */
  onSearch(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.applyFilters(searchTerm);
  }

  /**
   * Apply the selected filter to the user list.
   */
  applyFilter(): void {
    this.applyFilters();
  }

  /**
   * Apply filters to the user list based on the selected filter and search term.
   * @param searchTerm - The search term to filter users by.
   */
  applyFilters(searchTerm = ''): void {
    let filtered = this.users;

    // Apply status filter
    if (this.selectedFilter !== 'all') {
      const isActive = this.selectedFilter === 'active';
      filtered = filtered.filter(user => user.enabled === isActive);
    }

    // Apply search term
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm)
      );
    }

    this.filteredUsers = filtered;
    this.updatePagination();
    this.currentPage = 1; // Reset to first page when filtering
  }

  /**
   * Update pagination details based on the filtered user list.
   */
  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredUsers.length / this.itemsPerPage);
  }

  /**
   * Change the current page of the user list.
   * @param page - The page number to change to.
   */
  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  /**
   * Get the list of page numbers for pagination.
   * @returns An array of page numbers.
   */
  getPageNumbers(): number[] {
    const pageNumbers: number[] = [];
    const maxVisiblePages = 5;

    if (this.totalPages <= maxVisiblePages) {
      // Show all pages if total pages is less than max visible
      for (let i = 1; i <= this.totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Show a subset of pages with current page in the middle if possible
      const halfVisible = Math.floor(maxVisiblePages / 2);
      let startPage = Math.max(1, this.currentPage - halfVisible);
      let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);

      // Adjust if we're near the end
      if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
    }

    return pageNumbers;
  }

  /**
   * Open the edit modal for a user. If no user is provided, open the modal for creating a new user.
   * @param user - The user to edit.
   */
  openEditModal(user?: User): void {
    if (user) {
      this.loading = true;
      this.userService.getUserById(user.id)
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: (userData) => {
            this.selectedUser = userData;
            this.isNewUser = false;
            this.userForm.patchValue({
              name: userData.name,
              email: userData.email,
              role: userData.roles[0]?.name || 'USER'
            });
            this.editModalVisible = true;
          },
          error: (error) => {
            console.error('Error loading user details:', error);
            // Handle error (show notification, etc.)
          }
        });
    } else {
      this.selectedUser = null;
      this.isNewUser = true;
      this.userForm.reset({ role: 'USER' });
      this.editModalVisible = true;
    }
  }

  /**
   * Open the delete modal for a user.
   * @param user - The user to delete.
   */
  openDeleteModal(user: User): void {
    this.selectedUser = user;
    this.deleteModalVisible = true;
  }

  /**
   * Save the user data from the form. If creating a new user, show a warning as the API is not implemented.
   * If editing an existing user, send an update request.
   */
  saveUser(): void {
    if (this.userForm.invalid) return;

    const formData = this.userForm.value;

    if (this.isNewUser) {
      // This is for future implementation since we don't have a create user API yet
      console.warn('Create user API is not implemented yet');
      this.editModalVisible = false;
    } else if (this.selectedUser) {
      const updateRequest: UserUpdateRequest = {
        id: this.selectedUser.id,
        name: formData.name,
        isEnabled: this.selectedUser.enabled,
        role: formData.role
      };

      this.loading = true;
      this.userService.updateUser(updateRequest)
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: () => {
            this.editModalVisible = false;
            this.loadUsers(); // Reload the list
          },
          error: (error) => {
            console.error('Error updating user:', error);
            // Handle error (show notification, etc.)
          }
        });
    }
  }

  /**
   * Delete the selected user.
   */
  deleteUser(): void {
    if (this.selectedUser) {
      this.loading = true;
      this.userService.deleteUser(this.selectedUser.id)
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: () => {
            this.deleteModalVisible = false;
            this.loadUsers(); // Reload the list
          },
          error: (error) => {
            console.error('Error deleting user:', error);
            // Handle error (show notification, etc.)
          }
        });
    }
  }

  /**
   * Toggle the status (enabled/disabled) of a user.
   * @param user - The user to toggle status for.
   */
  toggleUserStatus(user: User): void {
    const updateRequest: UserUpdateRequest = {
      id: user.id,
      name: user.name,
      isEnabled: !user.enabled,
      role: user.roles[0]?.name || 'USER'
    };

    this.loading = true;
    this.userService.updateUser(updateRequest)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: () => {
          this.loadUsers(); // Reload the list
        },
        error: (error) => {
          console.error('Error toggling user status:', error);
          // Handle error (show notification, etc.)
        }
      });
  }
}
