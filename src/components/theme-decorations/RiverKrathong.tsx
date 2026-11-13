import React from 'react';
import styled, { keyframes } from 'styled-components';

// The wave tile is WAVE_WIDTH px wide, so moving the background by
// WAVE_WIDTH px loops the waves with no jump
const WAVE_WIDTH = 40;
const KRATHONG_WIDTH = 42;

const waveTile = (fill: string, crest: string) =>
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${WAVE_WIDTH}" height="12" viewBox="0 0 40 12">` +
      `<path d="M0 4 Q10 0 20 4 T40 4 V12 H0 Z" fill="${fill}"/>` +
      `<path d="M0 4 Q10 0 20 4 T40 4" fill="none" stroke="${crest}" stroke-width="1"/>` +
      `</svg>`,
  );

const flow = keyframes`
  from {
    background-position-x: 0;
  }
  to {
    background-position-x: ${WAVE_WIDTH}px;
  }
`;

// The krathong floats from left to right. translateX(100%) is the River's
// width, because Drift fills the River
const drift = keyframes`
  from {
    transform: translateX(-${KRATHONG_WIDTH}px);
  }
  to {
    transform: translateX(100%);
  }
`;

const bob = keyframes`
  0%, 100% {
    transform: translateY(0) rotate(-3deg);
  }
  50% {
    transform: translateY(-2px) rotate(3deg);
  }
`;

const flicker = keyframes`
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(0.85, 1.1);
  }
`;

// The River sits on the top edge of the bill card. Its ends fade out, so the
// krathong floats in and out of sight
const River = styled.div`
  position: absolute;
  top: -32px;
  left: 18px;
  right: 18px;
  height: 48px;
  /* Without the clip, the krathong past the right end widens the page */
  overflow: hidden;
  pointer-events: none;
  mask-image: linear-gradient(
    to right,
    transparent,
    #000 10%,
    #000 90%,
    transparent
  );
`;

const Wave = styled.div<{ $tile: string; $duration: number }>`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 12px;
  background: url('data:image/svg+xml,${({ $tile }) => $tile}') repeat-x;
  animation: ${flow} ${({ $duration }) => $duration}s linear infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const BackWave = styled(Wave)`
  bottom: 4px;
  opacity: 0.7;
  animation-direction: reverse;
`;

const Drift = styled.div`
  position: absolute;
  inset: 0;
  animation: ${drift} 36s linear infinite;
  /* Start a third of the way across, so it shows as soon as the page opens */
  animation-delay: -12s;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    transform: translateX(calc(50% - ${KRATHONG_WIDTH / 2}px));
  }
`;

const Boat = styled.svg`
  position: absolute;
  left: 0;
  bottom: 3px;
  width: ${KRATHONG_WIDTH}px;
  height: 38px;
  overflow: visible;
  transform-origin: 50% 90%;
  animation: ${bob} 3.2s ease-in-out infinite;

  .flame {
    transform-box: fill-box;
    transform-origin: 50% 100%;
    animation: ${flicker} 0.9s ease-in-out infinite;
    filter: drop-shadow(0 0 3px rgba(255, 190, 80, 0.9));
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;

    .flame {
      animation: none;
    }
  }
`;

const LEAF = '#3f7d3a';
const LEAF_LIGHT = '#5f9f4f';
const LEAF_EDGE = '#2f5f2b';

// Banana leaf folds in two rows, tall at the back and shorter in front, like
// the petals of a lotus. Each entry is the [x, y] of a fold's point
const BACK_FOLDS = [
  [7, 17],
  [14, 13],
  [21, 12],
  [28, 13],
  [35, 17],
];
const FRONT_FOLDS = [
  [10.5, 21],
  [17.5, 19],
  [24.5, 19],
  [31.5, 21],
];
const MARIGOLDS = [9, 15, 21, 27, 33];

const fold = ([x, y]: number[], fill: string) => (
  <path
    key={x}
    d={`M${x - 4.5} 30 L${x} ${y} L${x + 4.5} 30 Z`}
    fill={fill}
    stroke={LEAF_EDGE}
    strokeWidth="0.5"
    strokeLinejoin="round"
  />
);

/** A banana leaf krathong with marigolds, a candle and incense */
const Krathong: React.FC = () => (
  <Boat viewBox="0 0 42 38">
    {/* Incense sticks */}
    <path d="M16 24 L13 6 M26 24 L29 6" stroke="#8a5a2b" strokeWidth="0.9" />
    <circle cx="13" cy="6" r="0.9" fill="#ff7a3c" />
    <circle cx="29" cy="6" r="0.9" fill="#ff7a3c" />
    {/* Candle and flame */}
    <rect x="19.6" y="9" width="2.8" height="16" rx="0.7" fill="#fff4c2" />
    <path
      className="flame"
      d="M21 0.5 C23.4 4 23.2 7 21 8.4 C18.8 7 18.6 4 21 0.5 Z"
      fill="#ffb238"
    />
    {BACK_FOLDS.map((point) => fold(point, LEAF))}
    {FRONT_FOLDS.map((point) => fold(point, LEAF_LIGHT))}
    {MARIGOLDS.map((x) => (
      <g key={x}>
        <circle cx={x} cy={27} r={2.8} fill="#f59e0b" />
        <circle cx={x} cy={27} r={1.1} fill="#fde68a" />
      </g>
    ))}
    {/* The base is a slice of banana trunk */}
    <path
      d="M1 30 Q21 27 41 30 L37 36 Q21 38.5 5 36 Z"
      fill={LEAF}
      stroke={LEAF_EDGE}
      strokeWidth="0.5"
    />
  </Boat>
);

const BACK_TILE = waveTile('#7ea6e0', '#c9dcf7');
const FRONT_TILE = waveTile('#3a6cb4', '#a9c6f0');

/** Waves along the card's top edge with a krathong floating on them */
const RiverKrathong: React.FC = () => (
  <River aria-hidden="true" data-testid="river-krathong">
    <BackWave $tile={BACK_TILE} $duration={7} />
    <Drift>
      <Krathong />
    </Drift>
    <Wave $tile={FRONT_TILE} $duration={5} />
  </River>
);

export default RiverKrathong;
