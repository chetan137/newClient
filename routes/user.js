const express = require('express');
const router = express.Router();

// Protected route
router.get('/profile', (req, res) => {
  res.json({ message: 'Welcome to your profile', user: req.user });
});

module.exports = router;
