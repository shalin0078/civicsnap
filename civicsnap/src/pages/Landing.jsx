import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Camera, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Trash2, 
  Car, 
  Lightbulb, 
  Droplets, 
  ShieldAlert, 
  ArrowRight,
  Menu,
  X,
  ShieldCheck,
  Zap,
  TrendingUp,
  Activity,
  Users
} from 'lucide-react';
import CreateComplaint from '../components/CreateComplaint';
import CivicLogo from '../components/CivicLogo';
import { civicDataService } from '../lib/supabase';
import './Landing.css';

function Landing() {
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleOpenCategoryReport = (categoryName) => {
    setSelectedCategory(categoryName);
    setIsGuestModalOpen(true);
  };

  const handleGuestSubmit = async (complaintData) => {
    await civicDataService.createComplaint({
      ...complaintData,
      is_guest: true,
      author_name: complaintData.guest_name || 'Guest Citizen'
    });
    setIsGuestModalOpen(false);
    setSelectedCategory(null);
    navigate('/dashboard');
  };

  return (
    <div className="landing-page">
      {/* Top Banner Notice */}
      <div className="civic-announcement-bar">
        <div className="announcement-content">
          <span className="live-pulse"></span>
          <span><strong>CivicSnap Network Live:</strong> Over 2,400+ neighborhood reports resolved in collaboration with municipal wards.</span>
        </div>
      </div>

      {/* Navigation Bar */}
      <header className="landing-navbar">
        <div className="navbar-container">
          <Link to="/" className="navbar-brand">
            <CivicLogo size={36} />
            <div className="brand-title-group">
              <span className="brand-text">CivicSnap</span>
              <span className="brand-subtext">Municipal Transparency</span>
            </div>
          </Link>

          <nav className={`navbar-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
            <a href="#home" onClick={() => setMobileMenuOpen(false)}>Home</a>
            <a href="#agenda" onClick={() => setMobileMenuOpen(false)}>Our Agenda</a>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
            <a href="#municipal-action" onClick={() => setMobileMenuOpen(false)}>Municipal Action</a>
            <a href="#categories" onClick={() => setMobileMenuOpen(false)}>Categories</a>
            <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="nav-highlight">
              Community Feed
            </Link>
          </nav>

          <div className="navbar-actions">
            <Link to="/login" className="btn-nav-login">Sign In</Link>
            <Link to="/register" className="btn-nav-register">Get Started</Link>
            <button 
              className="mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <Zap size={14} />
              <span>Direct Citizen-to-Authority Triage</span>
            </div>

            <h1 className="hero-title">
              Empowering Citizens.<br />
              <span className="gradient-text">Transforming Neighborhoods.</span>
            </h1>

            <p className="hero-subtitle">
              Turn your smartphone into a community accountability tool. Photograph civic hazards, auto-pinpoint GPS locations, and follow real-time municipal repair crews from initial triage to verified completion.
            </p>

            <div className="hero-cta-group">
              <Link to="/dashboard" className="btn-cta-primary interactive-hover">
                <span>Explore Live Board</span>
                <ArrowRight size={18} />
              </Link>
              <button 
                type="button"
                className="btn-cta-secondary interactive-hover"
                onClick={() => setIsGuestModalOpen(true)}
              >
                <span>Guest Report an Issue</span>
              </button>
            </div>

            <div className="hero-trust-metrics">
              <div className="trust-metric">
                <span className="trust-number">2,480+</span>
                <span className="trust-label">Verified Fixes</span>
              </div>
              <div className="trust-divider"></div>
              <div className="trust-metric">
                <span className="trust-number">98.4%</span>
                <span className="trust-label">Response Rate</span>
              </div>
              <div className="trust-divider"></div>
              <div className="trust-metric">
                <span className="trust-number">&lt; 24h</span>
                <span className="trust-label">Emergency Triage</span>
              </div>
            </div>
          </div>

          {/* Hero Media Card with Citizen Reporting Photo */}
          <div className="hero-visual-column">
            <div className="hero-visual-card">
              <div className="hero-image-wrapper">
                <img 
                  src="/images/hero-citizen-reporting.jpg" 
                  alt="Citizen capturing civic issue on smartphone" 
                  className="hero-main-photo"
                />
                <div className="image-overlay-gradient"></div>
              </div>

              {/* Floating Live Card */}
              <div className="floating-live-ticket">
                <div className="ticket-header">
                  <div className="ticket-badge-live">
                    <span className="status-dot"></span>
                    Verified Submission
                  </div>
                  <span className="ticket-time">2 mins ago</span>
                </div>
                <h4 className="ticket-title">Hazardous Pothole Pinpointed</h4>
                <p className="ticket-loc"><MapPin size={13} /> Main St &amp; Elm Ave Intersection</p>
                <div className="ticket-meta">
                  <span className="ticket-tag priority">Emergency Severity</span>
                  <span className="ticket-tag status">Under Review</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Agenda & Community Impact Section */}
      <section id="agenda" className="section agenda-section">
        <div className="section-container">
          <div className="agenda-grid">
            <div className="agenda-image-col">
              <div className="agenda-image-container">
                <img 
                  src="/images/clean-green-community.jpg" 
                  alt="Clean and sustainable urban community" 
                  className="agenda-photo"
                />
                <div className="agenda-photo-badge">
                  <CheckCircle2 size={18} />
                  <span>The Civic Vision: Clean, Safe, Thriving</span>
                </div>
              </div>
            </div>

            <div className="agenda-content-col">
              <span className="section-pretitle">Our Purpose &amp; Agenda</span>
              <h2 className="section-title">Why CivicSnap Exists: Rebuilding Trust in Public Spaces</h2>
              <p className="section-subtitle">
                Traditional municipal reporting is slow, opaque, and often leaves residents wondering if their complaints were ever seen. CivicSnap was founded on three non-negotiable principles:
              </p>

              <div className="agenda-pillars-list">
                <div className="agenda-pillar-item">
                  <div className="pillar-num">01</div>
                  <div className="pillar-text">
                    <h4>Radical Transparency</h4>
                    <p>Every report enters an open public registry with visible timestamps, department routing, and official resolution notes. No complaint disappears into an administrative void.</p>
                  </div>
                </div>

                <div className="agenda-pillar-item">
                  <div className="pillar-num">02</div>
                  <div className="pillar-text">
                    <h4>Evidence-First Accountability</h4>
                    <p>Photo evidence and GPS coordinates give field crews the exact technical context needed to dispatch appropriate machinery on the first trip.</p>
                  </div>
                </div>

                <div className="agenda-pillar-item">
                  <div className="pillar-num">03</div>
                  <div className="pillar-text">
                    <h4>Civic Co-Ownership</h4>
                    <p>Cities thrive when residents are active stakeholders. From clean parks to safe roads, community reports turn citizens from passive bystanders into proactive neighborhood stewards.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Municipal Action Section */}
      <section id="municipal-action" className="section municipal-action-section">
        <div className="section-container">
          <div className="municipal-action-grid">
            <div className="action-text-col">
              <span className="section-pretitle">Municipal Collaboration</span>
              <h2 className="section-title">Direct Partnership with Public Works Crews</h2>
              <p className="action-description">
                CivicSnap is not just an alert board — it integrates with municipal department workflows. Reports are categorized and routed straight to specialized squads:
              </p>

              <div className="squad-cards">
                <div className="squad-card">
                  <div className="squad-icon-box road">
                    <ShieldAlert size={20} />
                  </div>
                  <div>
                    <h5>Roads &amp; Highways Squad</h5>
                    <p>Asphalt resurfacing, pothole filling, storm drain cover replacement.</p>
                  </div>
                </div>

                <div className="squad-card">
                  <div className="squad-icon-box sanitation">
                    <Trash2 size={20} />
                  </div>
                  <div>
                    <h5>Sanitation &amp; Waste Management</h5>
                    <p>Dumpster clearance, illegal dump site rehabilitation, bin maintenance.</p>
                  </div>
                </div>

                <div className="squad-card">
                  <div className="squad-icon-box electrical">
                    <Lightbulb size={20} />
                  </div>
                  <div>
                    <h5>Electrical &amp; Utilities Division</h5>
                    <p>Streetlight bulb replacement, wiring safety, and water main pipe repairs.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="action-image-col">
              <div className="action-photo-card">
                <img 
                  src="/images/municipal-crew-action.jpg" 
                  alt="Municipal road maintenance crew repairing asphalt" 
                  className="action-photo"
                />
                <div className="photo-caption-bar">
                  <div className="caption-text">
                    <strong>Ward 12 Street Maintenance Squad</strong>
                    <span>Pothole remediation completed in 4 hours from citizen snap</span>
                  </div>
                  <span className="caption-status">Verified Fix</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="section how-it-works-section">
        <div className="section-container">
          <div className="section-header">
            <span className="section-pretitle">Reporting Lifecycle</span>
            <h2 className="section-title">From Snap to Solution in 3 Simple Steps</h2>
            <p className="section-subtitle">A standardized workflow engineered for zero delays and maximum transparency.</p>
          </div>

          <div className="steps-cards-grid">
            <div className="step-feature-card">
              <div className="step-header">
                <span className="step-tag">Step 1</span>
                <span className="step-metric">~30 seconds</span>
              </div>
              <div className="step-icon-wrapper">
                <Camera size={26} />
              </div>
              <h3>Snap &amp; Geotag</h3>
              <p>Take a clear photograph of the issue. The app automatically attaches GPS coordinates, or you can specify a landmark. Pick category and urgency.</p>
            </div>

            <div className="step-feature-card">
              <div className="step-header">
                <span className="step-tag">Step 2</span>
                <span className="step-metric">Same Day</span>
              </div>
              <div className="step-icon-wrapper">
                <Clock size={26} />
              </div>
              <h3>Authority Triage &amp; Dispatch</h3>
              <p>Municipal ward officers evaluate priority. High hazards trigger emergency dispatch; field crews receive the exact coordinates and gear requirements.</p>
            </div>

            <div className="step-feature-card">
              <div className="step-header">
                <span className="step-tag">Step 3</span>
                <span className="step-metric">Verified</span>
              </div>
              <div className="step-icon-wrapper">
                <ShieldCheck size={26} />
              </div>
              <h3>Resolution &amp; Proof</h3>
              <p>Once repairs conclude, authorities upload resolution remarks and timestamped confirmation. The issue card updates across the community board.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Categories Showcase */}
      <section id="categories" className="section categories-section">
        <div className="section-container">
          <div className="section-header">
            <span className="section-pretitle">Issue Classifications</span>
            <h2 className="section-title">Supported Civic Categories</h2>
            <p className="section-subtitle">Dedicated reporting channels tailored for rapid routing to municipal teams.</p>
          </div>

          <div className="categories-grid-modern">
            <div 
              className="category-modern-card interactive-card"
              onClick={() => handleOpenCategoryReport('Potholes')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleOpenCategoryReport('Potholes')}
            >
              <div className="cat-header">
                <div className="cat-icon-chip red">
                  <AlertTriangle size={20} />
                </div>
                <span className="cat-sla">Emergency Response</span>
              </div>
              <h4>Hazardous Potholes</h4>
              <p>Deep road depressions, asphalt erosion, sinkholes, and vehicle hazard zones.</p>
              <div className="cat-card-action">
                <span>Report Pothole</span>
                <ArrowRight size={14} />
              </div>
            </div>

            <div 
              className="category-modern-card interactive-card"
              onClick={() => handleOpenCategoryReport('Garbage & Waste Dumps')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleOpenCategoryReport('Garbage & Waste Dumps')}
            >
              <div className="cat-header">
                <div className="cat-icon-chip amber">
                  <Trash2 size={20} />
                </div>
                <span className="cat-sla">24-Hour Dispatch</span>
              </div>
              <h4>Garbage &amp; Waste Dumps</h4>
              <p>Overflowing community dumpsters, uncollected trash heaps, and open garbage burning.</p>
              <div className="cat-card-action">
                <span>Report Waste</span>
                <ArrowRight size={14} />
              </div>
            </div>

            <div 
              className="category-modern-card interactive-card"
              onClick={() => handleOpenCategoryReport('Illegal Parking')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleOpenCategoryReport('Illegal Parking')}
            >
              <div className="cat-header">
                <div className="cat-icon-chip blue">
                  <Car size={20} />
                </div>
                <span className="cat-sla">Traffic Police</span>
              </div>
              <h4>Illegal Parking</h4>
              <p>Vehicles obstructing pedestrian footpaths, bike tracks, fire hydrants, or emergency lanes.</p>
              <div className="cat-card-action">
                <span>Report Obstruction</span>
                <ArrowRight size={14} />
              </div>
            </div>

            <div 
              className="category-modern-card interactive-card"
              onClick={() => handleOpenCategoryReport('Streetlight Problems')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleOpenCategoryReport('Streetlight Problems')}
            >
              <div className="cat-header">
                <div className="cat-icon-chip yellow">
                  <Lightbulb size={20} />
                </div>
                <span className="cat-sla">Electrical Ward</span>
              </div>
              <h4>Streetlight Faults</h4>
              <p>Extinguished light poles, dark road stretches, flickering lamps, and exposed wires.</p>
              <div className="cat-card-action">
                <span>Report Streetlight</span>
                <ArrowRight size={14} />
              </div>
            </div>

            <div 
              className="category-modern-card interactive-card"
              onClick={() => handleOpenCategoryReport('Water Supply & Pipeline Leakage')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleOpenCategoryReport('Water Supply & Pipeline Leakage')}
            >
              <div className="cat-header">
                <div className="cat-icon-chip cyan">
                  <Droplets size={20} />
                </div>
                <span className="cat-sla">Water Board</span>
              </div>
              <h4>Water &amp; Pipeline Leaks</h4>
              <p>Burst supply lines, drinking water contamination, blocked drainage, and stagnant water.</p>
              <div className="cat-card-action">
                <span>Report Leak</span>
                <ArrowRight size={14} />
              </div>
            </div>

            <div 
              className="category-modern-card interactive-card"
              onClick={() => handleOpenCategoryReport('Road & Infrastructure Defects')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleOpenCategoryReport('Road & Infrastructure Defects')}
            >
              <div className="cat-header">
                <div className="cat-icon-chip purple">
                  <ShieldAlert size={20} />
                </div>
                <span className="cat-sla">Engineering</span>
              </div>
              <h4>Public Infrastructure</h4>
              <p>Damaged pedestrian sidewalks, missing storm drain covers, fallen road signs, broken railings.</p>
              <div className="cat-card-action">
                <span>Report Defect</span>
                <ArrowRight size={14} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="cta-banner-section">
        <div className="cta-banner-card">
          <div className="cta-banner-content">
            <span className="cta-pretitle">Ready to Take Action?</span>
            <h2>Help Us Build Cleaner, Safer Neighborhoods</h2>
            <p>You can report an issue in under a minute without even creating an account, or sign up to track your submitted reports over time.</p>
            <div className="cta-button-row">
              <button 
                type="button" 
                className="btn-cta-white interactive-hover"
                onClick={() => setIsGuestModalOpen(true)}
              >
                <span>Guest Report an Issue</span>
              </button>
              <Link to="/register" className="btn-cta-outline interactive-hover">
                <span>Create Citizen Profile</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Footer */}
      <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-brand-col">
            <div className="footer-brand-title">
              <CivicLogo size={28} />
              <span>CivicSnap</span>
            </div>
            <p className="footer-brand-desc">
              CivicSnap is an open civic engagement and municipal accountability platform designed to empower citizens and expedite public hazard resolution.
            </p>
          </div>

          <div className="footer-nav-col">
            <h5>Navigation</h5>
            <ul>
              <li><a href="#home">Home</a></li>
              <li><a href="#agenda">Our Agenda</a></li>
              <li><a href="#how-it-works">How It Works</a></li>
              <li><a href="#municipal-action">Municipal Action</a></li>
              <li><Link to="/dashboard">Community Board</Link></li>
            </ul>
          </div>

          <div className="footer-nav-col">
            <h5>Participation</h5>
            <ul>
              <li><Link to="/login">Citizen Sign In</Link></li>
              <li><Link to="/register">Create Account</Link></li>
              <li><button type="button" className="link-button" onClick={() => setIsGuestModalOpen(true)}>Guest Submission</button></li>
              <li><Link to="/login">Authority Access</Link></li>
            </ul>
          </div>

          <div className="footer-nav-col">
            <h5>Municipal Emergency Lines</h5>
            <ul className="footer-helplines">
              <li><span>Road &amp; Traffic:</span> 1073</li>
              <li><span>Water &amp; Pipeline:</span> 1916</li>
              <li><span>Waste Control:</span> 1800-11-2233</li>
              <li><span>Emergency Response:</span> 112 / 911</li>
            </ul>
          </div>
        </div>

        <div className="footer-copyright-bar">
          <p>&copy; {new Date().getFullYear()} CivicSnap Platform. Built for civic empowerment and public accountability.</p>
        </div>
      </footer>

      {/* Guest Reporting Modal */}
      {isGuestModalOpen && (
        <CreateComplaint
          isGuestMode={true}
          initialCategory={selectedCategory}
          onClose={() => {
            setIsGuestModalOpen(false);
            setSelectedCategory(null);
          }}
          onSubmit={handleGuestSubmit}
        />
      )}
    </div>
  );
}

export default Landing;
