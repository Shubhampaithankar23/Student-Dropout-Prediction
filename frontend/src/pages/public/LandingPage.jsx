import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';
import {
  MdSchool, MdWarning, MdCheckCircle,
  MdEmail, MdPhone, MdLocationOn, MdArrowForward, MdStar,
  MdGroups
} from 'react-icons/md';
import { FaBrain, FaGithub, FaLinkedin, FaTwitter, FaUserShield } from 'react-icons/fa';
import { TypeAnimation } from 'react-type-animation';
import './LandingPage.css';

const stats = [
  { value: 94, suffix: '%', label: 'Prediction Accuracy', icon: '🎯' },
  { value: 15000, suffix: '+', label: 'Students Monitored', icon: '👨‍🎓' },
  { value: 87, suffix: '%', label: 'Dropout Prevention Rate', icon: '🛡️' },
  { value: 500, suffix: '+', label: 'Institutions Served', icon: '🏫' },
];

const features = [
  {
    icon: '🧠',
    title: 'AI-Powered Prediction',
    desc: 'Random Forest ML model analyzes 12+ student parameters to predict dropout risk with 94% accuracy.',
    color: '#E50914',
  },
  {
    icon: '⚠️',
    title: 'Early Warning System',
    desc: 'Real-time alerts notify counselors and administrators when students show high dropout risk patterns.',
    color: '#F59E0B',
  },
  {
    icon: '💬',
    title: 'Smart Counseling',
    desc: 'AI-generated personalized recommendations help counselors design targeted intervention plans.',
    color: '#22C55E',
  },
  {
    icon: '📊',
    title: 'Advanced Analytics',
    desc: 'Interactive dashboards provide deep insights into attendance, performance, and engagement trends.',
    color: '#3B82F6',
  },
  {
    icon: '📤',
    title: 'Bulk CSV Import',
    desc: 'Upload entire class datasets at once. Automatic prediction runs on all imported students.',
    color: '#8B5CF6',
  },
  {
    icon: '📄',
    title: 'Report Generation',
    desc: 'Export comprehensive PDF and Excel reports for institutional review and academic planning.',
    color: '#EC4899',
  },
];

const howItWorks = [
  { step: '01', title: 'Input Student Data', desc: 'Enter academic records, attendance, LMS activity, financial status and other key parameters.' },
  { step: '02', title: 'AI Analysis', desc: 'Our Random Forest model analyzes 12+ features and calculates a dropout risk probability score.' },
  { step: '03', title: 'Risk Classification', desc: 'Students are classified as Low, Medium, or High risk with detailed factor analysis.' },
  { step: '04', title: 'Counselor Action', desc: 'Counselors receive alerts, review AI recommendations, and schedule targeted interventions.' },
];

const testimonials = [
  {
    name: 'Dr. Priya Sharma',
    role: 'Dean of Students, MIT Pune',
    text: 'EduGuard AI helped us reduce dropout rates by 40% in one semester. The early warning system is a game-changer for student retention.',
    avatar: 'P',
    rating: 5,
  },
  {
    name: 'Prof. Rajesh Kumar',
    role: 'Head of Department, IIT Delhi',
    text: 'The prediction accuracy is remarkable. We can now identify at-risk students 3 months before they typically drop out.',
    avatar: 'R',
    rating: 5,
  },
  {
    name: 'Ms. Anita Patel',
    role: 'Student Counselor, NIT Surat',
    text: 'The AI recommendations are incredibly specific and actionable. My counseling sessions are now much more effective.',
    avatar: 'A',
    rating: 5,
  },
];

