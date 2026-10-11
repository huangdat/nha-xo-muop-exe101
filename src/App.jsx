import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

// Common Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';

// Section Components
import Hero from './components/sections/Hero';
import About from './components/sections/About';
import ProductShowcase from './components/sections/ProductShowcase';
import Features from './components/sections/Features';
import Ingredients from './components/sections/Ingredients';
import Process from './components/sections/Process';
import Usage from './components/sections/Usage';
import Gallery from './components/sections/Gallery';
import BrandStory from './components/sections/BrandStory';
import Contact from './components/sections/Contact';

// Global Styles
import './styles/global.css';
import { useReveal } from './hooks/useMotion';

export default function App() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useReveal();

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 800);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app-root">
      <a href="#main" className="skip-link">Bỏ qua điều hướng</a>

      {/* 1. Header & Navigation */}
      <Navbar />

      {/* Main Content Sections */}
      <main id="main">
        {/* 2. Hero Section */}
        <Hero />

        {/* 3. Giới thiệu sản phẩm */}
        <About />

        {/* 4. Chi tiết & Trưng bày sản phẩm */}
        <ProductShowcase />

        {/* 5. Đặc điểm nổi bật */}
        <Features />

        {/* 6. Thành phần & Nguyên liệu */}
        <Ingredients />

        {/* 7. Quy trình sản xuất thủ công */}
        <Process />

        {/* 8. Hướng dẫn sử dụng & bảo quản */}
        <Usage />

        {/* 9. Thư viện hình ảnh */}
        <Gallery />

        {/* 10. Câu chuyện thương hiệu */}
        <BrandStory />

        {/* 11. Liên hệ & Đặt hàng */}
        <Contact />
      </main>

      {/* 12. Chân trang */}
      <Footer />

      {/* Floating Scroll-to-Top Button */}
      <button
        type="button"
        className={`scroll-top-btn ${showScrollTop ? 'is-visible' : ''}`}
        onClick={scrollToTop}
        aria-label="Cuộn lên đầu trang"
        tabIndex={showScrollTop ? 0 : -1}
      >
        <ArrowUp size={20} />
      </button>
    </div>
  );
}
