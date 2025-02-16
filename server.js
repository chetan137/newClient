const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const cors = require('cors');
const MongoStore = require('connect-mongo');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
require('dotenv').config();
const User = require('./models/User');

require('./config/passport'); // Ensure passport config is loaded
const isAuthenticated = require('./middleware/authMiddleware');

const app = express();
const MONGO_URI = process.env.MONGO_URI;

// **Database Connection**
if (!MONGO_URI) {
  console.error("MongoDB URI is missing in environment variables");
  process.exit(1);
}

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error("MongoDB connection error:", err));

// **✅ Fix CORS to Allow Credentials**
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());

// **✅ Fix: Set session before Passport**
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: MONGO_URI,
    collectionName: 'sessions',
    ttl: 24 * 60 * 60,
  }),
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    secure: false,
    httpOnly: true,
    sameSite: 'lax',
  }
}));

// **✅ Initialize Passport AFTER session**
app.use(passport.initialize());
app.use(passport.session());

// **Debugging Middleware**
app.use(async (req, res, next) => {
  console.log("Session ID after login:", req.sessionID);
  console.log("User in session:", req.user);
  if (req.user) {
    console.log('User document in MongoDB:', await User.findById(req.user.id));
  }
  next();
});

// **✅ Authentication Check Route**
app.get('/api/check-auth',  (req, res) => {
  console.log("User:", req.user);
  res.json({ isAuthenticated: true, user: req.user });
});

// **✅ Fix Logout Handling**
app.post('/api/auth/logout', async (req, res) => {
  try {
    req.logout(() => {
      req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.status(200).json({ message: "Logout successful" });
      });
    });
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', isAuthenticated, userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
