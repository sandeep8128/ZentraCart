const roleMiddleware = (...roles) => {
  return (req, res, next) => {

    console.log("===== ROLE MIDDLEWARE =====");
    console.log("Allowed Roles:", roles);
    console.log("req.user:", req.user);
    console.log("User Role:", req.user.role);

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Access Denied",
      });
    }

    next();
  };
};

module.exports = roleMiddleware;