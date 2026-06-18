import React from 'react';

export const Logo = ({ width = 160, className = '' }) => {
  return (
    <div className={`logo-wrapper ${className}`} style={{ width, display: 'inline-block' }}>
      <svg
        viewBox="0 0 450 150"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        dir="ltr"
        style={{ width: '100%', height: 'auto', direction: 'ltr' }}
      >
        {/* Smy text part */}
        <text
          x="10"
          y="85"
          fontFamily="System-UI, sans-serif"
          fontWeight="bold"
          fontSize="64"
          fill="var(--primary)"
          style={{ letterSpacing: '-1px' }}
        >
          Smy
        </text>

        {/* Smile curve underneath Smy */}
        <path
          d="M 68 85 C 70 102, 120 102, 122 85 C 122 87, 120 107, 68 107 Z"
          fill="var(--secondary)"
        />
        {/* Tiny dimple on left of smile */}
        <circle cx="68" cy="85" r="2" fill="var(--secondary)" />
        {/* Tiny dimple on right of smile */}
        <circle cx="122" cy="85" r="2" fill="var(--secondary)" />

        {/* Dental Handpiece (replacing 'l') */}
        <g transform="translate(120, -10)">
          {/* Handpiece handle */}
          <path
            d="M 33 55 L 35 110 C 35 113, 27 113, 27 110 L 29 55 Z"
            fill="var(--primary)"
          />
          {/* Handpiece head */}
          <path
            d="M 24 54 L 38 54 C 42 42, 20 42, 24 54 Z"
            fill="var(--primary)"
          />
          {/* Handpiece drill bit */}
          <line
            x1="31"
            y1="45"
            x2="18"
            y2="42"
            stroke="var(--primary)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Details lines */}
          <line
            x1="30"
            y1="68"
            x2="32"
            y2="68"
            stroke="var(--bg-color)"
            strokeWidth="1.5"
          />
          <line
            x1="30"
            y1="90"
            x2="32"
            y2="90"
            stroke="var(--bg-color)"
            strokeWidth="1.5"
          />
        </g>

        {/* oden part */}
        <text
          x="180"
          y="85"
          fontFamily="System-UI, sans-serif"
          fontWeight="bold"
          fontSize="64"
          fill="var(--primary)"
          style={{ letterSpacing: '-1px' }}
        >
          o
        </text>

        {/* 'd' with tooth cut-out inside */}
        <g transform="translate(222, 38)">
          {/* Outer 'd' loop and stem */}
          <path
            d="M 36 0 L 36 47 M 36 47 C 36 47, 36 47, 36 47 M 36 47 C 36 47, 5 47, 5 28 C 5 10, 36 10, 36 28"
            stroke="var(--secondary)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Inner Tooth icon inside 'd' counter-space */}
          <path
            d="M 17 22 C 15 20, 16 17, 19 17 C 22 17, 23 20, 21 22 C 22 25, 23 29, 23 32 L 20 32 L 19 28 L 18 32 L 15 32 C 15 29, 16 25, 17 22 Z"
            fill="var(--bg-color)"
          />
        </g>

        {/* 'en' text part */}
        <text
          x="285"
          y="85"
          fontFamily="System-UI, sans-serif"
          fontWeight="bold"
          fontSize="64"
          fill="var(--secondary)"
          style={{ letterSpacing: '-1px' }}
        >
          en
        </text>

        {/* Dental Mirror (replacing 't') */}
        <g transform="translate(365, 30)">
          {/* Mirror stem / handle */}
          <path
            d="M 15 22 L 15 65 C 15 68, 11 68, 11 65 L 11 22 Z"
            fill="var(--secondary)"
          />
          {/* Mirror circular frame */}
          <circle cx="13" cy="10" r="12" stroke="var(--secondary)" strokeWidth="4" />
          {/* Mirror reflection lines */}
          <line
            x1="8"
            y1="13"
            x2="15"
            y2="6"
            stroke="var(--secondary)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <line
            x1="12"
            y1="15"
            x2="17"
            y2="10"
            stroke="var(--secondary)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          {/* Mirror head cross attachment */}
          <rect x="7" y="19" width="12" height="4" fill="var(--secondary)" />
        </g>

        {/* Tagline: EVERYTHING FOR DENTISTRY */}
        <line x1="30" y1="122" x2="68" y2="122" stroke="var(--secondary)" strokeWidth="2.5" />
        <text
          x="225"
          y="127"
          fontFamily="System-UI, sans-serif"
          fontWeight="bold"
          fontSize="13.5"
          fill="var(--primary)"
          textAnchor="middle"
          style={{ letterSpacing: '4.5px' }}
        >
          EVERYTHING FOR DENTISTRY
        </text>
        <line x1="382" y1="122" x2="420" y2="122" stroke="var(--secondary)" strokeWidth="2.5" />
      </svg>
    </div>
  );
};

export default Logo;
