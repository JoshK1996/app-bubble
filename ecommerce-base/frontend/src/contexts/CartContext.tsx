/**
 * Cart Context Provider
 * Manages the shopping cart state and functionality
 */
import React, { createContext, useState, useEffect } from 'react';
import { cartService } from '@services/cartService';
import { useAuth } from '@hooks/useAuth';

// Types
export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  imageUrl?: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  isLoading: boolean;
  error: string | null;
  totalItems: number;
  totalPrice: number;
  addToCart: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

// Create context
export const CartContext = createContext<CartContextType | undefined>(undefined);

// Provider component
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();

  // Calculate derived values
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = items.reduce((total, item) => total + (item.price * item.quantity), 0);

  // Fetch cart on auth changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      // Load from local storage for anonymous users
      loadLocalCart();
    }
  }, [isAuthenticated, user?.id]);

  // Fetch cart from the server
  const fetchCart = async () => {
    setIsLoading(true);
    try {
      const cartData = await cartService.getCart();
      setItems(cartData.items);
      setError(null);
    } catch (err) {
      setError('Failed to load your cart. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Local storage cart for anonymous users
  const loadLocalCart = () => {
    try {
      const localCart = localStorage.getItem('cart');
      if (localCart) {
        setItems(JSON.parse(localCart));
      }
    } catch (err) {
      console.error('Failed to load cart from local storage:', err);
    }
  };

  const saveLocalCart = (cartItems: CartItem[]) => {
    try {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    } catch (err) {
      console.error('Failed to save cart to local storage:', err);
    }
  };

  // Add item to cart
  const addToCart = async (productId: string, quantity: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (isAuthenticated) {
        // Add to server cart
        await cartService.addToCart(productId, quantity);
        fetchCart();
      } else {
        // Add to local cart
        const response = await cartService.getProductDetails(productId);
        const product = response.data;
        
        setItems(prevItems => {
          const existingItem = prevItems.find(item => item.productId === productId);
          
          let newItems;
          if (existingItem) {
            newItems = prevItems.map(item => 
              item.productId === productId 
                ? { ...item, quantity: item.quantity + quantity }
                : item
            );
          } else {
            const newItem: CartItem = {
              id: `local-${Date.now()}`,
              productId,
              name: product.name,
              price: product.price,
              imageUrl: product.imageUrl,
              quantity
            };
            newItems = [...prevItems, newItem];
          }
          
          saveLocalCart(newItems);
          return newItems;
        });
      }
    } catch (err) {
      setError('Failed to add item to cart. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Remove item from cart
  const removeFromCart = async (itemId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (isAuthenticated) {
        await cartService.removeFromCart(itemId);
        fetchCart();
      } else {
        setItems(prevItems => {
          const newItems = prevItems.filter(item => item.id !== itemId);
          saveLocalCart(newItems);
          return newItems;
        });
      }
    } catch (err) {
      setError('Failed to remove item from cart. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Update item quantity
  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) {
      return removeFromCart(itemId);
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      if (isAuthenticated) {
        await cartService.updateCartItemQuantity(itemId, quantity);
        fetchCart();
      } else {
        setItems(prevItems => {
          const newItems = prevItems.map(item => 
            item.id === itemId ? { ...item, quantity } : item
          );
          saveLocalCart(newItems);
          return newItems;
        });
      }
    } catch (err) {
      setError('Failed to update cart. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear the entire cart
  const clearCart = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (isAuthenticated) {
        await cartService.clearCart();
        fetchCart();
      } else {
        setItems([]);
        saveLocalCart([]);
      }
    } catch (err) {
      setError('Failed to clear cart. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        isLoading,
        error,
        totalItems,
        totalPrice,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}; 