import React from "react";
import { Form, Input, Button, Typography, message } from "antd";
import { LockOutlined } from "@ant-design/icons";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const { Title } = Typography;

const ResetPasswordPage: React.FC = () => {
  const [form] = Form.useForm();
  const { token } = useParams();
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    try {
      const response = await axios.post(
        `http://localhost:5000/api/auth/reset-password/${token}`,
        values,
        { withCredentials: true }
      );
      console.log(response);
      message.success("Password reset successful");
      navigate("/login"); // Redirect to login page
    } catch (error) {
      message.error("Error resetting password");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "auto", padding: 50 }}>
      <Title level={2}>Reset Password</Title>
      <Form form={form} onFinish={onFinish}>
        <Form.Item
          name="password"
          rules={[
            { required: true, message: "Please input your new password!" },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="New Password"
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Reset Password
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ResetPasswordPage;
