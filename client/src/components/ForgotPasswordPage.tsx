import React from "react";
import { Form, Input, Button, Typography, message } from "antd";
import { MailOutlined } from "@ant-design/icons";
import axios from "axios";
import { Link } from "react-router-dom";

const { Title } = Typography;

const ForgotPasswordPage: React.FC = () => {
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/forgot-password",
        values,
        {
          withCredentials: true,
        }
      );
      console.log(response);
      message.success("Password reset email sent");
    } catch (error) {
      message.error("Error sending password reset email");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "auto", padding: 50 }}>
      <Title level={2}>Forgot Password</Title>
      <Form form={form} onFinish={onFinish}>
        <Form.Item
          name="email"
          rules={[{ required: true, message: "Please input your email!" }]}
        >
          <Input prefix={<MailOutlined />} placeholder="Email" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Send Reset Link
          </Button>
        </Form.Item>
        <Form.Item>
          <Link to="/login">Back to Login</Link>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ForgotPasswordPage;
