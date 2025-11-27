import { Button, Space, Spin } from 'antd';

const CategoryFilter = ({ categories, selectedCategory, onSelectCategory, loading }) => {
  return (
    <div style={{ marginBottom: '24px' }}>
      <h3 style={{ marginBottom: '16px' }}>Categories</h3>
      <Spin spinning={loading}>
        <Space wrap>
          <Button
            type={selectedCategory === 'all' ? 'primary' : 'default'}
            onClick={() => onSelectCategory('all')}
          >
            All Products
          </Button>
          {categories.map(category => (
            <Button
              key={category}
              type={selectedCategory === category ? 'primary' : 'default'}
              onClick={() => onSelectCategory(category)}
            >
              {category}
            </Button>
          ))}
        </Space>
      </Spin>
    </div>
  );
};

export default CategoryFilter;
