import { Row, Col, Spin, Empty, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import ProductCard from './ProductCard';

const ProductGrid = ({ products, loading, hasMore, onLoadMore }) => {
  const navigate = useNavigate();

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  return (
    <div>
      {loading && products.length === 0 ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
          <Spin />
        </div>
      ) : products.length === 0 ? (
        <Empty description="No products found" style={{ padding: '50px' }} />
      ) : (
        <>
          <Row gutter={[16, 16]}>
            {products.map(product => (
              <Col xs={24} sm={12} md={8} lg={6} key={product._id}>
                <div onClick={() => handleProductClick(product._id)} style={{ cursor: 'pointer' }}>
                  <ProductCard product={product} />
                </div>
              </Col>
            ))}
          </Row>
          {hasMore && (
            <div style={{ textAlign: 'center', marginTop: '32px' }}>
              <Button
                type="primary"
                size="large"
                loading={loading}
                onClick={onLoadMore}
              >
                Load More Products
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductGrid;
