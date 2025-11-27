import { Card, Tag, Divider } from 'antd';
import { EyeOutlined, StarOutlined } from '@ant-design/icons';

const ProductCard = ({ product }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const calculateFinalPrice = (product) => {
    if (product.discount > 0) {
      return Math.round(product.price - (product.price * product.discount / 100));
    }
    return product.price;
  };

  return (
    <Card
      hoverable
      style={{ height: '100%' }}
      cover={
        <div style={{ position: 'relative' }}>
          <img
            alt={product.name}
            src={product.image || 'https://via.placeholder.com/300'}
            style={{ 
              width: '100%', 
              height: '200px', 
              objectFit: 'cover' 
            }}
          />
          {product.discount > 0 && (
            <Tag 
              color="red" 
              style={{ 
                position: 'absolute', 
                top: '10px', 
                right: '10px',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              -{product.discount}%
            </Tag>
          )}
        </div>
      }
    >
      <div style={{ minHeight: '180px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: '8px' }}>
          <Tag color="blue">{product.category}</Tag>
        </div>
        
        <h3 style={{ 
          margin: '0 0 8px 0', 
          fontSize: '16px', 
          fontWeight: '600',
          minHeight: '44px',
          lineHeight: '22px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical'
        }}>
          {product.name}
        </h3>
        
        <div style={{ 
          color: '#666', 
          fontSize: '12px',
          marginBottom: '8px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {product.description}
        </div>
        
        <Divider style={{ margin: '8px 0' }} />
        
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            {product.discount > 0 ? (
              <div>
                <div style={{ textDecoration: 'line-through', color: '#999', fontSize: '12px' }}>
                  {formatPrice(product.price)}
                </div>
                <div style={{ color: '#ff4d4f', fontWeight: 'bold', fontSize: '16px' }}>
                  {formatPrice(calculateFinalPrice(product))}
                </div>
              </div>
            ) : (
              <div style={{ color: '#000', fontWeight: 'bold', fontSize: '16px' }}>
                {formatPrice(product.price)}
              </div>
            )}
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#888' }}>
            <span>
              <EyeOutlined /> {product.views || 0}
            </span>
            <span>
              <StarOutlined style={{ color: '#faad14' }} /> {product.rating || 0}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;
