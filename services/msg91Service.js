const axios = require('axios');

class MSG91Service {
  constructor() {
    this.authKey = process.env.MSG91_AUTH_KEY;
    this.templateId = process.env.MSG91_OTP_TEMPLATE_ID;
    this.baseUrl = 'https://api.msg91.com/api/v5';
  }

  async sendOTP(mobileNumber) {
    try {
      const response = await axios.post(`${this.baseUrl}/otp`, {
        template_id: this.templateId,
        mobile: `91${mobileNumber}`, // Assuming Indian numbers (91 is country code)
      }, {
        headers: {
          'authkey': this.authKey,
          'Content-Type': 'application/json'
        }
      });

      return { success: true, data: response.data };
    } catch (error) {
      console.error('MSG91 Send OTP Error:', error.response?.data || error.message);
      return { success: false, error: error.response?.data?.message || 'Failed to send OTP' };
    }
  }

  async verifyOTP(mobileNumber, otp) {
    try {
      const response = await axios.get(`${this.baseUrl}/otp/verify`, {
        params: {
          mobile: `91${mobileNumber}`,
          otp: otp
        },
        headers: {
          'authkey': this.authKey
        }
      });

      return { success: true, data: response.data };
    } catch (error) {
      console.error('MSG91 Verify OTP Error:', error.response?.data || error.message);
      return { success: false, error: error.response?.data?.message || 'Invalid OTP' };
    }
  }

  async resendOTP(mobileNumber, retryType = 'text') {
    try {
      const response = await axios.get(`${this.baseUrl}/otp/retry`, {
        params: {
          mobile: `91${mobileNumber}`,
          retrytype: retryType
        },
        headers: {
          'authkey': this.authKey
        }
      });

      return { success: true, data: response.data };
    } catch (error) {
      console.error('MSG91 Resend OTP Error:', error.response?.data || error.message);
      return { success: false, error: error.response?.data?.message || 'Failed to resend OTP' };
    }
  }
}

module.exports = new MSG91Service();
