import React, { useState } from 'react';
import { Button, Col, Divider, Form, Input, notification, Row, Steps, Spin } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { requestPasswordResetApi, verifyOTPApi, resetPasswordApi } from '../util/api';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0); // 0: Email, 1: Verify OTP, 2: Reset Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(''); // Lưu OTP vào state
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // Bước 1: Gửi yêu cầu reset password
  const handleRequestReset = async (values) => {
    setLoading(true);
    try {
      const res = await requestPasswordResetApi(values.email);
      const data = res?.data ?? res;

      if (data && data.EC === 0) {
        setEmail(values.email);
        notification.success({
          message: 'Thành công',
          description: 'OTP đã được gửi vào email của bạn',
        });
        setCurrent(1);
        form.resetFields();
      } else {
        notification.error({
          message: 'Lỗi',
          description: data?.EM ?? 'Yêu cầu thất bại',
        });
      }
    } catch (err) {
      notification.error({
        message: 'Lỗi',
        description: err?.message ?? 'Có lỗi xảy ra',
      });
    } finally {
      setLoading(false);
    }
  };

  // Bước 2: Xác thực OTP
  const handleVerifyOTP = async (values) => {
    setLoading(true);
    try {
      const res = await verifyOTPApi(email, values.otp);
      const data = res?.data ?? res;

      if (data && data.EC === 0) {
        setOtp(values.otp); // Lưu OTP vào state
        notification.success({
          message: 'Thành công',
          description: 'OTP xác thực thành công',
        });
        setCurrent(2);
        form.resetFields();
      } else {
        notification.error({
          message: 'Lỗi',
          description: data?.EM ?? 'OTP không hợp lệ',
        });
      }
    } catch (err) {
      notification.error({
        message: 'Lỗi',
        description: err?.message ?? 'Có lỗi xảy ra',
      });
    } finally {
      setLoading(false);
    }
  };

  // Bước 3: Đặt lại mật khẩu
  const handleResetPassword = async (values) => {
    if (values.newPassword !== values.confirmPassword) {
      notification.error({
        message: 'Lỗi',
        description: 'Mật khẩu xác nhận không khớp',
      });
      return;
    }

    setLoading(true);
    try {
      const res = await resetPasswordApi(email, otp, values.newPassword);
      const data = res?.data ?? res;

      if (data && data.EC === 0) {
        notification.success({
          message: 'Thành công',
          description: 'Đặt lại mật khẩu thành công',
        });
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        notification.error({
          message: 'Lỗi',
          description: data?.EM ?? 'Đặt lại mật khẩu thất bại',
        });
      }
    } catch (err) {
      notification.error({
        message: 'Lỗi',
        description: err?.message ?? 'Có lỗi xảy ra',
      });
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { title: 'Nhập Email' },
    { title: 'Xác thực OTP' },
    { title: 'Mật khẩu mới' },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <Row justify="center" style={{ marginTop: '20px' }}>
        <Col xs={24} md={16} lg={8}>
          <fieldset
            style={{
              padding: '20px',
              margin: '5px',
              border: '1px solid #ccc',
              borderRadius: '5px',
            }}
          >
            <legend>Quên Mật Khẩu</legend>

            <Steps 
                current={current} 
                items={steps} 
                style={{ marginBottom: '30px' }} />

            <Spin spinning={loading}>
              <Form form={form} layout="vertical" onFinish={() => {}}>
                {/* Bước 1: Nhập Email */}
                {current === 0 && (
                  <>
                    <Form.Item
                      label="Email"
                      name="email"
                      rules={[
                        { required: true, message: 'Vui lòng nhập email!' },
                        { type: 'email', message: 'Email không hợp lệ!' },
                      ]}
                    >
                      <Input placeholder="Nhập email của bạn" />
                    </Form.Item>
                    <Form.Item>
                      <Button
                        type="primary"
                        block
                        onClick={() => {
                          form.validateFields(['email']).then((values) => {
                            handleRequestReset(values);
                          });
                        }}
                      >
                        Gửi OTP
                      </Button>
                    </Form.Item>
                  </>
                )}

                {/* Bước 2: Xác thực OTP */}
                {current === 1 && (
                  <>
                    <Form.Item
                      label="Mã OTP"
                      name="otp"
                      rules={[
                        { required: true, message: 'Vui lòng nhập OTP!' },
                        { len: 6, message: 'OTP phải có 6 chữ số!' },
                      ]}
                    >
                      <Input
                        placeholder="Nhập 6 chữ số OTP"
                        maxLength={6}
                        type="text"
                      />
                    </Form.Item>
                    <Form.Item>
                      <Button
                        type="primary"
                        block
                        onClick={() => {
                          form.validateFields(['otp']).then((values) => {
                            handleVerifyOTP(values);
                          });
                        }}
                      >
                        Xác thực OTP
                      </Button>
                    </Form.Item>
                  </>
                )}

                {/* Bước 3: Đặt lại Mật khẩu */}
                {current === 2 && (
                  <>
                    <Form.Item
                      label="Mật khẩu mới"
                      name="newPassword"
                      rules={[
                        { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                        { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
                      ]}
                    >
                      <Input.Password placeholder="Nhập mật khẩu mới" />
                    </Form.Item>
                    <Form.Item
                      label="Xác nhận mật khẩu"
                      name="confirmPassword"
                      rules={[
                        { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                      ]}
                    >
                      <Input.Password placeholder="Xác nhận mật khẩu" />
                    </Form.Item>
                    <Form.Item>
                      <Button
                        type="primary"
                        block
                        onClick={() => {
                          form
                            .validateFields(['newPassword', 'confirmPassword'])
                            .then((values) => {
                              handleResetPassword(values);
                            });
                        }}
                      >
                        Đặt lại Mật khẩu
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form>
            </Spin>

            <Divider />

            <div style={{ textAlign: 'center' }}>
              <Link to="/login">
                <ArrowLeftOutlined /> Quay lại đăng nhập
              </Link>
            </div>
          </fieldset>
        </Col>
      </Row>
    </div>
  );
};

export default ForgotPasswordPage;
