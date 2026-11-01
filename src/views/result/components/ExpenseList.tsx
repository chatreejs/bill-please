import { Collapse, Divider } from 'antd';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

import { RootState } from '@config';
import { calculateExpenses, currencyFormat } from '@utils';
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

const ExpenseList: React.FC<{
  conversionRate?: number;
  currencySymbol?: string;
}> = ({ conversionRate = 1, currencySymbol = '' }) => {
  const billPayers = useSelector((state: RootState) => state.bill.payers);
  const billItems = useSelector((state: RootState) => state.bill.items);
  const billItemMapping = useSelector(
    (state: RootState) => state.bill.itemMapping,
  );

  const expenseList = useMemo(
    () => calculateExpenses(billPayers, billItems, billItemMapping),
    [billPayers, billItems, billItemMapping],
  );

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
                            : `${currencySymbol} ${currencyFormat(expense.total * conversionRate)}`}
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
                    <ExpenseItemList
                      expense={expense}
                      conversionRate={conversionRate}
                      currencySymbol={currencySymbol}
                    />
                    {expense.friend?.map((friend) => {
                      return (
                        <ItemChildrenWrapper key={friend.payerId}>
                          <Divider dashed={true} style={{ margin: '8px 0' }} />
                          <PayerWrapper key={payer.id}>
                            <PayerText>{friend.payerName}</PayerText>
                            <PayerText>
                              {friend.total <= 0
                                ? 0
                                : `${currencySymbol} ${currencyFormat(friend.total * conversionRate)}`}
                            </PayerText>
                          </PayerWrapper>
                          <ExpenseItemList
                            expense={friend}
                            conversionRate={conversionRate}
                            currencySymbol={currencySymbol}
                          />
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
