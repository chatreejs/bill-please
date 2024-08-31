import { Collapse, Flex } from 'antd';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

import { RootState } from '@config';
import { IExpense, IExpenseChildren, IExpenseItem } from '@interfaces';

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

const ItemChildrenWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-left: 1rem;
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
      const expense: IExpense = {
        payerId: payer.id,
        total: 0,
        items: [],
        friend: [],
      };
      const items = billItemMapping.filter((mapping) =>
        mapping.payerId.includes(payer.id),
      );

      items.forEach((item) => {
        const billItem = billItems.find(
          (billItem) => billItem.id === item.itemId,
        );

        if (!billItem) return;

        const itemQuantity = billItem.quantity;
        const payerCount = item.payerId.length;
        const total = billItem.total! / payerCount;
        const expenseItem: IExpenseItem = {
          itemName: billItem.name,
          itemQuantity: itemQuantity,
          itemTotalPrice: total,
        };

        expense.total += total;
        expense.items.push(expenseItem);
      });

      const friendIds = payer.friend?.map((friend) => friend.id);
      friendIds?.forEach((friendId) => {
        const friendExpense: IExpenseChildren = {
          payerId: friendId,
          payerName:
            payer.friend?.find((friend) => friend.id === friendId)?.name ?? '',
          total: 0,
          items: [],
        };
        const friendItems = billItemMapping.filter((mapping) =>
          mapping.payerId.includes(friendId),
        );

        friendItems.forEach((item) => {
          const billItem = billItems.find(
            (billItem) => billItem.id === item.itemId,
          );

          if (!billItem) return;

          const itemQuantity = billItem.quantity;
          const payerCount = item.payerId.length;
          const total = billItem.total! / payerCount;
          const expenseItem: IExpenseItem = {
            itemName: billItem.name,
            itemQuantity: itemQuantity,
            itemTotalPrice: total,
          };

          friendExpense.total += total;
          friendExpense.items.push(expenseItem);
        });
        expense.friend?.push(friendExpense);
        expense.total += friendExpense.total;
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
                return (
                  <>
                    {expense.items.map((item) => {
                      return (
                        <ItemWrapper key={item.itemName}>
                          <Flex gap={'12px'}>
                            <div>{item.itemQuantity}</div>
                            <div>{item.itemName}</div>
                          </Flex>
                          <div>{item.itemTotalPrice}</div>
                        </ItemWrapper>
                      );
                    })}
                    {expense.friend?.map((friend) => {
                      return (
                        <ItemChildrenWrapper key={friend.payerId}>
                          <div>{friend.payerName}</div>
                          {friend.items.map((item) => {
                            return (
                              <ItemWrapper key={item.itemName}>
                                <Flex gap={'12px'}>
                                  <div>{item.itemQuantity}</div>
                                  <div>{item.itemName}</div>
                                </Flex>
                                <div>{item.itemTotalPrice}</div>
                              </ItemWrapper>
                            );
                          })}
                        </ItemChildrenWrapper>
                      );
                    })}
                  </>
                );
              }
            })}
          </Collapse.Panel>
        );
      })}
    </Collapse>
  );
};

export default ExpenseList;
