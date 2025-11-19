import React, { useState } from 'react';
import { Button, Col, Divider, Form, Input, notification, Row, Steps, Spin } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { requestPasswordResetApi, verifyOTPApi, resetPasswordApi } from '../util/api';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
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
          description: 'Mã OTP đã được gửi vào email của bạn. Vui lòng kiểm tra!',
        });
        setCurrent(1);
        form.resetFields();
      } else {
        notification.error({
          message: 'Lỗi',
          description: data?.EM ?? 'Email không tồn tại trong hệ thống',
        });
      }
    } catch (err) {
      notification.error({
        message: 'Lỗi',
        description: err?.response?.data?.EM ?? 'Có lỗi xảy ra, vui lòng thử lại',
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
        setOtp(values.otp);
        notification.success({
          message: 'Thành công',
          description: 'Mã OTP hợp lệ. Vui lòng đặt mật khẩu mới!',
        });
        setCurrent(2);
        form.resetFields();
      } else {
        notification.error({
          message: 'Lỗi',
          description: data?.EM ?? 'Mã OTP không hợp lệ hoặc đã hết hạn',
        });
      }
    } catch (err) {
      notification.error({
        message: 'Lỗi',
        description: err?.response?.data?.EM ?? 'Có lỗi xảy ra, vui lòng thử lại',
      });
    } finally {
      setLoading(false);
    }
  };

  // Bước 3: Đặt lại mật khẩu
  const handleResetPassword = async (values) => {
    setLoading(true);
    try {
      const res = await resetPasswordApi(email, otp, values.newPassword);
      const data = res?.data ?? res;

      if (data && data.EC === 0) {
        notification.success({
          message: 'Thành công',
          description: 'Đặt lại mật khẩu thành công! Đang chuyển đến trang đăng nhập...',
        });
        form.resetFields();
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
        description: err?.response?.data?.EM ?? 'Có lỗi xảy ra, vui lòng thử lại',
      });
    } finally {
      setLoading(false);
    }
  };

  const validatePassword = (_, value) => {
    if (!value) {
      return Promise.reject();
    }
    
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
              style={{ marginBottom: '30px' }}
            />

            <Spin spinning={loading}>
              <Form form={form} layout="vertical">
                {/* Bước 1: Nhập Email */}
                {current === 0 && (
                  <>
                    <Form.Item
                      label="Email"
                      name="email"
                      rules={[
                        { 
                          required: true, 
                          message: 'Vui lòng nhập email!' 
                        },
                        { 
                          type: 'email', 
                          message: 'Email không hợp lệ!' 
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
                        Gửi mã OTP
                      </Button>
                    </Form.Item>
                  </>
                )}

                {/* Bước 2: Xác thực OTP */}
                {current === 1 && (
                  <>
                    <div style={{ marginBottom: '16px', textAlign: 'center', color: '#666' }}>
                      Mã OTP đã được gửi đến: <strong>{email}</strong>
                    </div>
                    <Form.Item
                      label="Mã OTP"
                      name="otp"
                      rules={[
                        { 
                          required: true, 
                          message: 'Vui lòng nhập mã OTP!' 
                        },
                        { 
                          len: 6, 
                          message: 'Mã OTP phải có đúng 6 chữ số!' 
                        },
                        {
                          pattern: /^[0-9]+$/,
                          message: 'Mã OTP chỉ được chứa số!',
                        },
                      ]}
                    >
                      <Input
                        placeholder="Nhập 6 chữ số"
                        maxLength={6}
                        autoComplete="off"
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
                    <div style={{ textAlign: 'center' }}>
                      <Button
                        type="link"
                        onClick={() => {
                          setCurrent(0);
                          form.resetFields();
                        }}
                      >
                        Gửi lại mã OTP
                      </Button>
                    </div>
                  </>
                )}

                {/* Bước 3: Đặt lại Mật khẩu */}
                {current === 2 && (
                  <>
                    <Form.Item
                      label="Mật khẩu mới"
                      name="newPassword"
                      rules={[
                        { 
                          required: true, 
                          message: 'Vui lòng nhập mật khẩu mới!' 
                        },
                        {
                          validator: validatePassword,
                        },
                      ]}
                      hasFeedback
                    >
                      <Input.Password 
                        placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                        autoComplete="new-password"
                      />
                    </Form.Item>
                    <Form.Item
                      label="Xác nhận mật khẩu"
                      name="confirmPassword"
                      dependencies={['newPassword']}
                      rules={[
                        { 
                          required: true, 
                          message: 'Vui lòng xác nhận mật khẩu!' 
                        },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (!value || getFieldValue('newPassword') === value) {
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
                        Đặt lại mật khẩu
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