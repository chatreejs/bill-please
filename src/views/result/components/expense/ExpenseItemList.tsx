import { Flex } from 'antd';
import React from 'react';
import styled from 'styled-components';

import { IExpense, IExpenseChildren } from '@interfaces';
import { currencyFormat } from '@utils';

const ItemWrapper = styled.div`
  display: flex;
  justify-content: space-between;

  div > span:first-child {
    margin-right: 1rem;
  }

  font-size: 13px;
`;

interface Props {
  expense: IExpense | IExpenseChildren;
}

const ExpenseItemList: React.FC<Props> = ({ expense }) => {
  return (
    <>
      {expense.items.map((item) => {
        return (
          <ItemWrapper key={item.itemName}>
            <Flex gap={'12px'}>
              <div>{item.itemQuantity}</div>
              <div>{item.itemName}</div>
            </Flex>
            <div>{currencyFormat(item.itemTotalPrice)}</div>
          </ItemWrapper>
        );
      })}
    </>
  );
};

export default ExpenseItemList;
