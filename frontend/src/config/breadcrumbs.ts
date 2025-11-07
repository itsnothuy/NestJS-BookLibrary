export interface BreadcrumbConfig {
  path: string;
  label: string | ((params: any) => string);
  dynamic?: boolean;
  parent?: string;
}

export const breadcrumbConfig: BreadcrumbConfig[] = [
  { path: '/', label: 'Home' },
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/users', label: 'User Management', parent: '/dashboard' },
  { path: '/users/:id', label: () => `User Details`, dynamic: true, parent: '/users' },
  { path: '/books', label: 'Book Management', parent: '/dashboard' },
  { path: '/books/:id', label: () => `Book Details`, dynamic: true, parent: '/books' },
  { path: '/profile', label: 'My Profile', parent: '/dashboard' },
  { path: '/profile/avatar', label: 'Avatar Settings', parent: '/profile' },
  { path: '/admin', label: 'Administration', parent: '/dashboard' },
  { path: '/admin/users', label: 'User Management', parent: '/admin' },
  { path: '/admin/books', label: 'Book Management', parent: '/admin' },
]