import { FileTextOutlined, PlusOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import React from 'react';
import styled from 'styled-components';

const ButtonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ItemTable: React.FC = () => {
  return (
    <>
      <ButtonWrapper>
        <Button type="dashed" size="large" icon={<PlusOutlined />}>
          Add Item
        </Button>
        <Button type="dashed" size="large" icon={<FileTextOutlined />} disabled>
          Add from bill
        </Button>
      </ButtonWrapper>
    </>
  );
};

export default ItemTable;
