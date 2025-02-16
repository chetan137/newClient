// middleware/authMiddleware.js
const authMiddleware = (req, res, next) => {
  if (req.session.userId) {
    // User is authenticated
    next();
  } else {
    // User is not authenticated
    res.status(401).json({ message: "Unauthorized: Please log in" });
  }
};

module.exports = authMiddleware;
