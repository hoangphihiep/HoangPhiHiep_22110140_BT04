import { createContext, useState, useEffect } from 'react';
import { notification } from 'antd';
import axios from '../../util/axios.customize';

export const AuthContext = createContext({
  isAuthenticated: false,
  user: {
    email: '',
    name: '',
    role: '',
  },
  appLoading: true,
});

export const AuthWrapper = (props) => {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    user: {
      email: '',
      name: '',
      role: '',
    },
  });

  const [appLoading, setAppLoading] = useState(true);

  // Hàm lấy thông tin user từ token
  const fetchAccount = async () => {
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        setAppLoading(false);
        return;
      }

      // Gọi API để lấy thông tin user hiện tại
      const res = await axios.get('/v1/api/account');
      const data = res?.data ?? res;

      if (data && data.email) {
        setAuth({
          isAuthenticated: true,
          user: {
            email: data.email ?? '',
            name: data.name ?? '',
            role: data.role ?? 'User',
          },
        });
      } else {
        // Token không hợp lệ, xóa đi
        localStorage.removeItem('access_token');
      }
    } catch (error) {
      console.error('Error fetching account:', error);
      
      // Nếu token hết hạn hoặc không hợp lệ
      if (error?.response?.status === 401) {
        localStorage.removeItem('access_token');
        notification.error({
          message: 'Phiên đăng nhập hết hạn',
          description: 'Vui lòng đăng nhập lại',
        });
      }
    } finally {
      setAppLoading(false);
    }
  };

  // Khôi phục trạng thái đăng nhập khi app load
  useEffect(() => {
    fetchAccount();
  }, []);

  return (
    <AuthContext.Provider value={{ auth, setAuth, appLoading, setAppLoading }}>
      {props.children}
    </AuthContext.Provider>
  );
};