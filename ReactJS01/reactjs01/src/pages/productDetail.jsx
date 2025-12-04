import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Row,
  Col,
  Card,
  Button,
  Rate,
  Divider,
  Tag,
  Spin,
  message,
  Input,
  List,
  Avatar,
  Space,
  Empty,
  Popconfirm,
} from 'antd';
import {
  HeartOutlined,
  HeartFilled,
  EyeOutlined,
  ShoppingCartOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import {
  getProductByIdApi,
  getSimilarProductsApi,
  addToFavoritesApi,
  removeFromFavoritesApi,
  checkIsFavoriteApi,
  addToViewHistoryApi,
  getProductReviewsApi,
  getProductReviewStatsApi,
  addReviewApi,
  updateReviewApi,
  deleteReviewApi,
  getProductViewCountApi,
} from '../util/api';
import { AuthContext } from '../components/context/auth.context';
import ProductCard from '../components/product/ProductCard';

const { TextArea } = Input;

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { auth } = useContext(AuthContext);

  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [viewCount, setViewCount] = useState(0);
  
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [editingReview, setEditingReview] = useState(null);

  // Fetch product data when id changes
  useEffect(() => {
    if (id) {
      fetchProductDetail();
      fetchSimilarProducts();
      fetchReviews();
      fetchReviewStats();
      fetchViewCount();
    }
  }, [id]);

  // Check favorite status when auth changes
  useEffect(() => {
    if (id && auth.isAuthenticated) {
      checkFavoriteStatus();
    }
  }, [id, auth.isAuthenticated]);

  // Add to view history only once when component mounts with authenticated user
  useEffect(() => {
    if (id && auth.isAuthenticated) {
      addToViewHistory();
    }
  }, [id]); // Only depend on id, not auth.isAuthenticated

  const fetchProductDetail = async () => {
    try {
      setLoading(true);
      const res = await getProductByIdApi(id);
      const data = res?.data ?? res;
      if (data?.EC === 0) {
        setProduct(data?.DT);
      }
    } catch (error) {
      message.error('Không thể tải thông tin sản phẩm');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSimilarProducts = async () => {
    try {
      const res = await getSimilarProductsApi(id, 6);
      const data = res?.data ?? res;
      if (data?.EC === 0) {
        setSimilarProducts(data?.DT ?? []);
      }
    } catch (error) {
      console.error('Error fetching similar products:', error);
    }
  };

  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      const res = await getProductReviewsApi(id, 1, 10);
      const data = res?.data ?? res;
      console.log('📖 Fetched reviews:', data);
      if (data?.EC === 0) {
        setReviews(data?.DT?.reviews ?? []);
        console.log('✅ Reviews set to state:', data?.DT?.reviews?.length);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setReviewsLoading(false);
    }
  };

  const fetchReviewStats = async () => {
    try {
      const res = await getProductReviewStatsApi(id);
      const data = res?.data ?? res;
      if (data?.EC === 0) {
        setReviewStats(data?.DT);
      }
    } catch (error) {
      console.error('Error fetching review stats:', error);
    }
  };

  const fetchViewCount = async () => {
    try {
      const res = await getProductViewCountApi(id);
      const data = res?.data ?? res;
      if (data?.EC === 0) {
        setViewCount(data?.DT?.viewCount || 0);
      }
    } catch (error) {
      console.error('Error fetching view count:', error);
    }
  };

  const checkFavoriteStatus = async () => {
    try {
      const res = await checkIsFavoriteApi(id);
      const data = res?.data ?? res;
      if (data?.EC === 0) {
        setIsFavorite(data?.DT?.isFavorite);
      }
    } catch (error) {
      console.error('Error checking favorite:', error);
    }
  };

  const addToViewHistory = async () => {
    try {
      await addToViewHistoryApi(id);
    } catch (error) {
      console.error('Error adding to view history:', error);
    }
  };

  const handleToggleFavorite = async () => {
    if (!auth.isAuthenticated) {
      message.warning('Vui lòng đăng nhập để sử dụng tính năng này');
      navigate('/login');
      return;
    }

    try {
      if (isFavorite) {
        const res = await removeFromFavoritesApi(id);
        const data = res?.data ?? res;
        if (data?.EC === 0) {
          setIsFavorite(false);
          message.success('Đã xóa khỏi yêu thích');
        }
      } else {
        const res = await addToFavoritesApi(id);
        const data = res?.data ?? res;
        if (data?.EC === 0) {
          setIsFavorite(true);
          message.success('Đã thêm vào yêu thích');
        }
      }
    } catch (error) {
      message.error('Có lỗi xảy ra');
      console.error(error);
    }
  };

  const handleSubmitReview = async () => {
    if (!auth.isAuthenticated) {
      message.warning('Vui lòng đăng nhập để đánh giá');
      navigate('/login');
      return;
    }

    if (!comment.trim()) {
      message.warning('Vui lòng nhập nội dung đánh giá');
      return;
    }

    try {
      setSubmittingReview(true);
      
      if (editingReview) {
        const res = await updateReviewApi(editingReview._id, rating, comment);
        const data = res?.data ?? res;
        if (data?.EC === 0) {
          message.success('Cập nhật đánh giá thành công');
          setEditingReview(null);
        }
      } else {
        const res = await addReviewApi(id, rating, comment);
        const data = res?.data ?? res;
        if (data?.EC === 0) {
          message.success('Đánh giá thành công');
        }
      }

      setRating(5);
      setComment('');
      fetchReviews();
      fetchReviewStats();
      fetchProductDetail(); // Refresh rating
    } catch (error) {
      message.error('Có lỗi xảy ra');
      console.error(error);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setRating(review.rating);
    setComment(review.comment);
    window.scrollTo({ top: document.getElementById('review-form').offsetTop - 100, behavior: 'smooth' });
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      const res = await deleteReviewApi(reviewId);
      const data = res?.data ?? res;
      if (data?.EC === 0) {
        message.success('Xóa đánh giá thành công');
        fetchReviews();
        fetchReviewStats();
        fetchProductDetail();
      }
    } catch (error) {
      message.error('Có lỗi xảy ra');
      console.error(error);
    }
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

  if (loading || !product) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Product Detail Section */}
      <Row gutter={[24, 24]}>
        <Col xs={24} md={10}>
          <Card
            cover={
              <img
                alt={product.name}
                src={product.image}
                style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
              />
            }
          />
        </Col>

        <Col xs={24} md={14}>
          <Card>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <Tag color="blue">{product.category}</Tag>
                {product.discount > 0 && (
                  <Tag color="red">-{product.discount}%</Tag>
                )}
              </div>

              <h1 style={{ margin: 0, fontSize: '28px' }}>{product.name}</h1>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Rate disabled value={product.rating} allowHalf />
                <span>({reviewStats?.totalReviews || 0} đánh giá)</span>
                <Divider type="vertical" />
                <span><EyeOutlined /> {viewCount} lượt xem</span>
              </div>

              <div>
                {product.discount > 0 ? (
                  <>
                    <div style={{ textDecoration: 'line-through', color: '#999', fontSize: '18px' }}>
                      {formatPrice(product.price)}
                    </div>
                    <div style={{ color: '#ff4d4f', fontWeight: 'bold', fontSize: '32px' }}>
                      {formatPrice(calculateFinalPrice(product))}
                    </div>
                  </>
                ) : (
                  <div style={{ color: '#000', fontWeight: 'bold', fontSize: '32px' }}>
                    {formatPrice(product.price)}
                  </div>
                )}
              </div>

              <Divider />

              <div>
                <h3>Mô tả sản phẩm</h3>
                <p style={{ fontSize: '16px', lineHeight: '1.6' }}>{product.description}</p>
              </div>

              <div>
                <strong>Tình trạng:</strong>{' '}
                {product.stock > 0 ? (
                  <Tag color="green">Còn hàng ({product.stock})</Tag>
                ) : (
                  <Tag color="red">Hết hàng</Tag>
                )}
              </div>

              <Space>
                <Button
                  type="primary"
                  size="large"
                  icon={<ShoppingCartOutlined />}
                  disabled={product.stock === 0}
                >
                  Thêm vào giỏ hàng
                </Button>
                <Button
                  size="large"
                  icon={isFavorite ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />}
                  onClick={handleToggleFavorite}
                >
                  {isFavorite ? 'Đã yêu thích' : 'Yêu thích'}
                </Button>
              </Space>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Reviews Section */}
      <Card title={<h2>Đánh giá sản phẩm</h2>} style={{ marginTop: '24px' }}>
        {reviewStats && (
          <div style={{ marginBottom: '24px', padding: '16px', background: '#f5f5f5', borderRadius: '8px' }}>
            <Row gutter={16}>
              <Col xs={24} sm={8}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#faad14' }}>
                    {reviewStats.avgRating}
                  </div>
                  <Rate disabled value={reviewStats.avgRating} allowHalf />
                  <div>{reviewStats.totalReviews} đánh giá</div>
                </div>
              </Col>
              <Col xs={24} sm={16}>
                {[5, 4, 3, 2, 1].map((star) => (
                  <div key={star} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ width: '60px' }}>{star} sao</span>
                    <div style={{ flex: 1, height: '8px', background: '#f0f0f0', borderRadius: '4px', margin: '0 8px' }}>
                      <div
                        style={{
                          height: '100%',
                          background: '#faad14',
                          borderRadius: '4px',
                          width: `${reviewStats.totalReviews > 0 ? (reviewStats.ratingDistribution[star] / reviewStats.totalReviews) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <span>{reviewStats.ratingDistribution[star] || 0}</span>
                  </div>
                ))}
              </Col>
            </Row>
          </div>
        )}

        <div id="review-form" style={{ marginBottom: '24px' }}>
          <h3>{editingReview ? 'Sửa đánh giá' : 'Viết đánh giá của bạn'}</h3>
          <div style={{ marginBottom: '16px' }}>
            <span style={{ marginRight: '8px' }}>Đánh giá:</span>
            <Rate value={rating} onChange={setRating} />
          </div>
          <TextArea
            rows={4}
            placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            style={{ marginBottom: '16px' }}
          />
          <Space>
            <Button
              type="primary"
              loading={submittingReview}
              onClick={handleSubmitReview}
            >
              {editingReview ? 'Cập nhật' : 'Gửi đánh giá'}
            </Button>
            {editingReview && (
              <Button
                onClick={() => {
                  setEditingReview(null);
                  setRating(5);
                  setComment('');
                }}
              >
                Hủy
              </Button>
            )}
          </Space>
        </div>

        <Divider />

        <Spin spinning={reviewsLoading}>
          <List
            dataSource={reviews}
            locale={{ emptyText: <Empty description="Chưa có đánh giá nào" /> }}
            renderItem={(review) => (
              <List.Item
                actions={
                  auth.user?.email === review.userId?.email
                    ? [
                        <Button
                          key="edit"
                          type="text"
                          icon={<EditOutlined />}
                          onClick={() => handleEditReview(review)}
                        >
                          Sửa
                        </Button>,
                        <Popconfirm
                          key="delete"
                          title="Xóa đánh giá này?"
                          onConfirm={() => handleDeleteReview(review._id)}
                          okText="Xóa"
                          cancelText="Hủy"
                        >
                          <Button type="text" danger icon={<DeleteOutlined />}>
                            Xóa
                          </Button>
                        </Popconfirm>,
                      ]
                    : []
                }
              >
                <List.Item.Meta
                  avatar={<Avatar>{review.userId?.name?.charAt(0)}</Avatar>}
                  title={
                    <div>
                      <span style={{ marginRight: '8px' }}>{review.userId?.name}</span>
                      <Rate disabled value={review.rating} style={{ fontSize: '14px' }} />
                    </div>
                  }
                  description={
                    <>
                      <div style={{ marginBottom: '8px', color: '#666' }}>
                        {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                      </div>
                      <div>{review.comment}</div>
                    </>
                  }
                />
              </List.Item>
            )}
          />
        </Spin>
      </Card>

      {/* Similar Products Section */}
      {similarProducts.length > 0 && (
        <div style={{ marginTop: '48px' }}>
          <h2 style={{ marginBottom: '24px' }}>Sản phẩm tương tự</h2>
          <Row gutter={[16, 16]}>
            {similarProducts.map((product) => (
              <Col xs={24} sm={12} md={8} lg={4} key={product._id}>
                <div onClick={() => navigate(`/product/${product._id}`)}>
                  <ProductCard product={product} />
                </div>
              </Col>
            ))}
          </Row>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
