import { Button, ButtonProps } from 'antd';
import React, { useId } from 'react';
import styled, { keyframes } from 'styled-components';

// Starts at the app's primary teal so the button still fits the theme
const GRADIENT_STOPS = ['#2c9c91', '#3b82f6', '#a855f7'];
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
          <stop offset="0%" stopColor={GRADIENT_STOPS[0]} />
          <stop offset="100%" stopColor={GRADIENT_STOPS[1]} />
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

/**
 * Button for AI-powered actions: gradient border and text with a sparkle icon.
 */
const AiButton: React.FC<Omit<ButtonProps, 'icon' | 'type'>> = ({
  children,
  ...props
}) => (
  <GradientButton {...props} icon={<SparklesIcon />}>
    <Label>{children}</Label>
  </GradientButton>
);

export default AiButton;
