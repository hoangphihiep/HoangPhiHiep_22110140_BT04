import React, { useContext, useState } from 'react';
import { UsergroupAddOutlined, HomeOutlined, UserOutlined, ShoppingOutlined, SearchOutlined, HeartOutlined, HistoryOutlined } from '@ant-design/icons';
import { Menu, Avatar } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/auth.context';

const Header = () => {
  const navigate = useNavigate();
  const { auth, setAuth } = useContext(AuthContext);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setAuth({
      isAuthenticated: false,
      user: { email: '', name: '', role: '' },
    });
    navigate('/');
  };

  const items = [
    {
      label: <Link to={'/'}>Home Page</Link>,
      key: 'home',
      icon: <HomeOutlined />,
    },
    {
      label: <Link to={'/products'}>Products</Link>,
      key: 'products',
      icon: <ShoppingOutlined />,
    },
    {
      label: <Link to={'/search'}>Tìm kiếm</Link>,
      key: 'search',
      icon: <SearchOutlined />,
    },
    ...(auth?.isAuthenticated
      ? [
          {
            label: <Link to={'/favorites'}>Yêu thích</Link>,
            key: 'favorites',
            icon: <HeartOutlined />,
          },
          {
            label: <Link to={'/view-history'}>Đã xem</Link>,
            key: 'history',
            icon: <HistoryOutlined />,
          },
        ]
      : []),
    ...(auth?.isAuthenticated && auth?.user?.role === 'Admin'
      ? [
          {
            label: <Link to={'/user'}>Users</Link>,
            key: 'user',
            icon: <UsergroupAddOutlined />,
          },
        ]
      : []),
    {
      label: auth?.isAuthenticated 
        ? `${auth.user.name} (${auth.user.role})` 
        : 'Tài khoản',
      key: 'account',
      icon: auth?.isAuthenticated ? <Avatar size="small">{auth.user.name?.charAt(0)}</Avatar> : <UserOutlined />,
      children: [
        ...(auth?.isAuthenticated
          ? [
              {
                label: <span>Email: {auth.user.email}</span>,
                key: 'email',
                disabled: true,
              },
              {
                type: 'divider',
              },
              {
                label: <span onClick={handleLogout}>Đăng xuất</span>,
                key: 'logout',
              },
            ]
          : [
              {
                label: <Link to={'/login'}>Đăng nhập</Link>,
                key: 'login',
              },
              {
                label: <Link to={'/register'}>Đăng ký</Link>,
                key: 'register',
              },
            ]),
      ],
    },
  ];

  const [current, setCurrent] = useState('home');
  const onClick = (e) => {
    setCurrent(e.key);
  };

  return <Menu onClick={onClick} selectedKeys={[current]} mode="horizontal" items={items} />;
};

export default Header;
