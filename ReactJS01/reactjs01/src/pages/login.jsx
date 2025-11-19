import React, { useContext } from 'react';
import { Button, Col, Divider, Form, Input, notification, Row } from 'antd';
import { loginApi } from '../util/api';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../components/context/auth.context';
import { ArrowLeftOutlined } from '@ant-design/icons';

const LoginPage = () => {
  const navigate = useNavigate();
  const { setAuth } = useContext(AuthContext);
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    const { email, password } = values;

    try {
      const res = await loginApi(email, password);
      const data = res?.data ?? res;

      if (data && data.EC === 0) {
        localStorage.setItem('access_token', data.access_token);
        notification.success({ 
          message: 'Đăng nhập thành công', 
          description: 'Chào mừng bạn trở lại!' 
        });
        setAuth({
          isAuthenticated: true,
          user: {
            email: data.user?.email ?? '',
            name: data.user?.name ?? '',
          },
        });
        navigate('/');
      } else {
        notification.error({ 
          message: 'Đăng nhập thất bại', 
          description: data?.EM ?? 'Email hoặc mật khẩu không đúng' 
        });
      }
    } catch (err) {
      notification.error({ 
        message: 'Đăng nhập thất bại', 
        description: err?.message ?? 'Có lỗi xảy ra, vui lòng thử lại' 
      });
    }
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
          <legend>Đăng Nhập</legend>
          <Form
            form={form}
            name="login"
            onFinish={onFinish}
            autoComplete="off"
            layout="vertical"
          >
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

            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={[
                {
                  required: true,
                  message: 'Vui lòng nhập mật khẩu!',
                },
                {
                  min: 6,
                  message: 'Mật khẩu phải có ít nhất 6 ký tự!',
                },
              ]}
            >
              <Input.Password 
                placeholder="Nhập mật khẩu"
                autoComplete="current-password"
              />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                Đăng nhập
              </Button>
            </Form.Item>
          </Form>

          <Link to="/">
            <ArrowLeftOutlined /> Quay lại trang chủ
          </Link>
          <Divider />
          <div style={{ textAlign: 'center' }}>
            <div>
              <Link to="/forgot-password">Quên mật khẩu?</Link>
            </div>
            <Divider />
            Chưa có tài khoản? <Link to="/register">Đăng ký tại đây</Link>
          </div>
        </fieldset>
      </Col>
    </Row>
  );
};

export default LoginPage;