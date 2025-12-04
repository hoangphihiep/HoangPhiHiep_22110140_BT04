import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, Empty, Spin, message, Button } from 'antd';
import { HeartOutlined } from '@ant-design/icons';
import { getFavoritesApi, removeFromFavoritesApi } from '../util/api';
import ProductCard from '../components/product/ProductCard';

const FavoritesPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
  });

  useEffect(() => {
    fetchFavorites();
  }, [pagination.page]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const res = await getFavoritesApi(pagination.page, pagination.limit);
      const data = res?.data ?? res;
      if (data?.EC === 0) {
        setProducts(data?.DT?.products ?? []);
        setPagination((prev) => ({
          ...prev,
          total: data?.DT?.pagination?.total || 0,
        }));
      }
    } catch (error) {
      message.error('Không thể tải danh sách yêu thích');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (productId) => {
    try {
      const res = await removeFromFavoritesApi(productId);
      const data = res?.data ?? res;
      if (data?.EC === 0) {
        message.success('Đã xóa khỏi yêu thích');
        fetchFavorites();
      }
    } catch (error) {
      message.error('Có lỗi xảy ra');
      console.error(error);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1>
          <HeartOutlined style={{ color: '#ff4d4f' }} /> Sản phẩm yêu thích
        </h1>
        <p style={{ color: '#888' }}>
          {pagination.total > 0 ? `${pagination.total} sản phẩm` : 'Chưa có sản phẩm yêu thích'}
        </p>
      </div>

      <Spin spinning={loading}>
        {products.length === 0 && !loading ? (
          <Card>
            <Empty
              description="Chưa có sản phẩm yêu thích"
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

export default FavoritesPage;
