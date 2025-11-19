import { useEffect, useState, useRef, useCallback } from 'react';
import { Layout, message } from 'antd';
import CategoryFilter from '../components/product/CategoryFilter';
import ProductGrid from '../components/product/ProductGrid';
import { getCategoriesApi, getProductsApi } from '../util/api';

const ProductsPage = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef(null);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const res = await getCategoriesApi();
        if (res.data?.EC === 0) {
          setCategories(res.data?.DT ?? []);
        }
      } catch (error) {
        message.error('Failed to load categories');
        console.log('Error fetching categories:', error);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch products
  const fetchProducts = useCallback(async (page = 1, category = 'all', replace = false) => {
    try {
      setLoading(true);
      const res = await getProductsApi(page, 10, category);
      if (res.data?.EC === 0) {
        const newProducts = res.data?.DT?.products ?? [];
        const pagination = res.data?.DT?.pagination ?? {};

        if (replace) {
          setProducts(newProducts);
        } else {
          setProducts(prev => [...prev, ...newProducts]);
        }

        // Check if there are more products
        setHasMore(page < pagination.pages);
        setCurrentPage(page);
      }
    } catch (error) {
      message.error('Failed to load products');
      console.log('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load initial products
  useEffect(() => {
    setCurrentPage(1);
    setProducts([]);
    fetchProducts(1, selectedCategory, true);
  }, [selectedCategory, fetchProducts]);

  // Handle category change
  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  // Handle load more
  const handleLoadMore = () => {
    fetchProducts(currentPage + 1, selectedCategory, false);
  };

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          handleLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, loading, handleLoadMore]);

  return (
    <Layout style={{ minHeight: '100vh', padding: '24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <h1 style={{ marginBottom: '32px' }}>Our Products</h1>
        
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategoryChange}
          loading={categoriesLoading}
        />

        <ProductGrid
          products={products}
          loading={loading}
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
        />

        <div ref={observerTarget} style={{ height: '20px', marginTop: '32px' }} />
      </div>
    </Layout>
  );
};

export default ProductsPage;
