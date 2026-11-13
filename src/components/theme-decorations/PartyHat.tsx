import React from 'react';
import styled from 'styled-components';

// Tilted onto the "B" of the logo. Logo's text is position: relative
const Hat = styled.svg`
  position: absolute;
  top: -22px;
  left: -6px;
  width: 26px;
  height: 34px;
  transform: rotate(-18deg);
  pointer-events: none;
  filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.25));
`;

const PartyHat: React.FC = () => (
  <Hat viewBox="0 0 26 34" aria-hidden="true" data-testid="party-hat">
    <defs>
      <clipPath id="party-hat-cone">
        <path d="M13 5 L24 31 L2 31 Z" />
      </clipPath>
    </defs>
    <path d="M13 5 L24 31 L2 31 Z" fill="#d4a020" />
    {/* Pink stripes, cut to the cone */}
    <g clipPath="url(#party-hat-cone)" fill="#e0559b">
      <path d="M0 14 L26 9 L26 13 L0 18 Z" />
      <path d="M0 24 L26 19 L26 23 L0 28 Z" />
    </g>
    {/* Pompom */}
    <circle cx="13" cy="4.5" r="3.5" fill="#fafafa" />
  </Hat>
);

export default PartyHat;
