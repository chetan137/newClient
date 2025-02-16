const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User.js');
const bcrypt = require('bcryptjs');

// Local Strategy
passport.use(
  new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
      const user = await User.findOne({ email }).select('+password'); // Include password field
      if (!user) return done(null, false, { message: 'User not found' });

      // Compare passwords
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return done(null, false, { message: 'Invalid credentials' });

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          user = new User({
            googleId: profile.id,
            email: profile.emails[0].value,
            username: profile.displayName,
          });
          await user.save();
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

// Serialize User (Stores only user ID in session)
passport.serializeUser((user, done) => {
  console.log("Serializing user:", user.id);
  done(null, user.id);
});

// Deserialize User (Retrieve user from ID stored in session)

passport.deserializeUser(async (id, done) => {
  try {
    console.log("🔄 Deserializing user, looking up ID:", id);

    const user = await User.findById(id);
    if (!user) {
      console.log("❌ User not found in database");
      return done(null, false);
    }

    console.log("✅ User found and restored:", user);
    done(null, user);
  } catch (err) {
    console.error("❌ Error in deserialization:", err);
    done(err, null);
  }
});


module.exports = passport;
