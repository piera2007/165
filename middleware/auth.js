// middleware/auth.js
module.exports = (requiredRole) => {
    return (req, res, next) => {
      const userRole = req.user.role; // Annahme: req.user wurde vorher gesetzt (z.B. durch Authentifizierung)
      if (userRole === requiredRole || userRole === 'admin') {
        next();
      } else {
        res.status(403).json({ error: "Nicht genügend Rechte" });
      }
    }
  };
  