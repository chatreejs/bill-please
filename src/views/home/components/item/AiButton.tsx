import { Button, ButtonProps, Tag } from 'antd';
import React, { useId } from 'react';
import styled, { keyframes } from 'styled-components';

// applyAppTheme (@config/theme) sets these stops from the theme's colors. The
// default theme's first stop is the primary teal, to match the rest of the app
const GRADIENT_STOPS = [
  'var(--app-ai-gradient-1)',
  'var(--app-ai-gradient-2)',
  'var(--app-ai-gradient-3)',
];
const GRADIENT = `linear-gradient(90deg, ${GRADIENT_STOPS.join(', ')})`;

const twinkle = keyframes`
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(0.6);
    opacity: 0.5;
  }
`;

const GradientButton = styled(Button)`
  && {
    border: 1px solid transparent;
    background:
      linear-gradient(#ffffff, #ffffff) padding-box,
      ${GRADIENT} border-box;
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.12);
    transition:
      box-shadow 0.2s ease,
      transform 0.2s ease;
  }

  &&:not(:disabled):hover,
  &&:not(:disabled):focus-visible {
    border-color: transparent;
    background:
      linear-gradient(#f8f7ff, #f8f7ff) padding-box,
      ${GRADIENT} border-box;
    box-shadow: 0 4px 16px rgba(168, 85, 247, 0.22);
  }

  &&:not(:disabled):active {
    transform: scale(0.98);
  }

  &&:disabled {
    filter: grayscale(1);
    opacity: 0.5;
  }

  /* antd shows its spinner in the icon slot; tint it to match the gradient */
  && .ant-btn-loading-icon {
    color: ${GRADIENT_STOPS[1]};
  }
`;

const Label = styled.span`
  background: ${GRADIENT};
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
`;

const SparkleSvg = styled.svg`
  width: 1.15em;
  height: 1.15em;

  & .small {
    transform-box: fill-box;
    transform-origin: center;
    animation: ${twinkle} 2s ease-in-out infinite;
  }

  & .small:last-child {
    animation-delay: 1s;
  }

  @media (prefers-reduced-motion: reduce) {
    & .small {
      animation: none;
    }
  }
`;

// A four-point star centred on (cx, cy) with radius r
const star = (cx: number, cy: number, r: number) => {
  const k = r * 0.22;
  return `M${cx} ${cy - r}Q${cx + k} ${cy - k} ${cx + r} ${cy}Q${cx + k} ${
    cy + k
  } ${cx} ${cy + r}Q${cx - k} ${cy + k} ${cx - r} ${cy}Q${cx - k} ${
    cy - k
  } ${cx} ${cy - r}Z`;
};

const SparklesIcon: React.FC = () => {
  const gradientId = useId();

  return (
    <SparkleSvg viewBox="0 0 24 24" aria-hidden focusable="false">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" style={{ stopColor: GRADIENT_STOPS[0] }} />
          <stop offset="100%" style={{ stopColor: GRADIENT_STOPS[1] }} />
        </linearGradient>
      </defs>
      <g fill={`url(#${gradientId})`}>
        <path d={star(14, 13, 9)} />
        <path className="small" d={star(5, 5, 4)} />
        <path className="small" d={star(5, 19.5, 2.5)} />
      </g>
    </SparkleSvg>
  );
};

// Sits after the gradient label, so it keeps antd's own tag colours
const BadgeTag = styled(Tag)`
  && {
    margin-inline: 0;
    line-height: 18px;
  }
`;

type AiButtonProps = Omit<ButtonProps, 'icon' | 'type'> & {
  /** Short label shown in an antd Tag after the text, for example "Beta" */
  badge?: React.ReactNode;
};

/**
 * Button for AI-powered actions: gradient border and text with a sparkle icon.
 */
const AiButton: React.FC<AiButtonProps> = ({ children, badge, ...props }) => (
  <GradientButton {...props} icon={<SparklesIcon />}>
    <Label>{children}</Label>
    {badge && (
      <BadgeTag color="purple" bordered={false}>
        {badge}
      </BadgeTag>
    )}
  </GradientButton>
);

export default AiButton;
