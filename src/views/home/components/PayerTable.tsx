import { PlusOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import React from 'react';
import styled from 'styled-components';

const ActionButton = styled.div``;

const ButtonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const PayerTable: React.FC = () => {
  return (
    <>
      <ActionButton></ActionButton>
      <ButtonWrapper>
        <Button type="dashed" size="large" icon={<PlusOutlined />}>
          Add Payer
        </Button>
      </ButtonWrapper>
    </>
  );
};

export default PayerTable;
