/**
 * Main Layout Component
 * Provides consistent structure across all pages
 */
import React from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="app-layout">
      <Header />
      <main className="container">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout; 