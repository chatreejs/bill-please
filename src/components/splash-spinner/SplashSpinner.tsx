import React from 'react';
import styled, { keyframes } from 'styled-components';

const SplashSpinnerWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #fff;
`;

const spinnerAnimation = keyframes`
  0% {
    inset: 0 35px 35px 0
  }
  12.5% {
    inset: 0 35px 0 0
  }
  25% {
    inset: 35px 35px 0 0
  }
  37.5% {
    inset: 35px 0 0 0
  }
  50% {
    inset: 35px 0 0 35px
  }
  62.5% {
    inset: 0 0 0 35px
  }
  75% {
    inset: 0 0 35px 35px
  }
  87.5% {
    inset: 0 0 35px 0
  }
  100% {
    inset: 0 35px 35px 0
  }
`;

const Spinner = styled.div`
  width: 65px;
  aspect-ratio: 1;
  position: relative;

  &:before,
  &:after {
    content: '';
    position: absolute;
    border-radius: 50px;
    box-shadow: 0 0 0 3px inset #000;
    animation: ${spinnerAnimation} 2.5s infinite;
  }

  &:after {
    animation-delay: -1.25s;
    border-radius: 0;
  }
`;

const SplashSpinner: React.FC = () => {
  return (
    <SplashSpinnerWrapper>
      <Spinner />
    </SplashSpinnerWrapper>
  );
};

export default SplashSpinner;
