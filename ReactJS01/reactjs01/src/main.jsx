import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/global.css'

import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import RegisterPage from './pages/register.jsx';
import UserPage from './pages/user.jsx';
import HomePage from './pages/home.jsx';
import LoginPage from './pages/login.jsx';
import ForgotPasswordPage from './pages/forgotPassword.jsx';
import ProductsPage from './pages/products.jsx';
import ProductSearchPage from './pages/productSearch.jsx';
import ProductDetailPage from './pages/productDetail.jsx';
import FavoritesPage from './pages/favorites.jsx';
import ViewHistoryPage from './pages/viewHistory.jsx';
import { AuthWrapper } from './components/context/auth.context.jsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: "user",
        element: <UserPage />
      },
      {
        path: "products",
        element: <ProductsPage />
      },
      {
        path: "product/:id",
        element: <ProductDetailPage />
      },
      {
        path: "search",
        element: <ProductSearchPage />
      },
      {
        path: "favorites",
        element: <FavoritesPage />
      },
      {
        path: "view-history",
        element: <ViewHistoryPage />
      },
    ],
  },
  {
    path: "register",
    element: <RegisterPage />
  },
  {
    path: "login",
    element: <LoginPage />
  },
  {
    path: "forgot-password",
    element: <ForgotPasswordPage />
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthWrapper>
      <RouterProvider router={router} />
    </AuthWrapper>
  </React.StrictMode>,
)
