import { Collapse, Flex } from 'antd';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

import { RootState } from '@config';
import { IExpense, IExpenseItem } from '@interfaces';

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
  const billItems = useSelector((state: RootState) => state.bill.items);
  const billItemMapping = useSelector(
    (state: RootState) => state.bill.itemMapping,
  );

  const [expenseList, setExpenseList] = useState<IExpense[]>([]);

  const calculateExpenseList = () => {
    const expenseList: IExpense[] = [];

    billPayers.forEach((payer) => {
      let expense: IExpense = {
        payerId: payer.id,
        total: 0,
        items: [],
      };
      const items = billItemMapping.filter((mapping) =>
        mapping.payerId.includes(payer.id),
      );

      items.forEach((item) => {
        const billItem = billItems.find(
          (billItem) => billItem.id === item.itemId,
        );

        if (!billItem) return;

        let itemQuantity = billItem.quantity;
        let payerCount = item.payerId.length;
        const total = billItem.total / payerCount;
        let expenseItem: IExpenseItem = {
          itemName: billItem.name,
          itemQuantity: itemQuantity,
          itemTotalPrice: total,
        };

        expense.total += total;
        expense.items.push(expenseItem);
      });
      expenseList.push(expense);
    });
    setExpenseList(expenseList);
  };

  useEffect(() => {
    calculateExpenseList();

    return () => {
      setExpenseList([]);
    };
  }, []);

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
            collapsible="header"
            header={
              <>
                {expenseList.map((expense) => {
                  if (expense.payerId === payer.id) {
                    return (
                      <PayerWrapper key={payer.id}>
                        <div>{payer.name}</div>
                        <div>{expense.total}</div>
                      </PayerWrapper>
                    );
                  }
                })}
              </>
            }
            key={payer.id}
          >
            {expenseList.map((expense) => {
              if (expense.payerId === payer.id) {
                return expense.items.map((item, index) => {
                  return (
                    <ItemWrapper key={index}>
                      <Flex gap={'12px'}>
                        <div>{item.itemQuantity}</div>
                        <div>{item.itemName}</div>
                      </Flex>
                      <div>{item.itemTotalPrice}</div>
                    </ItemWrapper>
                  );
                });
              }
            })}
          </Collapse.Panel>
        );
      })}
    </Collapse>
  );
};

export default ExpenseList;
