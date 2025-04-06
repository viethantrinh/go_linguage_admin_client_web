# User Management

## Overview

The User Management component provides administrative functionality for managing users within the Go Linguage platform. It allows administrators to view, search, filter, create, edit, and delete user accounts, as well as manage user statuses.

![User Management Interface](../assets/images/user-management-overview.png)

## Features

### 1. User Listing
- Display users in a paginated table format
- Show key information: ID, Name, Email, Role, Status
- Responsive design for various screen sizes

### 2. Search and Filtering
- Search users by name or email
- Filter users by status (All, Active, Disabled)
- Combined search and filter functionality

### 3. User Operations
- Create new users
- Edit existing user information
- Delete users
- Enable/disable user accounts

### 4. Pagination
- Navigate through user pages
- Display page numbers and navigation controls
- Show current page information

## Implementation Details

### Component Structure

The User Management feature is built using Angular standalone components:

```
src/app/features/user/
├── components/
│   ├── user.component.html     # Template
│   ├── user.component.scss     # Styles
│   └── user.component.ts       # Logic
├── models/
│   └── user.model.ts           # User interfaces
└── services/
    └── user.service.ts         # API communication
```

### Key Interfaces

```typescript
// User model
interface User {
  id: number;
  name: string;
  email: string;
  enabled: boolean;
  roles: Role[];
}

// User update request
interface UserUpdateRequest {
  id: number;
  name: string;
  isEnabled: boolean;
  role: string;
}
```

### API Integration

The component uses the `UserService` to communicate with the backend API:

- `getUsers()`: Retrieves all users
- `getUserById(id)`: Gets a specific user's details
- `updateUser(data)`: Updates user information
- `deleteUser(id)`: Removes a user

## Usage Guide

### Viewing and Navigating Users

1. Access the User Management page from the sidebar navigation
2. The main table displays all users with pagination (5 users per page)
3. Use the pagination controls at the bottom to navigate between pages

![User Table Pagination](../assets/images/user-pagination.png)

### Searching and Filtering

1. Use the search bar to find users by name or email
2. Select a filter option from the dropdown to view:
   - All users
   - Only active users
   - Only disabled users
3. Search and filters can be combined

![Search and Filter](../assets/images/user-search-filter.png)

### Editing User Information

1. Click the edit (pencil) icon next to a user
2. Modify the user's information in the modal dialog
3. Click "Save" to apply changes or "Cancel" to discard

![Edit User](../assets/images/user-edit.png)

### Deleting a User

1. Click the delete (trash) icon next to a user
2. Confirm the deletion in the confirmation dialog
3. Click "Delete" to permanently remove the user

![Delete User](../assets/images/user-delete.png)

### Enabling/Disabling a User

1. Click the enable/disable icon (ban/check) next to a user
2. The user's status will be toggled immediately
3. The status badge will update to reflect the new status

### Adding a New User

1. Click the "Add User" button
2. Fill in the required information in the modal dialog:
   - Name (required)
   - Email (required, must be valid format)
   - Role (select from dropdown)
3. Click "Save" to create the new user

## Customization

The component uses the application's design system, including:

- CoreUI components for layout and UI elements
- Custom color scheme for status indicators and buttons
- Responsive design for various screen sizes

## Future Enhancements

Planned enhancements for the User Management component:

1. Bulk user operations (enable/disable/delete multiple users)
2. Advanced filtering options (by role, date created, etc.)
3. User activity logs and audit trail
4. Password management functionality
5. Role management interface
