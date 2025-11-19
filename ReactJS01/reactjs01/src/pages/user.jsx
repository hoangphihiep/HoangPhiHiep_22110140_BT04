import { notification, Table } from 'antd';
import { useEffect, useState } from 'react';
import { getUserApi } from '../util/api';

const UserPage = () => {
  const [dataSource, setDataSource] = useState([]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getUserApi();

        // Lấy danh sách user từ API
        const userList = res?.data?.data || res?.data || [];

        if (Array.isArray(userList)) {
          setDataSource(userList);
        } else {
          setDataSource([]);
        }
      } catch (err) {
        notification.error({
          message: 'Error',
          description: err?.message ?? JSON.stringify(err),
        });
      }
    };

    fetchUser();
  }, []);

  const columns = [
    { title: 'Id', dataIndex: '_id' },
    { title: 'Email', dataIndex: 'email' },
    { title: 'Name', dataIndex: 'name' },
    { title: 'Role', dataIndex: 'role' },
  ];

  return (
    <div style={{ padding: 30 }}>
      <Table bordered dataSource={dataSource} columns={columns} rowKey={'_id'} />
    </div>
  );
};

export default UserPage;
