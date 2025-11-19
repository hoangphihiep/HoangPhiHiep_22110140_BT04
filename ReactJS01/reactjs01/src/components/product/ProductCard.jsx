import { Card, Button, Space, Tag, Image } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';

const ProductCard = ({ product }) => {
  const handleAddToCart = () => {
    console.log('Add to cart:', product._id);
    // Implement add to cart logic later
  };

  return (
    <Card
      hoverable
      style={{ width: '100%' }}
      cover={
        product.image ? (
          <Image
            alt={product.name}
            src={product.image || "/placeholder.svg"}
            style={{ height: '200px', objectFit: 'cover' }}
            preview={false}
          />
        ) : (
          <div style={{
            height: '200px',
            background: '#f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#999'
          }}>
            No Image
          </div>
        )
      }
    >
      <div>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600' }}>
          {product.name}
        </h3>
        <p style={{ margin: '8px 0', color: '#666', fontSize: '14px' }}>
          {product.description}
        </p>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#1890ff' }}>
              ${product.price}
            </span>
            {product.stock > 0 ? (
              <Tag color="green">In Stock</Tag>
            ) : (
              <Tag color="red">Out of Stock</Tag>
            )}
          </div>
          <Button
            type="primary"
            icon={<ShoppingCartOutlined />}
            block
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            Add to Cart
          </Button>
        </Space>
      </div>
    </Card>
  );
};

export default ProductCard;
