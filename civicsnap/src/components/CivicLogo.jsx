import React from 'react';

const CivicLogo = ({ size = 32, className = '' }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 64 64" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="CivicSnap Logo"
    >
      <defs>
        <linearGradient id="civicLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="50%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#A855F7" />
        </linearGradient>
        <linearGradient id="civicLogoLens" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="16" fill="url(#civicLogoGrad)"/>
      <path d="M25 16 H39 L42 20 H22 L25 16Z" fill="#FFFFFF" fillOpacity="0.95" />
      <rect x="13" y="20" width="38" height="28" rx="8" stroke="#FFFFFF" strokeWidth="3" fill="none"/>
      <circle cx="32" cy="34" r="9" stroke="#FFFFFF" strokeWidth="3" fill="#090A10" fillOpacity="0.3"/>
      <circle cx="32" cy="34" r="4.5" fill="url(#civicLogoLens)"/>
      <circle cx="32" cy="34" r="1.8" fill="#FFFFFF"/>
      <circle cx="43" cy="25" r="1.8" fill="#38BDF8"/>
    </svg>
  );
};

export default CivicLogo;
