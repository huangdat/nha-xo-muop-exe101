import React, { useState } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
} from 'lucide-react';
import { siteData } from '../../data/siteData';
import './Contact.css';

export default function Contact() {
  const { contact } = siteData;
  const [formState, setFormState] = useState({ name: '', contactInfo: '', note: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formState.name.trim() || !formState.contactInfo.trim()) return;

    // Frontend-only state confirmation (no backend needed)
    setIsSubmitted(true);
    setFormState({ name: '', contactInfo: '', note: '' });

    setTimeout(() => {
      setIsSubmitted(false);
    }, 6000);
  };

  return (
    <section id="contact" className="section contact-section">
      <div className="container">
        <div className="contact-card-box" data-reveal>
          {/* Left Column: Direct Info & Social channels */}
          <div className="contact-info-panel">
            <div>
              <p className="eyebrow contact-panel-badge">
                <span className="eyebrow-index">09</span>
                <span className="eyebrow-rule" />
                {contact.badge}
              </p>
              <h2 className="contact-panel-title">{contact.title}</h2>
              <p className="contact-panel-sub">{contact.subtitle}</p>

              <div className="contact-details-list">
                {/* Phone */}
                <div className="contact-item">
                  <div className="contact-item-icon">
                    <Phone size={18} />
                  </div>
                  <div>
                    <div className="contact-item-label">Số điện thoại / Zalo</div>
                    <div className="contact-item-val">
                      <a href={`tel:${contact.info.phoneRaw}`}>
                        {contact.info.phone}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="contact-item">
                  <div className="contact-item-icon">
                    <Mail size={18} />
                  </div>
                  <div>
                    <div className="contact-item-label">Email hỗ trợ</div>
                    <div className="contact-item-val">
                      <a href={`mailto:${contact.info.email}`}>
                        {contact.info.email}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="contact-item">
                  <div className="contact-item-icon">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <div className="contact-item-label">Địa chỉ trải nghiệm</div>
                    <div className="contact-item-val">{contact.info.address}</div>
                  </div>
                </div>

                {/* Working hours */}
                <div className="contact-item">
                  <div className="contact-item-icon">
                    <Clock size={18} />
                  </div>
                  <div>
                    <div className="contact-item-label">Thời gian làm việc</div>
                    <div className="contact-item-val">
                      {contact.info.workingHours}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Social channels */}
            <div className="contact-social-group">
              <div className="contact-social-title">Kênh mạng xã hội:</div>
              <div className="contact-social-links">
                {contact.socialLinks.facebook && (
                  <a
                    href={contact.socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-circle-btn"
                    aria-label="Facebook"
                  >
                    <span>FB</span>
                  </a>
                )}
                {contact.socialLinks.instagram && (
                  <a
                    href={contact.socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-circle-btn"
                    aria-label="Instagram"
                  >
                    <span>IG</span>
                  </a>
                )}
                {contact.socialLinks.tiktok && (
                  <a
                    href={contact.socialLinks.tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-circle-btn"
                    aria-label="TikTok"
                  >
                    <span>TT</span>
                  </a>
                )}
                {contact.socialLinks.zalo && (
                  <a
                    href={contact.socialLinks.zalo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-circle-btn"
                    aria-label="Zalo"
                  >
                    <span>ZL</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Fast inquiry form */}
          <div className="contact-form-panel">
            <h3 className="form-panel-title">Gửi thông tin tư vấn</h3>
            <p className="form-panel-sub">
              Để lại thông tin, chúng tôi sẽ liên hệ lại với bạn trong thời gian sớm nhất.
            </p>

            {isSubmitted && (
              <div className="form-success-banner" role="status">
                <CheckCircle2 size={20} />
                <span>
                  Cảm ơn bạn! Thông tin đã được ghi nhận thành công. Chúng tôi sẽ phản hồi sớm nhất.
                </span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <label htmlFor="contact-name" className="form-label">
                  Họ và tên *
                </label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn A"
                  className="form-input"
                  value={formState.name}
                  onChange={(e) =>
                    setFormState({ ...formState, name: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label htmlFor="contact-info" className="form-label">
                  Số điện thoại hoặc Email *
                </label>
                <input
                  id="contact-info"
                  type="text"
                  required
                  placeholder="Ví dụ: 0901234567 hoặc email@domain.com"
                  className="form-input"
                  value={formState.contactInfo}
                  onChange={(e) =>
                    setFormState({ ...formState, contactInfo: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label htmlFor="contact-note" className="form-label">
                  Nội dung cần tư vấn / Đặt hàng
                </label>
                <textarea
                  id="contact-note"
                  rows={3}
                  placeholder="Ví dụ: Tôi muốn hỏi về số lượng bánh xà phòng và thời gian giao hàng..."
                  className="form-textarea"
                  value={formState.note}
                  onChange={(e) =>
                    setFormState({ ...formState, note: e.target.value })
                  }
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
                <Send size={16} />
                <span>Gửi yêu cầu tư vấn</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
