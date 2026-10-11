import React from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';
import BrandMark from './BrandMark';
import { siteData } from '../../data/siteData';
import './Footer.css';

export default function Footer() {
  const { brand, contact, footer } = siteData;

  const handleNavClick = (e, href) => {
    e.preventDefault();
    const id = href.replace('#', '');
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top-grid">
          {/* Brand Col */}
          <div className="footer-brand">
            <div className="footer-brand-header">
              <div className="brand-icon-box">
                <BrandMark size={22} />
              </div>
              <span className="footer-brand-title">{brand.name}</span>
            </div>
            <p className="footer-brand-desc">{footer.description}</p>
          </div>

          {/* Nav links 1 */}
          <div>
            <h3 className="footer-col-title">Về sản phẩm</h3>
            <ul className="footer-nav-list">
              <li>
                <a
                  href="#about"
                  className="footer-nav-link"
                  onClick={(e) => handleNavClick(e, '#about')}
                >
                  Giới thiệu
                </a>
              </li>
              <li>
                <a
                  href="#product"
                  className="footer-nav-link"
                  onClick={(e) => handleNavClick(e, '#product')}
                >
                  Bánh xà phòng
                </a>
              </li>
              <li>
                <a
                  href="#features"
                  className="footer-nav-link"
                  onClick={(e) => handleNavClick(e, '#features')}
                >
                  Đặc điểm nổi bật
                </a>
              </li>
              <li>
                <a
                  href="#ingredients"
                  className="footer-nav-link"
                  onClick={(e) => handleNavClick(e, '#ingredients')}
                >
                  Thành phần tự nhiên
                </a>
              </li>
            </ul>
          </div>

          {/* Nav links 2 */}
          <div>
            <h3 className="footer-col-title">Khám phá</h3>
            <ul className="footer-nav-list">
              <li>
                <a
                  href="#process"
                  className="footer-nav-link"
                  onClick={(e) => handleNavClick(e, '#process')}
                >
                  Quy trình thủ công
                </a>
              </li>
              <li>
                <a
                  href="#usage"
                  className="footer-nav-link"
                  onClick={(e) => handleNavClick(e, '#usage')}
                >
                  Hướng dẫn sử dụng
                </a>
              </li>
              <li>
                <a
                  href="#gallery"
                  className="footer-nav-link"
                  onClick={(e) => handleNavClick(e, '#gallery')}
                >
                  Thư viện ảnh
                </a>
              </li>
              <li>
                <a
                  href="#brand-story"
                  className="footer-nav-link"
                  onClick={(e) => handleNavClick(e, '#brand-story')}
                >
                  Câu chuyện xanh
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Col */}
          <div>
            <h3 className="footer-col-title">Thông tin liên hệ</h3>
            <ul className="footer-contact-list">
              <li className="footer-contact-item">
                <Phone size={16} />
                <span>{contact.info.phone}</span>
              </li>
              <li className="footer-contact-item">
                <Mail size={16} />
                <span>{contact.info.email}</span>
              </li>
              <li className="footer-contact-item">
                <MapPin size={16} />
                <span>{contact.info.address}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer bottom */}
        <div className="footer-bottom">
          <div>{footer.copyright}</div>
          <div className="footer-disclaimer">{footer.disclaimer}</div>
        </div>
      </div>
    </footer>
  );
}
