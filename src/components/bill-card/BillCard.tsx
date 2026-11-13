import React from 'react';
import styled from 'styled-components';

import { ThemeCardDecoration } from '../theme-decorations/ThemeDecorations';

interface BillCardProps {
  top: React.ReactNode;
  bottom: React.ReactNode;
}

const CardWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: inherit;
  margin: 0 auto;
  filter: var(--card-shadow-filter);
`;

const CardBody = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: #faf9f6;
  border-radius: 26px;
  padding: 24px;
  min-height: 70vh;

  @media (min-height: 768px) {
    min-height: 644px;
  }
`;

const CardTop = styled.div`
  margin-bottom: 1rem;
`;

const CardBottom = styled.div``;

const BillCard: React.FC<BillCardProps> = ({ top, bottom }) => {
  return (
    <CardWrapper>
      <CardBody>
        <ThemeCardDecoration />
        <CardTop>{top}</CardTop>
        <CardBottom>{bottom}</CardBottom>
      </CardBody>
    </CardWrapper>
  );
};

export default BillCard;
