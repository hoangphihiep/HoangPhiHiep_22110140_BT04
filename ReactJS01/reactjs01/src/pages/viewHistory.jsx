import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, Empty, Spin, message, Button, Popconfirm } from 'antd';
import { HistoryOutlined, DeleteOutlined } from '@ant-design/icons';
import { getViewHistoryApi, clearViewHistoryApi, removeFromViewHistoryApi } from '../util/api';
import ProductCard from '../components/product/ProductCard';

const ViewHistoryPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
  });

  useEffect(() => {
    fetchViewHistory();
  }, [pagination.page]);

  const fetchViewHistory = async () => {
    try {
      setLoading(true);
      const res = await getViewHistoryApi(pagination.page, pagination.limit);
      const data = res?.data ?? res;
      if (data?.EC === 0) {
        setProducts(data?.DT?.products ?? []);
        setPagination((prev) => ({
          ...prev,
          total: data?.DT?.pagination?.total || 0,
        }));
      }
    } catch (error) {
      message.error('Không thể tải lịch sử xem');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      const res = await clearViewHistoryApi();
      const data = res?.data ?? res;
      if (data?.EC === 0) {
        message.success('Đã xóa toàn bộ lịch sử xem');
        setProducts([]);
        setPagination({ page: 1, limit: 12, total: 0 });
      }
    } catch (error) {
      message.error('Có lỗi xảy ra');
      console.error(error);
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      const res = await removeFromViewHistoryApi(productId);
      const data = res?.data ?? res;
      if (data?.EC === 0) {
        message.success('Đã xóa khỏi lịch sử');
        fetchViewHistory();
      }
    } catch (error) {
      message.error('Có lỗi xảy ra');
      console.error(error);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>
            <HistoryOutlined /> Lịch sử xem
          </h1>
          <p style={{ color: '#888' }}>
            {pagination.total > 0 ? `${pagination.total} sản phẩm` : 'Chưa có lịch sử xem'}
          </p>
        </div>
        {products.length > 0 && (
          <Popconfirm
            title="Xóa toàn bộ lịch sử xem?"
            onConfirm={handleClearHistory}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button danger icon={<DeleteOutlined />}>
              Xóa tất cả
            </Button>
          </Popconfirm>
        )}
      </div>

      <Spin spinning={loading}>
        {products.length === 0 && !loading ? (
          <Card>
            <Empty
              description="Chưa có lịch sử xem"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Button type="primary" onClick={() => navigate('/products')}>
                Khám phá sản phẩm
              </Button>
            </Empty>
          </Card>
        ) : (
          <Row gutter={[16, 16]}>
            {products.map((product) => (
              <Col xs={24} sm={12} md={8} lg={6} key={product._id}>
                <div
                  onClick={() => navigate(`/product/${product._id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <ProductCard product={product} />
                </div>
              </Col>
            ))}
          </Row>
        )}
      </Spin>
    </div>
  );
};

export default ViewHistoryPage;
