import { useEffect, useState } from 'react';
import CivicLogo from './CivicLogo';
import './SplashScreen.css';

const SplashScreen = ({ onFinish }) => {
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Start fading out after 1.8 seconds
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 1800);

    // Call onFinish after fade animation completes (0.6s)
    const finishTimer = setTimeout(() => {
      onFinish();
    }, 2400);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div className={`splash-screen ${isFadingOut ? 'fade-out' : ''}`}>
      <div className="splash-ambient-mesh"></div>

      <div className="splash-content">
        <div className="splash-emblem-container">
          <div className="splash-radar-ring ring-1"></div>
          <div className="splash-radar-ring ring-2"></div>
          <CivicLogo size={74} className="splash-logo-core" />
        </div>

        <div className="splash-text-group">
          <h1 className="splash-title">CivicSnap</h1>
          <p className="splash-tagline">Municipal Transparency &amp; Community Resolution</p>
        </div>

        <div className="splash-progress-track">
          <div className="splash-progress-bar"></div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
