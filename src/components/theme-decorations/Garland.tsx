import React from 'react';
import styled, { css, keyframes } from 'styled-components';

export type GarlandKind = 'lights' | 'bunting';

// The wire hangs from y = WIRE_TOP and dips WIRE_SAG px between hooks. A
// quadratic curve with its control point at 2 × sag reaches the sag at the
// middle of each span
const WIRE_TOP = 2;
const WIRE_SAG = 8;
const HEIGHT = 34;

/** Height of the wire at `position` (0 to 1 along the strand) */
const wireY = (position: number, spans: number) => {
  const along = position * spans;
  const t = along - Math.floor(along);
  return WIRE_TOP + 4 * WIRE_SAG * t * (1 - t);
};

const wirePath = (spans: number) => {
  const step = 100 / spans;
  let path = `M0 ${WIRE_TOP}`;
  for (let i = 0; i < spans; i++) {
    path += ` Q${step * (i + 0.5)} ${WIRE_TOP + WIRE_SAG * 2} ${step * (i + 1)} ${WIRE_TOP}`;
  }
  return path;
};

const twinkle = keyframes`
  0%, 100% {
    opacity: 1;
    filter: brightness(1.1);
  }
  50% {
    opacity: 0.55;
    filter: brightness(0.85);
  }
`;

// Hangs over the top edge of the bill card, inside its rounded corners
const Strand = styled.div`
  position: absolute;
  top: -8px;
  left: 22px;
  right: 22px;
  height: ${HEIGHT}px;
  pointer-events: none;
`;

const Wire = styled.svg`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
`;

const itemStyles: Record<GarlandKind, ReturnType<typeof css>> = {
  lights: css`
    width: 9px;
    height: 14px;
    margin-left: -4.5px;
    border-radius: 50% 50% 50% 50% / 40% 40% 60% 60%;
    animation: ${twinkle} 1.8s ease-in-out infinite;

    /* Socket */
    &::before {
      content: '';
      position: absolute;
      top: -3px;
      left: 2px;
      width: 5px;
      height: 4px;
      border-radius: 1px;
      background: #3d4a3f;
    }
  `,
  bunting: css`
    width: 14px;
    height: 15px;
    margin-left: -7px;
    clip-path: polygon(0 0, 100% 0, 50% 100%);
  `,
};

const Item = styled.span<{ $kind: GarlandKind }>`
  position: absolute;
  ${({ $kind }) => itemStyles[$kind]}

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

interface Spec {
  spans: number;
  items: number;
  wire: string;
  /** Px from the wire to the item's top */
  offset: number;
  look: (index: number) => React.CSSProperties;
}

const pick = (colors: string[], index: number) => colors[index % colors.length];

const BULB_COLORS = ['#e23b3b', '#f2b630', '#2fa866', '#4f9be8'];

const SPECS: Record<GarlandKind, Spec> = {
  lights: {
    spans: 9,
    items: 9,
    wire: '#2f3b31',
    offset: -1,
    look: (i) => {
      const color = pick(BULB_COLORS, i);
      return {
        background: color,
        boxShadow: `0 0 8px 2px ${color}88`,
        animationDelay: `${(i % 3) * 0.6}s`,
      };
    },
  },
  bunting: {
    spans: 7,
    items: 14,
    wire: '#e7e2d3',
    offset: 0,
    look: () => ({}),
  },
};

interface GarlandProps {
  kind: GarlandKind;
  /** Flag colors, for `bunting` */
  colors?: string[];
}

const Garland: React.FC<GarlandProps> = ({ kind, colors = [] }) => {
  const spec = SPECS[kind];
  return (
    <Strand aria-hidden="true" data-testid={`garland-${kind}`}>
      {/* Only x stretches with the card, so the sag keeps its height in px */}
      <Wire viewBox={`0 0 100 ${HEIGHT}`} preserveAspectRatio="none">
        <path
          d={wirePath(spec.spans)}
          fill="none"
          stroke={spec.wire}
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
      </Wire>
      {Array.from({ length: spec.items }, (_, i) => {
        const position = (i + 0.5) / spec.items;
        return (
          <Item
            key={i}
            $kind={kind}
            style={{
              left: `${position * 100}%`,
              top: wireY(position, spec.spans) + spec.offset,
              ...(kind === 'bunting'
                ? { background: pick(colors, i) }
                : spec.look(i)),
            }}
          />
        );
      })}
    </Strand>
  );
};

export default Garland;
