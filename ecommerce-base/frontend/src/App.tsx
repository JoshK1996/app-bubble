/**
 * Main App Component
 */
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from '@pages/HomePage';
import ProductListPage from '@pages/ProductListPage';
import ProductDetailPage from '@pages/ProductDetailPage';
import CartPage from '@pages/CartPage';
import CheckoutPage from '@pages/CheckoutPage';
import OrdersPage from '@pages/OrdersPage';
import OrderDetailPage from '@pages/OrderDetailPage';
import LoginPage from '@pages/LoginPage';
import RegisterPage from '@pages/RegisterPage';
import ProfilePage from '@pages/ProfilePage';
import Layout from '@components/common/Layout';
import { AuthProvider } from '@contexts/AuthContext';
import { CartProvider } from '@contexts/CartContext';
import ProtectedRoute from '@components/common/ProtectedRoute';
import { ROUTES } from '@constants/index';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Layout>
            <Routes>
              {/* Public routes */}
              <Route path={ROUTES.HOME} element={<HomePage />} />
              <Route path={ROUTES.PRODUCTS} element={<ProductListPage />} />
              <Route path={ROUTES.PRODUCT_DETAIL(':id')} element={<ProductDetailPage />} />
              <Route path={ROUTES.CART} element={<CartPage />} />
              <Route path={ROUTES.LOGIN} element={<LoginPage />} />
              <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
              
              {/* Protected routes */}
              <Route
                path={ROUTES.CHECKOUT}
                element={
                  <ProtectedRoute>
                    <CheckoutPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.ORDERS}
                element={
                  <ProtectedRoute>
                    <OrdersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.ORDER_DETAIL(':id')}
                element={
                  <ProtectedRoute>
                    <OrderDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.PROFILE}
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Layout>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App; 