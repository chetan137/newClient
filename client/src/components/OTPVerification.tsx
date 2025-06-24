import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Typography,
  message,
  Row,
  Col,
  Space,
  Statistic,
} from "antd";
import { LockOutlined, MobileOutlined } from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;
const { Countdown } = Statistic;

interface OTPVerificationProps {
  mobileNumber: string;
  onVerificationSuccess: (data: any) => void;
  onBack?: () => void;
}

const OTPVerification: React.FC<OTPVerificationProps> = ({
  mobileNumber,
  onVerificationSuccess,
  onBack,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(Date.now() + 60000);
  const [canResend, setCanResend] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = countdown - Date.now();
      if (remaining <= 0) {
        setCanResend(true);
        clearInterval(timer);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleVerifyOTP = async (values: { otp: string }) => {
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/otp/verify-otp",
        {
          mobileNumber,
          otp: values.otp,
        }
      );

      if (response.data.success) {
        message.success("Mobile number verified successfully");
        onVerificationSuccess(response.data.user);
      } else {
        message.error(response.data.error || "OTP verification failed");
      }
    } catch (error: any) {
      console.error("OTP verification error:", error);
      message.error(
        error.response?.data?.error || "An error occurred during verification"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/otp/resend-otp",
        {
          mobileNumber,
        }
      );

      if (response.data.success) {
        message.success("OTP resent successfully");
        setCountdown(Date.now() + 60000);
        setCanResend(false);
      } else {
        message.error(response.data.error || "Failed to resend OTP");
      }
    } catch (error: any) {
      console.error("Resend OTP error:", error);
      message.error(
        error.response?.data?.error || "An error occurred while resending OTP"
      );
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "auto" }}>
      <Title level={3} style={{ textAlign: "center", marginBottom: 24 }}>
        Verify Mobile Number
      </Title>

      <Text style={{ display: "block", marginBottom: 16 }}>
        We've sent a 6-digit OTP to <strong>+91 {mobileNumber}</strong>
      </Text>

      <Form form={form} onFinish={handleVerifyOTP}>
        <Form.Item
          name="otp"
          rules={[
            { required: true, message: "Please enter the OTP" },
            { pattern: /^\d{6}$/, message: "OTP must be 6 digits" },
          ]}
        >
          <Input maxLength={6} placeholder="Enter OTP" />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={loading}
            icon={<LockOutlined />}
          >
            Verify OTP
          </Button>
        </Form.Item>

        <Row justify="space-between" align="middle">
          <Col>
            {canResend ? (
              <Button
                type="link"
                onClick={handleResendOTP}
                loading={resendLoading}
              >
                Resend OTP
              </Button>
            ) : (
              <Text type="secondary">
                Resend OTP in{" "}
                <Countdown
                  value={countdown}
                  format="s"
                  onFinish={() => setCanResend(true)}
                />
              </Text>
            )}
          </Col>
          {onBack && (
            <Col>
              <Button type="link" onClick={onBack}>
                Back
              </Button>
            </Col>
          )}
        </Row>
      </Form>
    </div>
  );
};

export default OTPVerification;
