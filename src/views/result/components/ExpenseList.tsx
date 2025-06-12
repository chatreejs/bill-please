import { Collapse, Divider } from 'antd';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

import { RootState } from '@config';
import {
  IBillItemMapping,
  IExpense,
  IExpenseChildren,
  IExpenseItem,
} from '@interfaces';
import { currencyFormat } from '@utils';
import ExpenseItemList from './expense/ExpenseItemList';

const StyledCollapse = styled(Collapse)`
  span.ant-collapse-header-text {
    flex: 1 !important;
  }
`;

const PayerWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const PayerText = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #000;
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
        const expenseItem = calculateExpanse(item);
        if (!expenseItem) return;

        expense.total += expenseItem.itemTotalPrice;
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
          const expenseItem = calculateExpanse(item);
          if (!expenseItem) return;

          friendExpense.total += expenseItem.itemTotalPrice;
          friendExpense.items.push(expenseItem);
        });
        expense.friend?.push(friendExpense);
        expense.total += friendExpense.total;
      });
      expenseList.push(expense);
    });
    setExpenseList(expenseList);
  };

  const calculateExpanse = (item: IBillItemMapping) => {
    const billItem = billItems.find((billItem) => billItem.id === item.itemId);

    if (!billItem) return;

    const payerCount = item.payerId.length;
    const itemQuantity = billItem.quantity / payerCount;
    const total = billItem.total! / payerCount;
    const service = billItem.service / payerCount;
    const vat = billItem.vat / payerCount;
    const expenseItem: IExpenseItem = {
      itemName: billItem.name,
      itemQuantity: itemQuantity,
      itemService: service,
      itemVat: vat,
      itemTotalPrice: total,
    };
    return expenseItem;
  };

  useEffect(() => {
    calculateExpenseList();

    return () => {
      setExpenseList([]);
    };
  }, []);

  return (
    <StyledCollapse
      bordered={false}
      style={{
        backgroundColor: 'white',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      }}
      defaultActiveKey={billPayers.map((payer) => payer.id)}
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
                        <PayerText>{payer.name}</PayerText>
                        <PayerText>
                          {expense.total <= 0
                            ? 0
                            : currencyFormat(expense.total)}
                        </PayerText>
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
                    <ExpenseItemList expense={expense} />
                    {expense.friend?.map((friend) => {
                      return (
                        <ItemChildrenWrapper key={friend.payerId}>
                          <Divider dashed={true} style={{ margin: '8px 0' }} />
                          <PayerWrapper key={payer.id}>
                            <PayerText>{friend.payerName}</PayerText>
                            <PayerText>
                              {friend.total <= 0 ? 0 : friend.total.toFixed(2)}
                            </PayerText>
                          </PayerWrapper>
                          <ExpenseItemList expense={friend} />
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
    </StyledCollapse>
  );
};

export default ExpenseList;
