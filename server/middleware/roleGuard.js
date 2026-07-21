/**
 * roleGuard — Restricts route access to specific roles.
 * 
 * @param {...string} allowedRoles - List of roles permitted to access the route
 */
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: No user session found' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Forbidden: Access restricted. Required role: one of [${allowedRoles.join(', ')}]. Current role: ${req.user.role || 'none'}`
      });
    }

    next();
  };
}

export default requireRole;
