import React, { useState } from "react";
import { Form, Input, Button, Typography, message } from "antd";
import { UserOutlined, MailOutlined, LockOutlined } from "@ant-design/icons";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../AuthContext";

const { Title } = Typography;

const SignupPage: React.FC = () => {
  const [form] = Form.useForm();
  const { setAuth } = useAuth();
  const [loading, setLoading] = useState(false); // Loading state for signup button
  const navigate = useNavigate(); // Hook for navigation

  // Handle email/password signup
  const onFinish = async (values: {
    username: string;
    email: string;
    password: string;
  }) => {
    setLoading(true); // Enable loading state
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/signup",
        values,
        { withCredentials: true } // Include credentials (cookies)
      );
      console.log("Signup response:", response);
       setAuth(true);
      message.success("User created successfully");
      navigate("/dashboard"); // Redirect to dashboard after successful signup
    } catch (error: any) {
      console.error("Signup error:", error);
      message.error(
        error.response?.data?.message ||
          "Error creating user. Please try again."
      );
    } finally {
      setLoading(false); // Disable loading state
    }
  };

  // Handle Google signup
  const handleGoogleSuccess = async (credentialResponse: any) => {
    setLoading(true); // Enable loading state
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/google",
        {
          token: credentialResponse.credential,
        },
        { withCredentials: true } // Include credentials (cookies)
      );
      console.log("Google signup response:", response);
      message.success("Signup successful with Google");
       setAuth(true); 
      navigate("/dashboard"); // Redirect to dashboard after successful signup
    } catch (error: any) {
      console.error("Google signup error:", error);
      message.error(
        error.response?.data?.message ||
          "Google signup failed. Please try again."
      );
    } finally {
      setLoading(false); // Disable loading state
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "auto", padding: 50 }}>
      <Title level={2}>Sign Up</Title>
      <Form form={form} onFinish={onFinish}>
        {/* Username Field */}
        <Form.Item
          name="username"
          rules={[{ required: true, message: "Please input your username!" }]}
        >
          <Input prefix={<UserOutlined />} placeholder="Username" />
        </Form.Item>

        {/* Email Field */}
        <Form.Item
          name="email"
          rules={[
            { required: true, message: "Please input your email!" },
            { type: "email", message: "Please enter a valid email address!" },
          ]}
        >
          <Input prefix={<MailOutlined />} placeholder="Email" />
        </Form.Item>

        {/* Password Field */}
        <Form.Item
          name="password"
          rules={[{ required: true, message: "Please input your password!" }]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Password" />
        </Form.Item>

        {/* Signup Button */}
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={loading} // Show loading spinner
            disabled={loading} // Disable button while loading
          >
            Sign Up
          </Button>
        </Form.Item>

        {/* Google Signup Button */}
        <Form.Item>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => {
              message.error("Google signup failed. Please try again.");
            }}
          />
        </Form.Item>

        {/* Login Link */}
        <Form.Item>
          Already have an account? <Link to="/login">Login</Link>
        </Form.Item>
      </Form>
    </div>
  );
};

export default SignupPage;