const LandingPage = () => {
  const [statsRef, statsInView] = useInView({ triggerOnce: true, threshold: 0.3 });
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [navScrolled, setNavScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => setNavScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    alert('Message sent! We will get back to you shortly.');
    setContactForm({ name: '', email: '', message: '' });
  };

  return (
    <div className="landing">
      {/* Navbar */}
      <nav className={`landing-nav ${navScrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
          <Link to="/" className="nav-logo">
            <div className="nav-logo-icon"><FaBrain /></div>
            <span className="nav-logo-text">EduGuard <span className="accent">AI</span></span>
          </Link>
          <div className={`nav-links ${mobileMenu ? 'open' : ''}`}>
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#stats">Statistics</a>
            <a href="#testimonials">Testimonials</a>
            <a href="#contact">Contact</a>
          </div>
          <div className="nav-actions">
            <Link to="/login" className="btn-secondary">Sign In</Link>
            <Link to="/register" className="btn-primary">Get Started <MdArrowForward /></Link>
          </div>
          <button className="nav-mobile-btn" onClick={() => setMobileMenu(!mobileMenu)}>
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-bg">
          <div className="hero-grid" />
          <div className="hero-glow-1" />
          <div className="hero-glow-2" />
          {[...Array(20)].map((_, i) => (
            <div key={i} className="particle" style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
              width: `${2 + Math.random() * 3}px`,
              height: `${2 + Math.random() * 3}px`,
            }} />
          ))}
        </div>

        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-dot" />
            AI-Powered Education Platform
          </div>

          <h1 className="hero-title">
            Predict Student Dropout with{' '}
            <span className="hero-title-highlight">
              <TypeAnimation
                sequence={['Artificial Intelligence', 2000, 'Machine Learning', 2000, '94% Accuracy', 2000]}
                wrapper="span"
                speed={50}
                repeat={Infinity}
              />
            </span>
          </h1>

          <p className="hero-desc">
            EduGuard AI identifies at-risk students early using advanced ML algorithms,
            enabling timely intervention and personalized counseling to prevent dropout
            before it happens.
          </p>

          <div className="hero-actions">
            <Link to="/register" className="btn-primary btn-large">
              Start Free Trial <MdArrowForward />
            </Link>
            <a href="#features" className="btn-secondary btn-large">
              Explore Features
            </a>
          </div>

          <div className="hero-trust">
            <span>Trusted by 500+ institutions</span>
            <div className="trust-avatars">
              {['A', 'B', 'C', 'D'].map((l, i) => (
                <div key={i} className="trust-avatar" style={{ marginLeft: i > 0 ? '-8px' : 0 }}>{l}</div>
              ))}
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="dashboard-preview">
            <div className="preview-header">
              <div className="preview-dots">
                <span style={{ background: '#E50914' }} />
                <span style={{ background: '#F59E0B' }} />
                <span style={{ background: '#22C55E' }} />
              </div>
              <span className="preview-title">EduGuard AI Dashboard</span>
            </div>
            <div className="preview-stats">
              {[
                { label: 'Total Students', value: '1,247', icon: '👨‍🎓', change: '+12%' },
                { label: 'High Risk', value: '89', icon: '⚠️', change: '-5%', red: true },
                { label: 'Counseled', value: '234', icon: '💬', change: '+28%' },
              ].map((s, i) => (
                <div key={i} className={`preview-stat ${s.red ? 'red' : ''}`}>
                  <span className="preview-stat-icon">{s.icon}</span>
                  <div>
                    <div className="preview-stat-value">{s.value}</div>
                    <div className="preview-stat-label">{s.label}</div>
                  </div>
                  <span className={`preview-change ${s.red ? 'down' : 'up'}`}>{s.change}</span>
                </div>
              ))}
            </div>
            <div className="preview-chart">
              <div className="preview-chart-title">Risk Distribution</div>
              <div className="preview-bars">
                {[
                  { label: 'Low Risk', pct: 60, color: '#22C55E' },
                  { label: 'Medium', pct: 25, color: '#F59E0B' },
                  { label: 'High Risk', pct: 15, color: '#E50914' },
                ].map((b, i) => (
                  <div key={i} className="preview-bar-row">
                    <span>{b.label}</span>
                    <div className="preview-bar-track">
                      <div className="preview-bar-fill" style={{ width: `${b.pct}%`, background: b.color }} />
                    </div>
                    <span>{b.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="preview-alert">
              <span className="alert-dot" />
              <span>⚠️ 3 new high-risk students detected</span>
              <button>View →</button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section" id="stats" ref={statsRef}>
        <div className="section-container">
          <div className="stats-grid">
            {stats.map((stat, i) => (
              <div key={i} className="stat-card">
                <div className="stat-icon">{stat.icon}</div>
                <div className="stat-number">
                  {statsInView ? (
                    <CountUp end={stat.value} duration={2.5} separator="," />
                  ) : '0'}
                  <span>{stat.suffix}</span>
                </div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="problem-section">
        <div className="section-container">
          <div className="problem-content">
            <div className="problem-text">
              <div className="section-tag">The Problem</div>
              <h2>Students Are Dropping Out — <span className="text-red">Silently</span></h2>
              <p>
                Millions of students abandon their education every year due to academic struggles,
                financial difficulties, and personal challenges. Traditional institutions lack
                the tools to identify these students before it's too late.
              </p>
              <ul className="problem-list">
                {[
                  'Late identification of at-risk students',
                  'No data-driven counseling approach',
                  'Reactive rather than proactive intervention',
                  'Lack of personalized support systems',
                ].map((item, i) => (
                  <li key={i}><MdWarning className="warn-icon" /> {item}</li>
                ))}
              </ul>
            </div>
            <div className="solution-box">
              <div className="solution-header">
                <FaBrain className="solution-icon" />
                <span>Our Solution</span>
              </div>
              <h3>AI-Based Early Detection</h3>
              <p>EduGuard AI continuously monitors 12+ student parameters and uses Random Forest ML to predict dropout risk with 94% accuracy — weeks before it's too late.</p>
              <div className="solution-features">
                {['Real-time monitoring', 'AI recommendations', 'Counselor alerts', 'Progress tracking'].map((f, i) => (
                  <div key={i} className="solution-feature">
                    <MdCheckCircle /> {f}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section" id="features">
        <div className="section-container">
          <div className="section-header">
            <div className="section-tag">Features</div>
            <h2>Everything You Need to <span className="text-red">Prevent Dropout</span></h2>
            <p>A complete AI-powered platform for student risk management and intervention</p>
          </div>
          <div className="features-grid">
            {features.map((f, i) => (
              <div key={i} className="feature-card" style={{ '--accent': f.color }}>
                <div className="feature-icon" style={{ background: `${f.color}20`, color: f.color }}>
                  {f.icon}
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-section" id="how-it-works">
        <div className="section-container">
          <div className="section-header">
            <div className="section-tag">Process</div>
            <h2>How <span className="text-red">EduGuard AI</span> Works</h2>
            <p>Four simple steps from data input to actionable intervention</p>
          </div>
          <div className="steps-grid">
            {howItWorks.map((step, i) => (
              <div key={i} className="step-card">
                <div className="step-number">{step.step}</div>
                <div className="step-connector" />
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="roles-section">
        <div className="section-container">
          <div className="section-header">
            <div className="section-tag">User Roles</div>
            <h2>Built for Your <span className="text-red">Entire Team</span></h2>
          </div>
          <div className="roles-grid">
            {[
              {
                role: 'Admin', icon: <FaUserShield />, color: '#E50914',
                features: ['Manage all users', 'System configuration', 'Full analytics access', 'Audit logs & reports'],
              },
              {
                role: 'Teacher', icon: <MdSchool />, color: '#3B82F6',
                features: ['Add student records', 'CSV bulk upload', 'Run predictions', 'Monitor performance'],
              },
              {
                role: 'Counselor', icon: <MdGroups />, color: '#22C55E',
                features: ['View at-risk students', 'Schedule sessions', 'AI recommendations', 'Track interventions'],
              },
            ].map((r, i) => (
              <div key={i} className="role-card" style={{ '--role-color': r.color }}>
                <div className="role-icon" style={{ color: r.color, background: `${r.color}20` }}>
                  {r.icon}
                </div>
                <h3>{r.role}</h3>
                <ul>
                  {r.features.map((f, j) => (
                    <li key={j}><MdCheckCircle style={{ color: r.color }} /> {f}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section" id="testimonials">
        <div className="section-container">
          <div className="section-header">
            <div className="section-tag">Testimonials</div>
            <h2>Trusted by <span className="text-red">Educators Worldwide</span></h2>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((t, i) => (
              <div key={i} className="testimonial-card">
                <div className="testimonial-stars">
                  {[...Array(t.rating)].map((_, j) => <MdStar key={j} />)}
                </div>
                <p className="testimonial-text">"{t.text}"</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">{t.avatar}</div>
                  <div>
                    <div className="testimonial-name">{t.name}</div>
                    <div className="testimonial-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="section-container">
          <div className="cta-content">
            <div className="cta-glow" />
            <h2>Ready to <span className="text-red">Prevent Dropouts</span>?</h2>
            <p>Join 500+ institutions using AI to keep students on track</p>
            <div className="cta-actions">
              <Link to="/register" className="btn-primary btn-large">
                Start Free Today <MdArrowForward />
              </Link>
              <Link to="/login" className="btn-secondary btn-large">Sign In</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="contact-section" id="contact">
        <div className="section-container">
          <div className="section-header">
            <div className="section-tag">Contact</div>
            <h2>Get in <span className="text-red">Touch</span></h2>
          </div>
          <div className="contact-grid">
            <div className="contact-info">
              <h3>Let's Talk</h3>
              <p>Have questions about EduGuard AI? We'd love to hear from you. Send us a message and we'll respond within 24 hours.</p>
              <div className="contact-details">
                <div className="contact-item"><MdEmail /> support@eduguard.ai</div>
                <div className="contact-item"><MdPhone /> +91 98765 43210</div>
                <div className="contact-item"><MdLocationOn /> Bangalore, India</div>
              </div>
              <div className="contact-socials">
                <a href="#contact" aria-label="Twitter"><FaTwitter /></a>
                <a href="#contact" aria-label="LinkedIn"><FaLinkedin /></a>
                <a href="#contact" aria-label="GitHub"><FaGithub /></a>
              </div>
            </div>
            <form className="contact-form" onSubmit={handleContactSubmit}>
              <div className="form-group">
                <label className="form-label">Your Name</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="John Doe"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  className="form-input"
                  type="email"
                  placeholder="john@example.com"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Message</label>
                <textarea
                  className="form-input"
                  rows={5}
                  placeholder="Tell us about your institution..."
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  required
                  style={{ resize: 'vertical' }}
                />
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                Send Message <MdArrowForward />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="section-container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="nav-logo">
                <div className="nav-logo-icon"><FaBrain /></div>
                <span className="nav-logo-text">EduGuard <span className="accent">AI</span></span>
              </div>
              <p>AI-Based Student Dropout Prediction and Preventive Counseling System. Built to keep every student on their path to success.</p>
            </div>
            <div className="footer-links">
              <h4>Platform</h4>
              <a href="#features">Features</a>
              <a href="#how-it-works">How It Works</a>
              <Link to="/login">Dashboard</Link>
              <Link to="/register">Sign Up</Link>
            </div>
            <div className="footer-links">
              <h4>Company</h4>
              <a href="#contact">Contact</a>
              <a href="#contact">Privacy Policy</a>
              <a href="#contact">Terms of Service</a>
              <a href="#how-it-works">Documentation</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2024 EduGuard AI. All rights reserved. Built with ❤️ for Education.</p>
            <div className="footer-socials">
              <a href="#contact" aria-label="Twitter"><FaTwitter /></a>
              <a href="#contact" aria-label="LinkedIn"><FaLinkedin /></a>
              <a href="#contact" aria-label="GitHub"><FaGithub /></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
