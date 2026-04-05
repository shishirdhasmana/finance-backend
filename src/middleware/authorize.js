const { ROLE_HIERARCHY, PERMISSIONS } = require('../config/roles');
const { sendError } = require('../utils/apiResponse');


const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return sendError(res, {
      statusCode: 403,
      message: `Access denied. Required role: ${roles.join(' or ')}`,
    });
  }
  next();
};


const requireMinRole = (minRole) => (req, res, next) => {
  if (ROLE_HIERARCHY[req.user.role] < ROLE_HIERARCHY[minRole]) {
    return sendError(res, {
      statusCode: 403,
      message: `Access denied. Minimum required role: ${minRole}`,
    });
  }
  next();
};


const requirePermission = (permission) => (req, res, next) => {
  const userPermissions = PERMISSIONS[req.user.role] || [];
  if (!userPermissions.includes(permission)) {
    return sendError(res, {
      statusCode: 403,
      message: 'You do not have permission to perform this action',
    });
  }
  next();
};

module.exports = { requireRole, requireMinRole, requirePermission };