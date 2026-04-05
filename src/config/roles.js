const ROLES = {
  VIEWER:  'viewer',
  ANALYST: 'analyst',
  ADMIN:   'admin',
};

const ROLE_HIERARCHY = {
  [ROLES.VIEWER]:  1,
  [ROLES.ANALYST]: 2,
  [ROLES.ADMIN]:   3,
};

const PERMISSIONS = {
  [ROLES.VIEWER]: [
    'records:read',
    'dashboard:read',
  ],
  [ROLES.ANALYST]: [
    'records:read',
    'dashboard:read',
    'dashboard:trends',
  ],
  [ROLES.ADMIN]: [
    'records:read',
    'records:create',
    'records:update',
    'records:delete',
    'dashboard:read',
    'dashboard:trends',
    'users:read',
    'users:create',
    'users:update',
    'users:delete',
  ],
};

module.exports = {
  ROLES,
  ROLE_HIERARCHY,
  PERMISSIONS,
};