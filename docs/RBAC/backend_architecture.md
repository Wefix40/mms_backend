# Backend Architecture Documentation

Based on the frontend application's requirements and its local state structure (Zustand `adminStore.ts`), here is the proposed document detailing the required database table relations and RESTful API endpoints needed to support this system.

## 1. Database Table Relations (Schema)

The application features a robust Role-Based Access Control (RBAC) system with custom user-level permission overrides.

### `users`
Stores employee and user credentials along with their assigned base role.
- `id` (Primary Key, UUID)
- `name` (String)
- `email` (String, Unique)
- `phone` (String, Nullable)
- `password_hash` (String)
- `role_id` (Foreign Key -> `roles.id`)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)
**Relations:**
- Belongs to one `Role`
- Has many `UserPermissions` (Custom overrides)

### `roles`
Defines base roles in the system.
- `id` (Primary Key, UUID)
- `name` (String, Unique)
- `description` (String, Nullable)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)
**Relations:**
- Has many `Users`
- Has many `RolePermissions`

### `menus`
Defines the navigation structure and modules available in the app.
- `id` (Primary Key, UUID)
- `label` (String)
- `route` (String, Nullable)
- `icon` (String)
- `parent_id` (Foreign Key -> `menus.id`, Nullable for top-level menus)
- `sequence` (Integer, for ordering)
**Relations:**
- Belongs to `Menu` (Self-referencing for hierarchy)
- Has many `RolePermissions`
- Has many `UserPermissions`

### `role_permissions`
A pivot table associating a Role with a Menu, defining access levels.
- `role_id` (Foreign Key -> `roles.id`)
- `menu_id` (Foreign Key -> `menus.id`)
- `can_view` (Boolean, default: false)
- `can_create` (Boolean, default: false)
- `can_edit` (Boolean, default: false)
- `can_delete` (Boolean, default: false)
- **Primary Key:** (`role_id`, `menu_id`)

### `user_permissions`
A pivot table that stores **custom permission overrides** for a specific user, stacking on top of their base role.
- `user_id` (Foreign Key -> `users.id`)
- `menu_id` (Foreign Key -> `menus.id`)
- `can_view` (Boolean)
- `can_create` (Boolean)
- `can_edit` (Boolean)
- `can_delete` (Boolean)
- **Primary Key:** (`user_id`, `menu_id`)


---

## 2. API Endpoints

All endpoints beneath `/api/*` (except login) should be protected by authentication (e.g., JWT) and verified for appropriate RBAC permissions.

### Authentication
* **POST** `/api/auth/login`
  * Payload: `{ email, password }`
  * Response: JWT Token and user data (including merged base + custom permissions).
* **POST** `/api/auth/logout`
* **GET** `/api/auth/me`
  * Returns the currently authenticated user with their full computed permissions tree.

### Users Management
* **GET** `/api/users`
  * Returns a list of all users.
* **GET** `/api/users/:id`
  * Returns details for a single user, including their base role and custom permission overrides.
* **POST** `/api/users`
  * Payload: `{ name, email, phone, password, roleId, customPermissions? }`
* **PUT** `/api/users/:id`
  * Payload: `{ name, email, phone, roleId }` (Password updates should ideally be handled separately).
* **DELETE** `/api/users/:id`
* **PUT** `/api/users/:id/permissions`
  * Payload: `[{ menuId, canView, canCreate, canEdit, canDelete }, ...]`
  * Updates or replaces the custom permission overrides in the `user_permissions` table for the specified user.

### Roles & Privileges
* **GET** `/api/roles`
  * Returns a list of roles with their associated permissions.
* **GET** `/api/roles/:id`
* **POST** `/api/roles`
  * Payload: `{ name, description, permissions: [...] }`
* **PUT** `/api/roles/:id`
  * Payload: `{ name, description, permissions: [...] }`
  * Overwrites or merges the permissions in `role_permissions`.
* **DELETE** `/api/roles/:id`

### Menus (Navigation & Modules)
* **GET** `/api/menus`
  * Returns a list of all menus. Can be sorted by `sequence`.
* **POST** `/api/menus`
  * Payload: `{ label, route, icon, parentId, sequence }`
* **PUT** `/api/menus/:id`
  * Payload: `{ label, route, icon, parentId, sequence }`
* **DELETE** `/api/menus/:id`
