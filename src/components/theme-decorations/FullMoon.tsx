import React from 'react';
import styled from 'styled-components';

// Sits up and to the left of the logo, clear of the letters. Logo's text is
// position: relative with isolation: isolate, so z-index -1 puts the moon
// behind the text but above the page
const Moon = styled.span`
  position: absolute;
  top: -14px;
  left: -46px;
  z-index: -1;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: radial-gradient(circle at 38% 38%, #fffcef, #f7e9b8 60%, #e7d394);
  box-shadow: 0 0 22px 8px rgba(255, 238, 180, 0.3);
  pointer-events: none;
`;

const FullMoon: React.FC = () => (
  <Moon aria-hidden="true" data-testid="full-moon" />
);

export default FullMoon;
