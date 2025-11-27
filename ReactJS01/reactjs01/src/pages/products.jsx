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
  const loadingRef = useRef(false);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const res = await getCategoriesApi();
        const data = res?.data ?? res;
        if (data?.EC === 0) {
          setCategories(data?.DT ?? []);
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
    if (loadingRef.current) return;
    
    try {
      loadingRef.current = true;
      setLoading(true);
      const res = await getProductsApi(page, 10, category);
      const data = res?.data ?? res;
      if (data?.EC === 0) {
        const newProducts = data?.DT?.products ?? [];
        const pagination = data?.DT?.pagination ?? {};

        if (replace) {
          setProducts(newProducts);
        } else {
          setProducts(prev => [...prev, ...newProducts]);
        }

        // Check if there are more products
        setHasMore(page < pagination.totalPages);
        setCurrentPage(page);
      }
    } catch (error) {
      message.error('Failed to load products');
      console.log('Error fetching products:', error);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, []);

  // Load initial products
  useEffect(() => {
    setCurrentPage(1);
    setProducts([]);
    setHasMore(true);
    fetchProducts(1, selectedCategory, true);
  }, [selectedCategory, fetchProducts]);

  // Handle category change
  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  // Infinite scroll observer
  useEffect(() => {
    const currentTarget = observerTarget.current;
    
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loadingRef.current) {
          fetchProducts(currentPage + 1, selectedCategory, false);
        }
      },
      { threshold: 0.1 }
    );

    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, currentPage, selectedCategory, fetchProducts]);

  // Handle load more (for manual button)
  const handleLoadMore = () => {
    if (hasMore && !loadingRef.current) {
      fetchProducts(currentPage + 1, selectedCategory, false);
    }
  };

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
