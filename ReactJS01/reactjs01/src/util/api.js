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

// Search Products API with filters
const searchProductsApi = (params) => {
  const URL_API = '/v1/api/products/search';
  return axios.get(URL_API, { params });
};

// Similar Products API
const getSimilarProductsApi = (productId, limit = 6) => {
  const URL_API = `/v1/api/products/${productId}/similar?limit=${limit}`;
  return axios.get(URL_API);
};

// Favorites APIs
const addToFavoritesApi = (productId) => {
  const URL_API = '/v1/api/favorites';
  const data = { productId };
  return axios.post(URL_API, data);
};

const removeFromFavoritesApi = (productId) => {
  const URL_API = `/v1/api/favorites/${productId}`;
  return axios.delete(URL_API);
};

const getFavoritesApi = (page = 1, limit = 12) => {
  const URL_API = `/v1/api/favorites?page=${page}&limit=${limit}`;
  return axios.get(URL_API);
};

const checkIsFavoriteApi = (productId) => {
  const URL_API = `/v1/api/favorites/check/${productId}`;
  return axios.get(URL_API);
};

// Reviews APIs
const addReviewApi = (productId, rating, comment) => {
  const URL_API = '/v1/api/reviews';
  const data = { productId, rating, comment };
  return axios.post(URL_API, data);
};

const updateReviewApi = (reviewId, rating, comment) => {
  const URL_API = `/v1/api/reviews/${reviewId}`;
  const data = { rating, comment };
  return axios.put(URL_API, data);
};

const deleteReviewApi = (reviewId) => {
  const URL_API = `/v1/api/reviews/${reviewId}`;
  return axios.delete(URL_API);
};

const getProductReviewsApi = (productId, page = 1, limit = 10) => {
  const URL_API = `/v1/api/products/${productId}/reviews?page=${page}&limit=${limit}`;
  return axios.get(URL_API);
};

const getProductReviewStatsApi = (productId) => {
  const URL_API = `/v1/api/products/${productId}/reviews/stats`;
  return axios.get(URL_API);
};

// View History APIs
const addToViewHistoryApi = (productId) => {
  const URL_API = '/v1/api/view-history';
  const data = { productId };
  return axios.post(URL_API, data);
};

const getViewHistoryApi = (page = 1, limit = 12) => {
  const URL_API = `/v1/api/view-history?page=${page}&limit=${limit}`;
  return axios.get(URL_API);
};

const clearViewHistoryApi = () => {
  const URL_API = '/v1/api/view-history';
  return axios.delete(URL_API);
};

const removeFromViewHistoryApi = (productId) => {
  const URL_API = `/v1/api/view-history/${productId}`;
  return axios.delete(URL_API);
};

const getProductViewCountApi = (productId) => {
  const URL_API = `/v1/api/products/${productId}/view-count`;
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
  getProductByIdApi,
  searchProductsApi,
  getSimilarProductsApi,
  // Favorites
  addToFavoritesApi,
  removeFromFavoritesApi,
  getFavoritesApi,
  checkIsFavoriteApi,
  // Reviews
  addReviewApi,
  updateReviewApi,
  deleteReviewApi,
  getProductReviewsApi,
  getProductReviewStatsApi,
  // View History
  addToViewHistoryApi,
  getViewHistoryApi,
  clearViewHistoryApi,
  removeFromViewHistoryApi,
  getProductViewCountApi,
};
