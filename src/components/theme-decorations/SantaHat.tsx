import React from 'react';
import styled from 'styled-components';

// Tilted onto the "B" of the logo. The logo text is position: relative, so
// the hat is placed against it
const Hat = styled.svg`
  position: absolute;
  top: -13px;
  left: -14px;
  width: 44px;
  height: 36px;
  transform: rotate(-16deg);
  pointer-events: none;
  filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.25));
`;

const SantaHat: React.FC = () => (
  <Hat viewBox="0 0 44 36" aria-hidden="true" data-testid="santa-hat">
    {/* Red cap, its tip folding over to the right */}
    <path
      d="M5 28 C6 15 14 6 24 5 C32 4.5 37 10 38 20 L34.5 21 C33 16 30.5 14 27.5 14.5 C29.5 19 30.5 23.5 31 28 Z"
      fill="#c0283a"
    />
    {/* The darker underside of the fold */}
    <path
      d="M27.5 14.5 C30.5 14 33 16 34.5 21 L32 21.5 C31 18 29.5 16 27.5 14.5 Z"
      fill="#8f1c2b"
    />
    {/* White fur band */}
    <rect x="2" y="25" width="32" height="8" rx="4" fill="#fafafa" />
    {/* Pompom */}
    <circle cx="37" cy="21.5" r="4.5" fill="#fafafa" />
  </Hat>
);

export default SantaHat;
