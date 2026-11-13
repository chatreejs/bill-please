import React, { useMemo } from 'react';
import styled, { keyframes } from 'styled-components';

export type ParticleKind = 'snow' | 'lantern' | 'confetti' | 'glint' | 'drop';

// Each particle moves from --from to --to on the y axis, drifting --drift px
// sideways and turning --spin on the way
const travel = keyframes`
  from {
    transform: translate3d(0, var(--from), 0) rotate(0deg);
  }
  to {
    transform: translate3d(var(--drift), var(--to), 0) rotate(var(--spin));
  }
`;

// Sits behind the app (MainWrapper is above it), so particles only show on
// the page background and never cover a button
const Sky = styled.div`
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;

  @media (prefers-reduced-motion: reduce) {
    display: none;
  }
`;

const Particle = styled.span`
  position: absolute;
  top: 0;
  animation: ${travel} linear infinite;
  will-change: transform;
`;

const CONFETTI_COLORS = ['#f2c14e', '#e0559b', '#7dd3fc', '#e5e7eb', '#a78bfa'];

interface KindSpec {
  count: number;
  rises?: boolean;
  /** Seconds for one trip, min and max */
  duration: [number, number];
  /** Max sideways drift in px, either way */
  drift: number;
  /** Max turn in degrees, either way */
  spin: number;
  look: (random: () => number) => React.CSSProperties;
}

const between = (random: () => number, min: number, max: number) =>
  min + random() * (max - min);

const KINDS: Record<ParticleKind, KindSpec> = {
  snow: {
    count: 36,
    duration: [9, 19],
    drift: 30,
    spin: 0,
    look: (random) => {
      const size = between(random, 3, 8);
      return {
        width: size,
        height: size,
        borderRadius: '50%',
        background: '#ffffff',
        opacity: between(random, 0.45, 0.95),
      };
    },
  },
  // Khom loi, sky lanterns that rise
  lantern: {
    count: 24,
    rises: true,
    duration: [18, 30],
    drift: 40,
    spin: 8,
    look: (random) => {
      const width = between(random, 9, 16);
      return {
        width,
        height: width * 1.3,
        borderRadius: '45% 45% 35% 35%',
        background:
          'radial-gradient(circle at 50% 70%, #fff4c2, #f6a83c 55%, #c9561c)',
        boxShadow: '0 0 14px 4px rgba(255, 168, 60, 0.45)',
        opacity: between(random, 0.6, 0.95),
      };
    },
  },
  confetti: {
    count: 40,
    duration: [7, 13],
    drift: 50,
    spin: 900,
    look: (random) => ({
      width: between(random, 5, 8),
      height: between(random, 9, 13),
      borderRadius: 1,
      background:
        CONFETTI_COLORS[Math.floor(random() * CONFETTI_COLORS.length)],
      opacity: between(random, 0.7, 1),
    }),
  },
  // Small gold sparkles that fall slowly
  glint: {
    count: 16,
    duration: [14, 24],
    drift: 20,
    spin: 180,
    look: (random) => {
      const size = between(random, 7, 12);
      return {
        width: size,
        height: size,
        background: 'linear-gradient(135deg, #fff1c1, #e2b04a 60%, #b8860b)',
        clipPath:
          'polygon(50% 0, 60% 40%, 100% 50%, 60% 60%, 50% 100%, 40% 60%, 0 50%, 40% 40%)',
        opacity: between(random, 0.5, 0.9),
      };
    },
  },
  drop: {
    count: 40,
    duration: [2.5, 5],
    drift: 10,
    spin: 0,
    look: (random) => {
      const width = between(random, 4, 7);
      return {
        width,
        height: width * 1.5,
        borderRadius: '50% 50% 50% 50% / 30% 30% 70% 70%',
        background:
          'linear-gradient(rgba(255, 255, 255, 0.95), rgba(165, 225, 255, 0.75))',
        opacity: between(random, 0.5, 0.9),
      };
    },
  },
};

const makeParticles = (kind: ParticleKind) => {
  const spec = KINDS[kind];
  const random = Math.random;
  return Array.from({ length: spec.count }, () => {
    const duration = between(random, ...spec.duration);
    return {
      ...spec.look(random),
      left: `${random() * 100}%`,
      animationDuration: `${duration}s`,
      // A negative delay starts each particle part way along, so the sky is
      // full as soon as the page opens
      animationDelay: `${-random() * duration}s`,
      '--from': spec.rises ? '110vh' : '-10vh',
      '--to': spec.rises ? '-15vh' : '110vh',
      '--drift': `${between(random, -spec.drift, spec.drift)}px`,
      '--spin': `${between(random, -spec.spin, spec.spin)}deg`,
    } as React.CSSProperties;
  });
};

const Particles: React.FC<{ kind: ParticleKind }> = ({ kind }) => {
  const particles = useMemo(() => makeParticles(kind), [kind]);
  return (
    <Sky aria-hidden="true" data-testid={`particles-${kind}`}>
      {particles.map((style, index) => (
        <Particle key={index} style={style} />
      ))}
    </Sky>
  );
};

export default Particles;
