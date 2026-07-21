export interface RoleIdentity {
  type: string;
  name: string;
}

export const ACADEMIC_ACCESS_ROLES: readonly RoleIdentity[] = [
  {
    type: 'ESTUDIANTE',
    name: 'Academico_estudiante',
  },
  {
    type: 'DOCENTE',
    name: 'Academico_Docente',
  },
];

export const hasRoleAccess = (
  assignedRoles: readonly RoleIdentity[],
  requiredRoles: readonly RoleIdentity[],
): boolean =>
  requiredRoles.some((requiredRole) =>
    assignedRoles.some(
      (assignedRole) =>
        assignedRole.type === requiredRole.type &&
        assignedRole.name === requiredRole.name,
    ),
  );
