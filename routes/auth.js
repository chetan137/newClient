const express = require('express');
const passport = require('passport');
const router = express.Router();
const User = require('../models/User');
const crypto = require('crypto');
const mailer = require('../utils/mailer');
const bcrypt = require('bcryptjs');
const authMiddleware = require("../middleware/authMiddleware.js");


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
  const { email, mobileNumber, password, confirmPassword } = req.body;
console.log("this is ",req.body)
  try {
    // Validate passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Create user (mobile verification will happen separately)
    const user = new User({
      email,
      mobileNumber,
      password,
      isMobileVerified: false // Initially false until OTP verification
    });

    await user.save();
    res.status(201).json({
      message: 'User created successfully. Please verify mobile number.',
      userId: user._id
    });
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



const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY;
const MSG91_OTP_TEMPLATE_ID = process.env.MSG91_OTP_TEMPLATE_ID;
const MSG91_SENDER_ID = process.env.MSG91_SENDER_ID;

// Send OTP
router.post('/send-otp', async (req, res) => {
    try {
        const { mobileNumber } = req.body;

        if (!mobileNumber) {
            return res.status(400).json({ success: false, message: 'Mobile number is required' });
        }

        const response = await axios.get('https://api.msg91.com/api/v5/otp', {
            params: {
                authkey: MSG91_AUTH_KEY,
                mobile: mobileNumber,
                template_id: MSG91_OTP_TEMPLATE_ID,
                sender: MSG91_SENDER_ID,
                otp_expiry: 5 // OTP expiry in minutes
            }
        });

        res.json({
            success: true,
            message: 'OTP sent successfully',
            data: response.data
        });
    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send OTP',
            error: error.response?.data || error.message
        });
    }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
    try {
        const { mobileNumber, otp } = req.body;

        if (!mobileNumber || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Mobile number and OTP are required'
            });
        }

        const response = await axios.get('https://api.msg91.com/api/v5/otp/verify', {
            params: {
                authkey: MSG91_AUTH_KEY,
                mobile: mobileNumber,
                otp: otp
            }
        });

        if (response.data.type === 'success') {
            const user = await User.findOneAndUpdate(
                { mobileNumber },
                { isMobileVerified: true, mobileVerifiedAt: new Date() },
                { new: true }
            );

            return res.json({
                success: true,
                message: 'OTP verified successfully',
                user: user
            });
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP'
            });
        }
    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify OTP',
            error: error.response?.data || error.message
        });
    }
});

// Resend OTP
router.post('/resend-otp', async (req, res) => {
    try {
        const { mobileNumber, retryType } = req.body; // retryType can be 'text' or 'voice'

        if (!mobileNumber) {
            return res.status(400).json({
                success: false,
                message: 'Mobile number is required'
            });
        }

        const response = await axios.get('https://api.msg91.com/api/v5/otp/retry', {
            params: {
                authkey: MSG91_AUTH_KEY,
                mobile: mobileNumber,
                retrytype: retryType || 'text'
            }
        });

        res.json({
            success: true,
            message: 'OTP resent successfully',
            data: response.data
        });
    } catch (error) {
        console.error('Error resending OTP:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to resend OTP',
            error: error.response?.data || error.message
        });
    }
});

router.get('/otp-analytics', async (req, res) => {
    try {
        const response = await axios.get('https://api.msg91.com/api/v5/otp/report', {
            params: {
                authkey: MSG91_AUTH_KEY
            }
        });

        res.json({
            success: true,
            data: response.data
        });
    } catch (error) {
        console.error('Error fetching OTP analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch OTP analytics',
            error: error.response?.data || error.message
        });
    }
});


module.exports = router;
