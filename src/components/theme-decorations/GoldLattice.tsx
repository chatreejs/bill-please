import React from 'react';
import styled from 'styled-components';

// A diamond lattice with a small ring at each crossing, in gold. It doesn't
// move, so it stays under prefers-reduced-motion
const TILE = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44">` +
    `<g fill="none" stroke="#e2b04a" stroke-width="1">` +
    `<path d="M22 0 L44 22 L22 44 L0 22 Z"/>` +
    `<circle cx="22" cy="22" r="3.5"/>` +
    `<circle cx="0" cy="0" r="3.5"/><circle cx="44" cy="0" r="3.5"/>` +
    `<circle cx="0" cy="44" r="3.5"/><circle cx="44" cy="44" r="3.5"/>` +
    `</g></svg>`,
);

// Sits behind the app, like Particles
const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: 0.13;
  background-image: url('data:image/svg+xml,${TILE}');
  background-size: 44px 44px;
`;

const GoldLattice: React.FC = () => (
  <Backdrop aria-hidden="true" data-testid="gold-lattice" />
);

export default GoldLattice;
