/**
 * Role-Based Access Control middleware
 * @param  {...string} roles - Allowed roles (e.g. 'donor', 'receiver', 'admin')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required before checking roles.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is unauthorized to perform this action.`,
      });
    }

    next();
  };
};

module.exports = { authorize };
