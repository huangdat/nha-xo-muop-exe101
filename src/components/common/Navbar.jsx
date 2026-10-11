import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import BrandMark from './BrandMark';
import { siteData } from '../../data/siteData';
import './Navbar.css';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  const { brand, navigation } = siteData;

  // Listen to scroll to update navbar background style and active section
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      // Determine active section
      const sections = navigation.map((item) => item.id);
      const scrollPosition = window.scrollY + 120;

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [navigation]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Đóng menu bằng phím Escape
  useEffect(() => {
    if (!isMobileMenuOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setIsMobileMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isMobileMenuOpen]);

  // Handle smooth scroll navigation
  const handleNavClick = (e, href) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);

    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);

    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <header className={`navbar ${isScrolled ? 'scrolled' : ''} ${isMobileMenuOpen ? 'menu-open' : ''}`}>
        <div className="container navbar-inner">
          {/* Logo / Brand Name */}
          <a
            href="#hero"
            className="navbar-brand"
            onClick={(e) => handleNavClick(e, '#hero')}
            aria-label={`${brand.name} - Trang chủ`}
          >
            <div className="brand-icon-box">
              <BrandMark size={22} />
            </div>
            <div className="brand-text-group">
              <span className="brand-name">{brand.name}</span>
              <span className="brand-subtitle">{brand.logoSub}</span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav aria-label="Menu chính">
            <ul className="navbar-nav">
              {navigation.map((item) => (
                <li key={item.id}>
                  <a
                    href={item.href}
                    className={`nav-link ${activeSection === item.id ? 'active' : ''}`}
                    onClick={(e) => handleNavClick(e, item.href)}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Desktop Right CTA */}
          <div className="navbar-cta-group">
            <a
              href="#contact"
              className="btn btn-primary navbar-cta"
              onClick={(e) => handleNavClick(e, '#contact')}
            >
              <span>Tư vấn ngay</span>
            </a>

            {/* Mobile Hamburger Toggle */}
            <button
              className="navbar-toggle"
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? 'Đóng menu' : 'Mở menu điều hướng'}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu: phủ toàn màn hình */}
      <div
        id="mobile-menu"
        className={`mobile-menu-wrapper ${isMobileMenuOpen ? 'open' : ''}`}
        inert={!isMobileMenuOpen}
      >
        <ul className="mobile-nav-list">
          {navigation.map((item, idx) => (
            <li key={item.id} style={{ '--i': idx }}>
              <a
                href={item.href}
                className={`mobile-nav-link ${activeSection === item.id ? 'active' : ''}`}
                onClick={(e) => handleNavClick(e, item.href)}
              >
                <span className="mobile-nav-index">0{idx + 1}</span>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
        <a
          href="#contact"
          className="btn btn-primary mobile-menu-cta"
          onClick={(e) => handleNavClick(e, '#contact')}
        >
          <span>Liên hệ tư vấn</span>
        </a>
      </div>
    </>
  );
}
