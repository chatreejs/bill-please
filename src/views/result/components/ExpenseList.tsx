import { Collapse } from 'antd';
import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

import { RootState } from '@config';

const PayerWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  cursor: pointer;

  > div {
    font-size: 16px;
    font-weight: 400;
    color: #000;
  }
`;

const ItemWrapper = styled.div`
  display: flex;
  justify-content: space-between;

  div > span:first-child {
    margin-right: 1rem;
  }
`;

const ExpenseList: React.FC = () => {
  const billPayers = useSelector((state: RootState) => state.bill.payers);

  return (
    <Collapse
      bordered={false}
      style={{
        backgroundColor: 'white',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      }}
    >
      {billPayers.map((payer) => {
        return (
          <Collapse.Panel
            header={
              <PayerWrapper>
                <div>{payer.name}</div>
                <div>100</div>
              </PayerWrapper>
            }
            key={payer.id}
          >
            <ItemWrapper>
              <div>
                <span>1</span>
                <span>Bread</span>
              </div>
              <div>90</div>
            </ItemWrapper>
          </Collapse.Panel>
        );
      })}
    </Collapse>
  );
};

export default ExpenseList;
