import axios from './axios.customize';

// User APIs
const createUserApi = (name, email, password) => {
  const URL_API = '/v1/api/register';
  const data = { name, email, password };
  return axios.post(URL_API, data);
};

const loginApi = (email, password) => {
  const URL_API = '/v1/api/login';
  const data = { email, password };
  return axios.post(URL_API, data);
};

const getUserApi = () => {
  const URL_API = '/v1/api/user';
  return axios.get(URL_API);
};

const getAccountApi = () => {
  const URL_API = '/v1/api/account';
  return axios.get(URL_API);
};

// Password Reset APIs
const requestPasswordResetApi = (email) => {
  const URL_API = '/v1/api/forgot-password';
  const data = { email };
  return axios.post(URL_API, data);
};

const verifyOTPApi = (email, otp) => {
  const URL_API = '/v1/api/verify-otp';
  const data = { email, otp };
  return axios.post(URL_API, data);
};

const resetPasswordApi = (email, otp, newPassword) => {
  const URL_API = '/v1/api/reset-password';
  const data = { email, otp, newPassword, confirmPassword: newPassword };
  return axios.post(URL_API, data);
};

const getCategoriesApi = () => {
  const URL_API = '/v1/api/categories';
  return axios.get(URL_API);
};

const getProductsApi = (page = 1, limit = 10, category = 'all') => {
  const URL_API = `/v1/api/products?page=${page}&limit=${limit}&category=${category}`;
  return axios.get(URL_API);
};

const getProductByIdApi = (id) => {
  const URL_API = `/v1/api/products/${id}`;
  return axios.get(URL_API);
};

export { 
  createUserApi, 
  loginApi, 
  getUserApi,
  getAccountApi,
  requestPasswordResetApi,
  verifyOTPApi,
  resetPasswordApi,
  getCategoriesApi,
  getProductsApi,
  getProductByIdApi
};
