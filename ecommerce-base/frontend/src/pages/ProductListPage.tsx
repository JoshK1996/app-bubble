/**
 * Product List Page Component
 * Displays a filterable list of products
 */
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '@components/features/products/ProductCard';
import CategoryFilter from '@components/features/products/CategoryFilter';
import { productService } from '@services/productService';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
}

const ProductListPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  
  const categoryFilter = searchParams.get('category');

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const data = await productService.getProducts({ 
          category: categoryFilter || undefined 
        });
        setProducts(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch products. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryFilter]);

  // For demo purposes, create placeholder products if none are returned
  const displayProducts = products.length > 0 ? products : [
    { id: '1', name: 'Sample Product 1', description: 'This is a sample product', price: 99.99, imageUrl: '', category: 'Electronics' },
    { id: '2', name: 'Sample Product 2', description: 'This is a sample product', price: 149.99, imageUrl: '', category: 'Electronics' },
    { id: '3', name: 'Sample Product 3', description: 'This is a sample product', price: 199.99, imageUrl: '', category: 'Clothing' },
    { id: '4', name: 'Sample Product 4', description: 'This is a sample product', price: 29.99, imageUrl: '', category: 'Clothing' },
    { id: '5', name: 'Sample Product 5', description: 'This is a sample product', price: 49.99, imageUrl: '', category: 'Home & Kitchen' },
    { id: '6', name: 'Sample Product 6', description: 'This is a sample product', price: 79.99, imageUrl: '', category: 'Home & Kitchen' },
  ];

  return (
    <div className="product-list-page">
      <h1>Products</h1>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <div className="product-filters">
        <CategoryFilter />
      </div>
      
      {loading ? (
        <div className="loading-spinner">Loading products...</div>
      ) : (
        <div className="product-grid">
          {displayProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductListPage; 