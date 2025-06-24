const express = require('express');
const router = express.Router();
const User = require('../models/User');
const msg91Service = require('../services/msg91Service');

// Send OTP
router.post('/send-otp', async (req, res) => {
  const { mobileNumber } = req.body;

  if (!mobileNumber) {
    return res.status(400).json({ success: false, error: 'Mobile number is required' });
  }

  // Check if mobile number already exists and is verified
  const existingUser = await User.findOne({ mobileNumber, isMobileVerified: true });
  if (existingUser) {
    return res.status(400).json({ success: false, error: 'Mobile number already registered and verified' });
  }

  const result = await msg91Service.sendOTP(mobileNumber);

  if (result.success) {
    res.json({ success: true, message: 'OTP sent successfully' });
  } else {
    res.status(400).json({ success: false, error: result.error });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  const { mobileNumber, otp, username, password } = req.body;

  if (!mobileNumber || !otp) {
    return res.status(400).json({ success: false, error: 'Mobile number and OTP are required' });
  }

  const result = await msg91Service.verifyOTP(mobileNumber, otp);

  if (result.success) {
    try {
      // Check if user exists with this mobile number
      let user = await User.findOne({ mobileNumber });

      if (user) {
        // Update existing user
        user.isMobileVerified = true;
        if (username) user.username = username;
        if (password) user.password = password;
      } else {
        // Create new user if username and password are provided
        if (!username || !password) {
          return res.status(400).json({
            success: false,
            error: 'Username and password are required for new registration'
          });
        }
        user = new User({
          username,
          mobileNumber,
          password,
          isMobileVerified: true
        });
      }

      await user.save();

      res.json({
        success: true,
        message: 'OTP verified successfully',
        user: {
          id: user._id,
          username: user.username,
          mobileNumber: user.mobileNumber,
          isMobileVerified: user.isMobileVerified
        }
      });
    } catch (error) {
      console.error('User save error:', error);
      res.status(500).json({ success: false, error: 'Failed to save user data' });
    }
  } else {
    res.status(400).json({ success: false, error: result.error });
  }
});

// Resend OTP
router.post('/resend-otp', async (req, res) => {
  const { mobileNumber } = req.body;

  if (!mobileNumber) {
    return res.status(400).json({ success: false, error: 'Mobile number is required' });
  }

  const result = await msg91Service.resendOTP(mobileNumber);

  if (result.success) {
    res.json({ success: true, message: 'OTP resent successfully' });
  } else {
    res.status(400).json({ success: false, error: result.error });
  }
});

module.exports = router;
