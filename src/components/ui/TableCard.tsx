import { Card } from 'antd';
import React from 'react';
import styled from 'styled-components';

const TableWrapper = styled.div`
  margin-bottom: 0.35rem;

  td {
    font-size: 0.875rem;
    cursor: pointer;
  }

  tr:last-child {
    td {
      border-bottom: none;
    }
  }
`;

const StyledCard = styled(Card)`
  margin: 1rem 0 0.35rem 0;

  .ant-card-body {
    padding: 0px;
  }
`;

interface Props {
  children: React.ReactNode;
}

const TableCard: React.FC<Props> = ({ children }) => {
  return (
    <StyledCard>
      <TableWrapper>{children}</TableWrapper>
    </StyledCard>
  );
};

export default TableCard;
