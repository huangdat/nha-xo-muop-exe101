import React from 'react';
import { Lightbulb } from 'lucide-react';
import { siteData } from '../../data/siteData';
import SectionTitle from '../common/SectionTitle';
import './Usage.css';

export default function Usage() {
  const { usage } = siteData;

  return (
    <section id="usage" className="section usage-section">
      <div className="container">
        <SectionTitle
          index="06"
          badge={usage.badge}
          title={usage.title}
          subtitle={usage.subtitle}
        />

        <div className="usage-grid">
          {usage.steps.map((st, idx) => (
            <div key={st.number} className="usage-step-card" data-reveal style={{ '--i': idx }}>
              <span className="usage-number">0{st.number}</span>
              <h3 className="usage-step-title">{st.title}</h3>
              <p className="usage-step-desc">{st.desc}</p>
            </div>
          ))}
        </div>

        {/* Tip banner */}
        {usage.tipContent && (
          <div className="usage-tip-banner" data-reveal>
            <div className="usage-tip-icon">
              <Lightbulb size={20} strokeWidth={1.25} />
            </div>
            <div>
              <h3 className="usage-tip-title">{usage.tipTitle}</h3>
              <p className="usage-tip-content">{usage.tipContent}</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
