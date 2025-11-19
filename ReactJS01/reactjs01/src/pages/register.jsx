import React from 'react';
import { Button, Col, Divider, Form, Input, notification, Row } from 'antd';
import { createUserApi } from '../util/api';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    const { name, email, password } = values;

    try {
      const res = await createUserApi(name, email, password);
      const data = res?.data ?? res;

      if (data && data.EC === 0) {
        notification.success({
          message: 'Đăng ký thành công',
          description: 'Tài khoản của bạn đã được tạo. Vui lòng đăng nhập!',
        });
        navigate('/login');
      } else {
        notification.error({
          message: 'Đăng ký thất bại',
          description: data?.EM ?? 'Email đã tồn tại hoặc có lỗi xảy ra',
        });
      }
    } catch (error) {
      notification.error({
        message: 'Đăng ký thất bại',
        description: error?.response?.data?.EM ?? 'Có lỗi xảy ra, vui lòng thử lại!',
      });
      console.error(error);
    }
  };

  const validatePassword = (_, value) => {
    if (!value) {
      return Promise.reject();
    }
    
    // Kiểm tra độ mạnh mật khẩu
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    
    if (value.length < 6) {
      return Promise.reject(new Error('Mật khẩu phải có ít nhất 6 ký tự!'));
    }
    
    if (!(hasUpperCase || hasLowerCase) || !hasNumber) {
      return Promise.reject(new Error('Mật khẩu nên chứa chữ cái và số!'));
    }
    
    return Promise.resolve();
  };

  return (
    <Row justify="center" style={{ marginTop: '30px' }}>
      <Col xs={24} md={16} lg={8}>
        <fieldset
          style={{
            padding: '15px',
            margin: '5px',
            border: '1px solid #ccc',
            borderRadius: '5px',
          }}
        >
          <legend>Đăng Ký Tài Khoản</legend>

          <Form
            form={form}
            name="register"
            onFinish={onFinish}
            autoComplete="off"
            layout="vertical"
          >
            {/* Name */}
            <Form.Item
              label="Họ và tên"
              name="name"
              rules={[
                {
                  required: true,
                  message: 'Vui lòng nhập họ tên!',
                },
                {
                  min: 2,
                  message: 'Họ tên phải có ít nhất 2 ký tự!',
                },
                {
                  max: 50,
                  message: 'Họ tên không được vượt quá 50 ký tự!',
                },
                {
                  whitespace: true,
                  message: 'Họ tên không được chỉ chứa khoảng trắng!',
                },
                {
                  pattern: /^[a-zA-ZÀ-ỹ\s]+$/,
                  message: 'Họ tên chỉ được chứa chữ cái!',
                },
              ]}
            >
              <Input 
                placeholder="Nguyễn Văn A"
                autoComplete="name"
              />
            </Form.Item>

            {/* Email */}
            <Form.Item
              label="Email"
              name="email"
              rules={[
                {
                  required: true,
                  message: 'Vui lòng nhập email!',
                },
                {
                  type: 'email',
                  message: 'Email không hợp lệ!',
                },
                {
                  whitespace: true,
                  message: 'Email không được chỉ chứa khoảng trắng!',
                },
              ]}
            >
              <Input 
                placeholder="example@email.com"
                autoComplete="email"
              />
            </Form.Item>

            {/* Password */}
            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={[
                {
                  required: true,
                  message: 'Vui lòng nhập mật khẩu!',
                },
                {
                  validator: validatePassword,
                },
              ]}
              hasFeedback
            >
              <Input.Password 
                placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
                autoComplete="new-password"
              />
            </Form.Item>

            {/* Confirm Password */}
            <Form.Item
              label="Xác nhận mật khẩu"
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                {
                  required: true,
                  message: 'Vui lòng xác nhận mật khẩu!',
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                  },
                }),
              ]}
              hasFeedback
            >
              <Input.Password 
                placeholder="Nhập lại mật khẩu"
                autoComplete="new-password"
              />
            </Form.Item>

            {/* Submit button */}
            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                Đăng ký
              </Button>
            </Form.Item>
          </Form>

          <Link to="/">
            <ArrowLeftOutlined /> Quay lại trang chủ
          </Link>

          <Divider />

          <div style={{ textAlign: 'center' }}>
            Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
          </div>
        </fieldset>
      </Col>
    </Row>
  );
};

export default RegisterPage;