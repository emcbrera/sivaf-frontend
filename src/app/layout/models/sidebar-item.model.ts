export type UserRole = 'ESTUDIANTE' | 'PROFESOR' | 'ADMINISTRATIVO' | 'ADMIN';

export interface SidebarItem {
  label: string;
  route: string;
  icon: string;
  roles: UserRole[];
}