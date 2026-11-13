import React from 'react';
import styled from 'styled-components';

// Tilted onto the "B" of the logo. Logo's text is position: relative
const Hat = styled.svg`
  position: absolute;
  top: -15px;
  left: -13px;
  width: 38px;
  height: 32px;
  transform: rotate(-22deg);
  pointer-events: none;
  filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.25));
`;

const SantaHat: React.FC = () => (
  <Hat viewBox="0 0 38 32" aria-hidden="true" data-testid="santa-hat">
    {/* Red cap that flops over to the right */}
    <path
      d="M5 24 C7 12 15 4 25 5 C31 6 34 11 33 17 L30 16 C29 12 26 10 22 11 C16 13 13 18 12 24 Z"
      fill="#c0283a"
    />
    {/* White fur band */}
    <rect x="2" y="21" width="22" height="7" rx="3.5" fill="#fafafa" />
    {/* Pompom */}
    <circle cx="32" cy="19" r="4" fill="#fafafa" />
  </Hat>
);

export default SantaHat;
