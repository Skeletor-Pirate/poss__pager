function authorizeRoles(...allowedRoles) {
    return (req, res, next) => {
      // req.user comes from authMiddleware
      if (!req.user || !req.user.role) {
        return res.status(403).json({ message: "Access denied" });
      }
  
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ message: "Forbidden: insufficient permissions" });
      }
  
      next();
    };
  }
  
  module.exports = authorizeRoles;
  