// SignupPage.tsx
import React, { useState } from "react";
import { Form, Input, Button, Typography, message, Card, Steps } from "antd";
import { MailOutlined, LockOutlined, MobileOutlined } from "@ant-design/icons";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import OtpVerification from "../components/OTPVerification";

const { Title } = Typography;
const { Step } = Steps;

const SignupPage: React.FC = () => {
  const [form] = Form.useForm();
  const { setAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [userId, setUserId] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const navigate = useNavigate();

  const onFinishStep1 = async (values: {
    email: string;

    mobileNumber: string;
    password: string;
    confirmPassword: string;
  }) => {
    if (values.password !== values.confirmPassword) {
      message.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/signup",
        {
          email: values.email,
          mobileNumber: values.mobileNumber,
          confirmPassword:values.confirmPassword,
          password: values.password,
        }
      );

      setUserId(response.data.userId);
      setMobileNumber(values.mobileNumber);
      setCurrentStep(1);
    } catch (error: any) {
      message.error(
        error.response?.data?.error || "Error creating user. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSuccess = () => {
    setAuth(true);
    message.success("Registration completed successfully");
    navigate("/dashboard");
  };

  return (
    <div style={{ maxWidth: 500, margin: "auto", padding: "20px 0" }}>
      <Title level={2} style={{ textAlign: "center" }}>
        Sign Up
      </Title>

      <Steps current={currentStep} style={{ marginBottom: 24 }}>
        <Step title="Account Details" />
        <Step title="Mobile Verification" />
      </Steps>

      {currentStep === 0 ? (
        <Card>
          <Form form={form} onFinish={onFinishStep1}>
            {/* Email Field */}
            <Form.Item
              name="email"
              rules={[
                { required: true, message: "Please input your email!" },
                { type: "email", message: "Please enter a valid email!" },
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="Email"
                type="email"
              />
            </Form.Item>

            {/* Mobile Number Field */}
            <Form.Item
              name="mobileNumber"
              rules={[
                { required: true, message: "Please input your mobile number!" },
                {
                  pattern: /^[0-9]{10}$/,
                  message: "Please enter a valid 10-digit mobile number!",
                },
              ]}
            >
              <Input
                prefix={<MobileOutlined />}
                placeholder="Mobile Number"
                maxLength={10}
              />
            </Form.Item>

            {/* Password Field */}
            <Form.Item
              name="password"
              rules={[
                { required: true, message: "Please input your password!" },
                { min: 6, message: "Password must be at least 6 characters!" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Password"
              />
            </Form.Item>

            {/* Confirm Password Field */}
            <Form.Item
              name="confirmPassword"
              dependencies={["password"]}
              rules={[
                { required: true, message: "Please confirm your password!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("The two passwords do not match!")
                    );
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Confirm Password"
              />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block loading={loading}>
                Continue
              </Button>
            </Form.Item>

            <Form.Item style={{ textAlign: "center" }}>
              Already have an account? <Link to="/login">Login</Link>
            </Form.Item>
          </Form>
        </Card>
      ) : (
        <OtpVerification
          mobileNumber={mobileNumber}
          userId={userId}
          onVerificationSuccess={handleVerificationSuccess}
        />
      )}
    </div>
  );
};

export default SignupPage;
