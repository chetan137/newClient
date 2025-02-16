const isAuthenticated = (req, res, next) => {
  console.log('🔄 Checking authentication...');
  console.log('🟢 Session ID:', req.sessionID);
  console.log('🟢 Session Data:', req.session);
  console.log('🟢 User in middleware:', req.user);

  if (!req.session) {
    console.log('❌ No session found');
    return res.status(401).json({ isAuthenticated: false, message: 'No session' });
  }

  if (!req.user) {
    console.log('❌ User not authenticated');
    return res.status(401).json({ isAuthenticated: false, message: 'Unauthorized: Please log in' });
  }

  console.log('✅ User is authenticated:', req.user);
  next();
};

module.exports = isAuthenticated;
