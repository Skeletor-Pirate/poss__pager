function authorizeRoles(...allowedRoles) {
    return (req, res, next) => {
      console.log("Decoded user:", req.user);
    console.log("Role received:", JSON.stringify(req.user?.role));
    console.log("Allowed roles:", allowedRoles);
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
  