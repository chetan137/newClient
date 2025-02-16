const express = require('express');
const passport = require('passport');
const router = express.Router();
const User = require('../models/User');
const crypto = require('crypto');
const mailer = require('../utils/mailer');
const bcrypt = require('bcryptjs');
const authMiddleware = require("../middleware/authMiddleware.js");
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  require('dotenv').config();
const nodemailer = require('nodemailer');

  const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
// Email/Password Signup
router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const user = new User({ username, email, password });
    console.log("kkk",user);
    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
router.post('/login', passport.authenticate('local'), async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { currentSessionId: req.sessionID });

    console.log('User after login:', req.user);
    console.log('Session ID after login:', req.sessionID);

    // **✅ Explicitly Save the Session**
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).json({ error: 'Session save failed' });
      }
      res.status(200).json({ message: 'Login successful', user: req.user });
    });
  } catch (error) {
    console.error('Error updating session ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  // Validate email
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash the token and save it to the user
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Create the reset URL
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request',
      text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\nPlease click on the following link, or paste this into your browser to complete the process:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.\n`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Password reset email sent' });
  } catch (err) {
    console.error('Error in /forgot-password:', err); // Log the error
    res.status(400).json({ error: err.message });
  }
});


// Reset Password
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    // Set the new password (the pre-save hook will hash it)
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();
    res.status(200).json({ message: 'Password reset successful' });
  } catch (err) {
    console.error('Error in /reset-password:', err);
    res.status(500).json({ error: 'An error occurred while resetting the password' });
  }
});

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

 // Google OAuth Callback Route (Handles Response from Google)
 router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: 'http://localhost:5173/login' }),
  async (req, res) => {
    try {
      console.log("Google OAuth success! User:", req.user);

      // ✅ Ensure session is saved after authentication
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.redirect('http://localhost:5173/login?error=session_save_failed');
        }

        // ✅ Redirect to the dashboard after successful login
        res.redirect('http://localhost:5173/dashboard');
      });
    } catch (error) {
      console.error('Error during Google OAuth callback:', error);
      res.redirect('http://localhost:5173/login?error=google_oauth_failed');
    }
  }
);

// ✅ POST Route for Google OAuth (Token-based authentication)
router.post('/google', async (req, res) => {
  const { token } = req.body;

  try {
    if (!token) {
      return res.status(400).json({ error: "Missing Google ID token" });
    }

    // ✅ Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(400).json({ error: "Invalid Google token" });
    }

    // ✅ Find or Create User in the Database
    let user = await User.findOne({ googleId: payload.sub });

    if (!user) {
      user = new User({
        googleId: payload.sub,
        email: payload.email,
        username: payload.name,
      });
      await user.save();
    }

    // ✅ Log the user in using Passport
    req.login(user, (err) => {
      if (err) {
        console.error("Login error:", err);
        return res.status(500).json({ error: "Login failed" });
      }

      // ✅ Save the session
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ error: "Session save failed" });
        }

        console.log("Google login successful. User:", user);
        return res.status(200).json({ message: 'Google login successful', user });
      });
    });
  } catch (err) {
    console.error('Error during Google OAuth:', err);
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
