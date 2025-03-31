/**
 * Home Page Component
 * Landing page for the E-commerce application
 */
import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to E-Commerce Platform</h1>
          <p>Discover amazing products at great prices</p>
          <Link to="/products" className="btn btn-primary">
            Shop Now
          </Link>
        </div>
      </section>

      <section className="featured-categories">
        <h2>Shop by Category</h2>
        <div className="category-grid">
          {/* Placeholder for category cards */}
          <div className="category-card">
            <div className="category-image placeholder"></div>
            <h3>Electronics</h3>
          </div>
          <div className="category-card">
            <div className="category-image placeholder"></div>
            <h3>Clothing</h3>
          </div>
          <div className="category-card">
            <div className="category-image placeholder"></div>
            <h3>Home & Kitchen</h3>
          </div>
        </div>
      </section>

      <section className="featured-products">
        <h2>Featured Products</h2>
        <div className="product-grid">
          {/* Placeholder for product cards */}
          <div className="product-card">
            <div className="product-image placeholder"></div>
            <h3>Product Name</h3>
            <p className="product-price">$99.99</p>
            <button className="btn btn-primary">Add to Cart</button>
          </div>
          <div className="product-card">
            <div className="product-image placeholder"></div>
            <h3>Product Name</h3>
            <p className="product-price">$149.99</p>
            <button className="btn btn-primary">Add to Cart</button>
          </div>
          <div className="product-card">
            <div className="product-image placeholder"></div>
            <h3>Product Name</h3>
            <p className="product-price">$199.99</p>
            <button className="btn btn-primary">Add to Cart</button>
          </div>
        </div>
        <div className="view-all">
          <Link to="/products" className="btn">View All Products</Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 