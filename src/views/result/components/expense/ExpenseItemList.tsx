import { Flex } from 'antd';
import React from 'react';
import styled from 'styled-components';

import { IExpense, IExpenseChildren } from '@interfaces';
import { currencyFormat, ellipsisText, numberFormat } from '@utils';

const ItemWrapper = styled.div`
  display: flex;
  justify-content: space-between;

  div > span:first-child {
    margin-right: 1rem;
  }

  font-size: 13px;

  div.extra-price {
    color: #888;
    font-style: italic;
  }
`;

interface Props {
  expense: IExpense | IExpenseChildren;
  conversionRate?: number;
  currencySymbol?: string;
}

const ExpenseItemList: React.FC<Props> = ({
  expense,
  conversionRate = 1,
  currencySymbol = '',
}) => {
  const fmt = (amount: number) =>
    `${currencySymbol} ${currencyFormat(amount * conversionRate)}`.trim();
  return (
    <>
      {expense.items.map((item) => {
        return (
          <ItemWrapper key={item.itemName}>
            <Flex gap={'12px'}>
              <div>{numberFormat(item.itemQuantity, 1)}</div>
              <div>{ellipsisText(item.itemName, 28)}</div>
            </Flex>
            <Flex gap={'6px'} justify="center" align="center">
              {item.itemService > 0 && (
                <div className="extra-price">S {fmt(item.itemService)}</div>
              )}
              {item.itemVat > 0 && (
                <div className="extra-price">V {fmt(item.itemVat)}</div>
              )}
              <div>{fmt(item.itemTotalPrice)}</div>
            </Flex>
          </ItemWrapper>
        );
      })}
    </>
  );
};

export default ExpenseItemList;
