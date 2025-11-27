import { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Input,
  Select,
  Slider,
  Button,
  Pagination,
  Spin,
  Empty,
  Tag,
  Space,
  Divider,
  notification,
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  EyeOutlined,
  StarOutlined,
} from '@ant-design/icons';
import { searchProductsApi, getCategoriesApi } from '../util/api';

const { Search } = Input;
const { Option } = Select;

const ProductSearchPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });

  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    minPrice: 0,
    maxPrice: 100000000,
    hasDiscount: false,
    minViews: 0,
    minRating: 0,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch products when filters or pagination change
  useEffect(() => {
    fetchProducts();
  }, [filters, pagination.page]);

  const fetchCategories = async () => {
    try {
      const res = await getCategoriesApi();
      const data = res?.data ?? res;
      if (data && data.EC === 0) {
        setCategories(data.DT || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
      };

      const res = await searchProductsApi(params);
      const data = res?.data ?? res;

      if (data && data.EC === 0) {
        setProducts(data.DT.products || []);
        setPagination(prev => ({
          ...prev,
          total: data.DT.pagination.total,
          totalPages: data.DT.pagination.pages,
        }));
      } else {
        notification.error({
          message: 'Lỗi',
          description: data?.EM || 'Không thể tải sản phẩm',
        });
      }
    } catch (error) {
      notification.error({
        message: 'Lỗi',
        description: error?.message || 'Có lỗi xảy ra',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setFilters((prev) => ({ ...prev, search: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePriceRangeChange = (value) => {
    setFilters((prev) => ({
      ...prev,
      minPrice: value[0],
      maxPrice: value[1],
    }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      category: '',
      minPrice: 0,
      maxPrice: 100000000,
      hasDiscount: false,
      minViews: 0,
      minRating: 0,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

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
    <div style={{ padding: '20px' }}>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h1>
          <SearchOutlined /> Tìm kiếm Sản phẩm với Fuzzy Search
        </h1>
        <p style={{ color: '#888' }}>
          Tìm thấy {pagination.total} sản phẩm
        </p>
      </div>

      {/* Search Bar */}
      <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
        <Col xs={24} md={18}>
          <Search
            placeholder="Tìm kiếm sản phẩm theo tên, mô tả, tags..."
            size="large"
            enterButton={<SearchOutlined />}
            onSearch={handleSearch}
            allowClear
          />
        </Col>
        <Col xs={24} md={6}>
          <Button
            size="large"
            icon={<FilterOutlined />}
            onClick={handleResetFilters}
            block
          >
            Đặt lại bộ lọc
          </Button>
        </Col>
      </Row>

      {/* Filters */}
      <Card title={<><FilterOutlined /> Bộ lọc nâng cao</>} style={{ marginBottom: '20px' }}>
        <Row gutter={[16, 16]}>
          {/* Category */}
          <Col xs={24} sm={12} md={6}>
            <div style={{ marginBottom: '8px' }}>Danh mục</div>
            <Select
              style={{ width: '100%' }}
              placeholder="Chọn danh mục"
              value={filters.category || undefined}
              onChange={(value) => handleFilterChange('category', value)}
              allowClear
            >
              {categories.map((cat) => (
                <Option key={cat} value={cat}>
                  {cat}
                </Option>
              ))}
            </Select>
          </Col>

          {/* Sort By */}
          <Col xs={24} sm={12} md={6}>
            <div style={{ marginBottom: '8px' }}>Sắp xếp theo</div>
            <Select
              style={{ width: '100%' }}
              value={filters.sortBy}
              onChange={(value) => handleFilterChange('sortBy', value)}
            >
              <Option value="createdAt">Mới nhất</Option>
              <Option value="price">Giá</Option>
              <Option value="views">Lượt xem</Option>
              <Option value="rating">Đánh giá</Option>
              <Option value="discount">Giảm giá</Option>
            </Select>
          </Col>

          {/* Sort Order */}
          <Col xs={24} sm={12} md={6}>
            <div style={{ marginBottom: '8px' }}>Thứ tự</div>
            <Select
              style={{ width: '100%' }}
              value={filters.sortOrder}
              onChange={(value) => handleFilterChange('sortOrder', value)}
            >
              <Option value="desc">Giảm dần</Option>
              <Option value="asc">Tăng dần</Option>
            </Select>
          </Col>

          {/* Discount Filter */}
          <Col xs={24} sm={12} md={6}>
            <div style={{ marginBottom: '8px' }}>Khuyến mãi</div>
            <Select
              style={{ width: '100%' }}
              value={filters.hasDiscount}
              onChange={(value) => handleFilterChange('hasDiscount', value)}
            >
              <Option value={false}>Tất cả</Option>
              <Option value={true}>Chỉ sản phẩm giảm giá</Option>
            </Select>
          </Col>

          {/* Price Range */}
          <Col xs={24} md={12}>
            <div style={{ marginBottom: '8px' }}>
              Khoảng giá: {formatPrice(filters.minPrice)} - {formatPrice(filters.maxPrice)}
            </div>
            <Slider
              range
              min={0}
              max={50000000}
              step={100000}
              value={[filters.minPrice, filters.maxPrice]}
              onChange={handlePriceRangeChange}
              tooltip={{ formatter: formatPrice }}
            />
          </Col>

          {/* Min Rating */}
          <Col xs={24} sm={12} md={6}>
            <div style={{ marginBottom: '8px' }}>Đánh giá tối thiểu</div>
            <Select
              style={{ width: '100%' }}
              value={filters.minRating}
              onChange={(value) => handleFilterChange('minRating', value)}
            >
              <Option value={0}>Tất cả</Option>
              <Option value={3}>3★ trở lên</Option>
              <Option value={4}>4★ trở lên</Option>
              <Option value={4.5}>4.5★ trở lên</Option>
            </Select>
          </Col>

          {/* Min Views */}
          <Col xs={24} sm={12} md={6}>
            <div style={{ marginBottom: '8px' }}>Lượt xem tối thiểu</div>
            <Select
              style={{ width: '100%' }}
              value={filters.minViews}
              onChange={(value) => handleFilterChange('minViews', value)}
            >
              <Option value={0}>Tất cả</Option>
              <Option value={100}>100+ lượt xem</Option>
              <Option value={500}>500+ lượt xem</Option>
              <Option value={1000}>1000+ lượt xem</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Products Grid */}
      <Spin spinning={loading}>
        {products.length === 0 ? (
          <Empty description="Không tìm thấy sản phẩm" />
        ) : (
          <>
            <Row gutter={[16, 16]}>
              {products.map((product) => (
                <Col key={product._id} xs={24} sm={12} md={8} lg={6}>
                  <Card
                    hoverable
                    cover={
                      <img
                        alt={product.name}
                        src={product.image}
                        style={{ height: 200, objectFit: 'cover' }}
                      />
                    }
                    actions={[
                      <Space key="views">
                        <EyeOutlined />
                        {product.views}
                      </Space>,
                      <Space key="rating">
                        <StarOutlined />
                        {product.rating}
                      </Space>,
                    ]}
                  >
                    <Card.Meta
                      title={
                        <div style={{ 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis', 
                          whiteSpace: 'nowrap' 
                        }}>
                          {product.name}
                        </div>
                      }
                      description={
                        <div>
                          <Tag color="blue">{product.category}</Tag>
                          {product.discount > 0 && (
                            <Tag color="red">-{product.discount}%</Tag>
                          )}
                          <Divider style={{ margin: '8px 0' }} />
                          <div style={{ 
                            color: '#888', 
                            fontSize: '12px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {product.description}
                          </div>
                          <Divider style={{ margin: '8px 0' }} />
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                        </div>
                      }
                    />
                  </Card>
                </Col>
              ))}
            </Row>

            {/* Pagination */}
            <div style={{ marginTop: '30px', textAlign: 'center' }}>
              <Pagination
                current={pagination.page}
                total={pagination.total}
                pageSize={pagination.limit}
                onChange={handlePageChange}
                showSizeChanger={false}
                showTotal={(total) => `Tổng ${total} sản phẩm`}
              />
            </div>
          </>
        )}
      </Spin>
    </div>
  );
};

export default ProductSearchPage;
