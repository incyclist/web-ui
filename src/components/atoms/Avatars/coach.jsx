import React from "react";


export const CoachAvatarGraphics = ({ 
  helmet = "#ff0000", 
  shirt = "#0000ff", 
}) => {
  return (
      <g>
      <defs>
        <linearGradient id="faceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d0d0d0" />
          <stop offset="100%" stopColor="#a0a0a0" />
        </linearGradient>

        <radialGradient id="eyeGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="white" />
          <stop offset="100%" stopColor="black" />
        </radialGradient>

        <style>
          {`
            .shadow { fill: #606060; opacity: 0.4; }
            .highlight { fill: white; opacity: 0.3; }
          `}
        </style>
      </defs>

      {/* Head (Centered properly) */}
      <rect x="500" y="1000" width="1400" height="1400" fill="url(#faceGradient)" stroke="#808080" strokeWidth="40" rx="120" />

      {/* Highlights and shadows for depth */}
      <path className="highlight" d="M500 1000 Q1200 800, 1900 1000" />
      <path className="shadow" d="M500 2400 Q1200 2600, 1900 2400" />

      {/* Eyes with glow (positioned properly) */}
      <circle cx="900" cy="1500" r="96" fill="url(#eyeGlow)" />
      <circle cx="1500" cy="1500" r="96" fill="url(#eyeGlow)" />

      {/* Eye reflections */}
      <circle cx="930" cy="1470" r="36" fill="white" opacity="0.6" />
      <circle cx="1530" cy="1470" r="36" fill="white" opacity="0.6" />

      {/* Mouth */}
      <rect x="1020" y="1900" width="360" height="60" fill="black" rx="20" />

      {/* Helmet (Now extends fully left and right) */}
      <path fill={helmet} stroke="#600000" strokeWidth="40" d="M400 1000 Q1200 400, 2000 1000 L1900 1200 Q1200 800, 500 1200 Z" />
      <path className="highlight" d="M460 1000 Q1200 500, 1940 1000" />
      <path className="shadow" d="M500 1200 L1900 1200" />

      {/* Helmet vents */}
      <rect x="1020" y="700" width="120" height="120" fill="black" rx="20" />
      <rect x="1260" y="700" width="120" height="120" fill="black" rx="20" />

      {/* Neck */}
      <rect x="1080" y="2400" width="240" height="180" fill="#808080" stroke="#606060" strokeWidth="40" rx="50" />

      {/* Body (Properly scaled to fill width) */}
      <rect x="700" y="2600" width="1000" height="700" fill={shirt} stroke="#000080" strokeWidth="40" rx="120" />
      <path className="shadow" d="M700 2600 Q1200 2720, 1700 2600" />
    
      </g>
    
  );
};


export const CoachAvatar = ( props ) => (
  <svg 
    viewBox="0 600 2400 3394.29" 
    xmlns="http://www.w3.org/2000/svg" 
    preserveAspectRatio="xMidYMid meet"
  >
    <g>
      <CoachAvatarGraphics {...props} />
    </g>
  </svg>
  )


