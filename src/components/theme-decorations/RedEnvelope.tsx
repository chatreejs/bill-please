import React from 'react';
import styled, { css } from 'styled-components';

import { CardPart, SEAL_OVERHANG } from './card';

const GOLD = '#b8860b';

// Insets and corners for a whole card, or for the top or bottom half of the
// Result page's ticket, which is open where the halves meet
const shape = (part: CardPart, inset: number, radius: number) => {
  switch (part) {
    case 'top':
      return css`
        inset: ${inset}px ${inset}px 0;
        border-bottom: none;
        border-radius: ${radius}px ${radius}px 0 0;
      `;
    case 'bottom':
      return css`
        inset: 0 ${inset}px ${inset}px;
        border-top: none;
        border-radius: 0 0 ${radius}px ${radius}px;
      `;
    default:
      return css`
        inset: ${inset}px;
        border-radius: ${radius}px;
      `;
  }
};

// A fine gold double line inside the card's edge, like the border printed on
// a red envelope. The card is position: relative
const Frame = styled.span<{ $part: CardPart }>`
  position: absolute;
  border: 1px solid rgba(184, 134, 11, 0.55);
  ${({ $part }) => shape($part, 7, 20)}
  pointer-events: none;

  &::after {
    content: '';
    position: absolute;
    border: 1px solid rgba(184, 134, 11, 0.3);
    ${({ $part }) => shape($part, 3, 16)}
  }
`;

// The envelope's seal, half over the card's top edge. The card's padding
// keeps it clear of the title
const Seal = styled.span`
  position: absolute;
  top: -${SEAL_OVERHANG}px;
  left: 50%;
  width: 40px;
  height: 40px;
  margin-left: -20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 1.5px solid #8a6410;
  background: radial-gradient(circle at 35% 30%, #fff1c1, #e2b04a 55%, ${GOLD});
  box-shadow:
    inset 0 0 0 3px rgba(255, 241, 193, 0.5),
    0 2px 6px rgba(80, 10, 10, 0.35);
  color: #a8101e;
  font-family: 'Noto Serif SC', 'Songti SC', 'STSong', serif;
  font-size: 21px;
  font-weight: 700;
  line-height: 1;
  pointer-events: none;
  user-select: none;
`;

const RedEnvelope: React.FC<{ part: CardPart }> = ({ part }) => (
  <>
    <Frame $part={part} aria-hidden="true" data-testid="envelope-frame" />
    {part !== 'bottom' && (
      // 福, good fortune
      <Seal aria-hidden="true" data-testid="envelope-seal">
        福
      </Seal>
    )}
  </>
);

export default RedEnvelope;
