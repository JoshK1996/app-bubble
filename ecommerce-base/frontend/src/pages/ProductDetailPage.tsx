/**
 * Product Detail Page Component
 * Displays detailed information about a single product
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCart } from '@hooks/useCart';
import { productService, Product } from '@services/productService';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const data = await productService.getProduct(id);
        setProduct(data);
        setError(null);
      } catch (err) {
        setError('Failed to load product details. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Sample product data for demo purposes when no API is available
  const sampleProduct: Product = {
    id: id || '1',
    name: 'Sample Product',
    description: 'This is a detailed description of the sample product. It includes information about its features, specifications, and usage instructions.',
    price: 99.99,
    imageUrl: '',
    category: 'Electronics',
    stock: 10,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const displayProduct = product || sampleProduct;

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (isNaN(value) || value < 1) {
      setQuantity(1);
    } else if (displayProduct && value > displayProduct.stock) {
      setQuantity(displayProduct.stock);
    } else {
      setQuantity(value);
    }
  };

  const handleAddToCart = () => {
    if (id) {
      addToCart(id, quantity);
      navigate('/cart');
    }
  };

  if (loading) {
    return <div className="loading">Loading product details...</div>;
  }

  if (error) {
    return <div className="error alert alert-danger">{error}</div>;
  }

  return (
    <div className="product-detail-page">
      <div className="breadcrumb">
        <Link to="/products">Products</Link> &gt; {displayProduct.name}
      </div>
      
      <div className="product-detail-container">
        <div className="product-image-container">
          {displayProduct.imageUrl ? (
            <img src={displayProduct.imageUrl} alt={displayProduct.name} className="product-image" />
          ) : (
            <div className="product-image-placeholder"></div>
          )}
        </div>
        
        <div className="product-info">
          <h1 className="product-name">{displayProduct.name}</h1>
          <p className="product-category">Category: {displayProduct.category}</p>
          <p className="product-price">${displayProduct.price.toFixed(2)}</p>
          
          <div className="stock-info">
            <span className={`stock-status ${displayProduct.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
              {displayProduct.stock > 0 ? `In Stock (${displayProduct.stock} available)` : 'Out of Stock'}
            </span>
          </div>
          
          <div className="product-description">
            <h3>Description</h3>
            <p>{displayProduct.description}</p>
          </div>
          
          <div className="purchase-options">
            <div className="quantity-selector">
              <label htmlFor="quantity">Quantity:</label>
              <input
                type="number"
                id="quantity"
                min="1"
                max={displayProduct.stock}
                value={quantity}
                onChange={handleQuantityChange}
                disabled={displayProduct.stock <= 0}
              />
            </div>
            
            <button
              className="btn btn-primary add-to-cart-btn"
              onClick={handleAddToCart}
              disabled={displayProduct.stock <= 0}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage; 