import axios from 'axios';

// Tạo instance axios
const instance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:8888',
  timeout: 30000,
});

// Interceptor: Tự động thêm token vào header
instance.interceptors.request.use(
  function (config) {
    const token = localStorage.getItem('access_token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

// Interceptor: Xử lý response và lỗi
instance.interceptors.response.use(
  function (response) {
    // Trả về data thay vì response
    return response.data ? response : response;
  },
  function (error) {
    // Xử lý lỗi 401 (Unauthorized)
    if (error?.response?.status === 401) {
      // Token hết hạn hoặc không hợp lệ
      localStorage.removeItem('access_token');
      
      // Chuyển về trang login nếu không phải trang login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    // Trả về error với cấu trúc chuẩn
    return Promise.reject({
      message: error?.response?.data?.EM || error?.message || 'Có lỗi xảy ra',
      status: error?.response?.status,
      data: error?.response?.data,
    });
  }
);

export default instance;