import React from 'react';
import {
  Sparkles,
  Leaf,
  Droplets,
  HeartHandshake,
  Globe,
  PackageCheck,
} from 'lucide-react';
import './FeatureCard.css';

// Map icon strings to imported components
const iconMap = {
  Sparkles,
  Leaf,
  Droplets,
  HeartHandshake,
  Globe,
  PackageCheck,
};

/**
 * Reusable FeatureCard component
 * Một mục trong danh sách đặc điểm: số thứ tự, biểu tượng nét mảnh, tiêu đề và mô tả
 */
export default function FeatureCard({ iconName, title, description, index = 0 }) {
  const IconComponent = iconMap[iconName] || Leaf;

  return (
    <li className="feature-card" data-reveal style={{ '--i': index % 3 }}>
      <div className="feature-card-head">
        <span className="feature-card-num">{String(index + 1).padStart(2, '0')}</span>
        <IconComponent size={22} strokeWidth={1.25} aria-hidden="true" />
      </div>
      <h3 className="feature-card-title">{title}</h3>
      <p className="feature-card-desc">{description}</p>
    </li>
  );
}
