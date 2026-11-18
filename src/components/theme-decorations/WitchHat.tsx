import React from 'react';
import styled from 'styled-components';

// Tilted onto the "B" of the logo. The logo text is position: relative, so
// top and left count from its corner
const Hat = styled.svg`
  position: absolute;
  top: -15px;
  left: -16px;
  width: 42px;
  height: 36px;
  transform: rotate(-14deg);
  pointer-events: none;
  filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.35));
`;

/** Colors from the Dracula palette */
const WitchHat: React.FC = () => (
  <Hat viewBox="0 0 42 36" aria-hidden="true" data-testid="witch-hat">
    {/* Purple cone, its tip bending over to the right */}
    <path
      d="M11 28 C13 20 16 12 20 7 C23 3 28 1.5 33 3 C29 4.5 26.5 8 25.5 13 C24.5 18 25.5 23 28 28 Z"
      fill="#7c4dff"
    />
    {/* Brim */}
    <ellipse cx="20" cy="29" rx="19" ry="4.5" fill="#44475a" />
    {/* Orange band with a yellow buckle */}
    <path d="M12 24 L27.2 24 L28 27.5 L11 27.5 Z" fill="#ffb86c" />
    <rect
      x="17.5"
      y="23.3"
      width="4.5"
      height="4.8"
      rx="0.6"
      fill="none"
      stroke="#f1fa8c"
      strokeWidth="1.3"
    />
  </Hat>
);

export default WitchHat;
