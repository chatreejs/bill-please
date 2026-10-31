import {
  ArrowDownOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css, keyframes } from 'styled-components';

const shimmer = keyframes`
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(100%);
  }
`;

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.15);
    opacity: 0.6;
  }
`;

const bounce = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(3px);
  }
`;

const dots = keyframes`
  0% { content: ''; }
  25% { content: '.'; }
  50% { content: '..'; }
  75%, 100% { content: '...'; }
`;

const Placeholder = styled.div<{ $isInteractive: boolean }>`
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  height: 40px;
  padding: 0 15px;
  border: 1px dashed #2c9c91;
  border-radius: 8px;
  background: #ffffff;
  color: #2c9c91;
  font-size: 14px;
  user-select: none;

  /* Light sweep across the placeholder while the check runs */
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(44, 156, 145, 0.18),
      transparent
    );
    animation: ${shimmer} 1.4s ease-in-out infinite;
  }

  ${({ $isInteractive }) =>
    $isInteractive &&
    css`
      border-style: solid;
      background: #f0faf9;

      &::after {
        display: none;
      }
    `}

  @media (prefers-reduced-motion: reduce) {
    &::after {
      animation: none;
      display: none;
    }
  }
`;

const Icon = styled.span<{ $animation: ReturnType<typeof keyframes> }>`
  display: inline-flex;
  font-size: 16px;
  animation: ${({ $animation }) => $animation} 1.2s ease-in-out infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const AnimatedDots = styled.span`
  display: inline-block;
  width: 1.2em;
  text-align: left;

  &::after {
    content: '...';
    animation: ${dots} 1.2s steps(1, end) infinite;
  }

  @media (prefers-reduced-motion: reduce) {
    &::after {
      animation: none;
    }
  }
`;

interface Props {
  isInteractive: boolean;
}

/**
 * Stands in for the "Add from bill" button while Turnstile checks the visitor.
 */
const TurnstileVerifying: React.FC<Props> = ({ isInteractive }) => {
  const { t } = useTranslation();

  return (
    <Placeholder
      role="status"
      aria-live="polite"
      $isInteractive={isInteractive}
    >
      {isInteractive ? (
        <>
          <Icon $animation={bounce}>
            <ArrowDownOutlined />
          </Icon>
          <span>{t('home.itemList.turnstile.interactive')}</span>
        </>
      ) : (
        <>
          <Icon $animation={pulse}>
            <SafetyCertificateOutlined />
          </Icon>
          <span>
            {t('home.itemList.turnstile.verifying')}
            <AnimatedDots aria-hidden />
          </span>
        </>
      )}
    </Placeholder>
  );
};

export default TurnstileVerifying;
