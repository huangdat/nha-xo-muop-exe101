import React from 'react';
import { Sprout, ShieldCheck, HeartHandshake } from 'lucide-react';
import { siteData } from '../../data/siteData';
import SectionTitle from '../common/SectionTitle';
import ImagePlaceholder from '../common/ImagePlaceholder';
import './About.css';

export default function About() {
  const { about } = siteData;

  const valueIcons = [
    <Sprout size={20} key="sprout" />,
    <ShieldCheck size={20} key="shield" />,
    <HeartHandshake size={20} key="heart" />,
  ];

  return (
    <section id="about" className="section about-section">
      <div className="container">
        <div className="about-grid">
          {/* Left Column: Image graphic */}
          <div className="about-media-col">
            <div className="about-image-card" data-reveal="mask">
              <ImagePlaceholder
                src={about.image}
                alt={about.imageAlt}
                aspectRatio="4 / 5"
                label="Câu chuyện xơ mướp thủ công"
                style={{ objectPosition: about.imagePosition || 'center' }}
              />
            </div>
          </div>

          {/* Right Column: Information & values */}
          <div className="about-content-col">
            <SectionTitle
              index="01"
              badge={about.badge}
              title={about.title}
              align="left"
            />

            {about.lead && <p className="about-lead" data-reveal>{about.lead}</p>}

            {about.paragraphs &&
              about.paragraphs.map((p, idx) => (
                <p key={idx} className="about-paragraph" data-reveal style={{ '--i': idx + 1 }}>
                  {p}
                </p>
              ))}

            {/* Core Values list */}
            {about.values && (
              <div className="about-values-grid">
                {about.values.map((val, idx) => (
                  <div key={idx} className="about-value-item" data-reveal style={{ '--i': idx }}>
                    <div className="about-value-icon">
                      {valueIcons[idx % valueIcons.length]}
                    </div>
                    <div>
                      <h3 className="about-value-title">{val.title}</h3>
                      <p className="about-value-desc">{val.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
