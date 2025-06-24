import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Input, Button, Typography, message } from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import axios from "axios";
// import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../AuthContext";

const { Title } = Typography;

const LoginPage: React.FC = () => {
  const [form] = Form.useForm();
   const { setAuth } = useAuth();
  const [loading, setLoading] = useState(false); // Loading state for login button
  const navigate = useNavigate(); // Hook for navigation

  // Handle email/password login
  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true); // Enable loading state
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email: values.email,
          password: values.password,
        },
        { withCredentials: true } // Include credentials (cookies)
      );
       setAuth(true);
      console.log("Login response:", response);
      message.success("Login successful");
      navigate("/dashboard"); // Redirect to dashboard after successful login
    } catch (error: any) {
      console.error("Login error:", error);
      message.error(
        error.response?.data?.message ||
          "Invalid credentials. Please try again."
      );
    } finally {
      setLoading(false); // Disable loading state
    }
  };

  // Handle Google login
  // const handleGoogleSuccess = async (credentialResponse: any) => {
  //   setLoading(true); // Enable loading state
  //   try {
  //     const response = await axios.post(
  //       "http://localhost:5000/api/auth/google",
  //       {
  //         token: credentialResponse.credential,
  //       },
  //       { withCredentials: true } // Include credentials (cookies)
  //     );
  //      setAuth(true);
  //     console.log("Google login response:", response);
  //     message.success("Google login successful");
  //     navigate("/dashboard"); // Redirect to dashboard after successful login
  //   } catch (error: any) {
  //     console.error("Google login error:", error);
  //     message.error(
  //       error.response?.data?.message ||
  //         "Google login failed. Please try again."
  //     );
  //   } finally {
  //     setLoading(false); // Disable loading state
  //   }
  // };

  return (
    <div style={{ maxWidth: 400, margin: "auto", padding: 50 }}>
      <Title level={2}>Login</Title>
      <Form form={form} onFinish={onFinish}>
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

        {/* Login Button */}
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={loading} // Show loading spinner
            disabled={loading} // Disable button while loading
          >
            Login
          </Button>
        </Form.Item>

        {/* Google Login Button */}
        {/* <Form.Item>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => {
              message.error("Google login failed. Please try again.");
            }}
          />
        </Form.Item> */}

        {/* Forgot Password Link */}
        <Form.Item>
          <Link to="/forgot-password">Forgot Password?</Link>
        </Form.Item>

        {/* Signup Link */}
        <Form.Item>
          Don't have an account? <Link to="/signup">Sign up</Link>
        </Form.Item>
      </Form>
    </div>
  );
};

export default LoginPage;
