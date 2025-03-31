/**
 * Category Filter Component
 * Allows filtering products by category
 */
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productService } from '@services/productService';

const CategoryFilter: React.FC = () => {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Current selected category from URL
  const selectedCategory = searchParams.get('category') || '';

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const data = await productService.getCategories();
        setCategories(data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Placeholder categories if API doesn't return any
  const displayCategories = categories.length > 0 
    ? categories 
    : ['Electronics', 'Clothing', 'Home & Kitchen', 'Books', 'Toys', 'Sports'];

  // Handler for category selection
  const handleCategoryChange = (category: string) => {
    const newParams = new URLSearchParams(searchParams);
    
    if (category === '') {
      newParams.delete('category');
    } else {
      newParams.set('category', category);
    }
    
    // Update URL with the new params
    setSearchParams(newParams);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="category-filter">
      <h3>Categories</h3>
      
      {loading ? (
        <div className="loading">Loading categories...</div>
      ) : (
        <div className="categories-list">
          <div 
            className={`category-item ${selectedCategory === '' ? 'active' : ''}`}
            onClick={() => handleCategoryChange('')}
          >
            All Categories
          </div>
          
          {displayCategories.map(category => (
            <div
              key={category}
              className={`category-item ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => handleCategoryChange(category)}
            >
              {category}
            </div>
          ))}
        </div>
      )}
      
      {selectedCategory && (
        <button className="btn btn-secondary clear-filters" onClick={clearFilters}>
          Clear Filters
        </button>
      )}
    </div>
  );
};

export default CategoryFilter; 