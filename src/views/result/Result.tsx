import { RootState } from '@config';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import ExpenseList from './components/ExpenseList';
import QRCode from './components/QRCode';

const CardWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: inherit;
  margin: 0 auto;
  filter: var(--card-shadow-filter);
`;

const CardTop = styled.div`
  display: flex;
  flex-direction: column;
  background: #fafafa;
  border-radius: 24px;
  padding: 20px;
  border-radius: 24px 24px 0 0;
`;

const CardBottom = styled.div`
  display: flex;
  flex-direction: column;
  background: #fafafa;
  border-radius: 24px;
  padding: 20px;
  justify-content: center;
  align-items: center;
  border-radius: 0 0 24px 24px;
`;

const CardTitle = styled.h1`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  width: 100%;
`;

const SummaryWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 0.75rem 0.5rem;
  width: 100%;
`;

const SummaryTitle = styled.div`
  .title {
    font-size: 16px;
    color: #979ca2;
    margin-bottom: 4px;
  }

  .value {
    font-size: 26px;
  }

  &.text-right {
    text-align: right;
  }
`;

const TextSeparator = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 0.5rem 0;
  padding: 0.5rem 0;
  border-top: 1.5px solid #838689;
`;

const Separator = styled.div`
  height: 24px;
  width: 100%;
  margin: 0 auto;
  background-image: radial-gradient(circle, transparent 72%, #fafafa 72%),
    repeating-linear-gradient(
      90deg,
      #fafafa 0,
      #fafafa 2%,
      #b6bdc6 1%,
      #b6bdc6 18px
    ),
    linear-gradient(#fafafa, #fafafa),
    radial-gradient(circle, transparent 72%, #fafafa 72%);
  background-size:
    24px 24px,
    calc(100% - 24px) 1px,
    calc(100% - 24px) 100%,
    24px 24px;
  background-position:
    -12px 0,
    12px 50%,
    12px 0,
    calc(100% + 12px) 0;
  background-repeat: no-repeat;
`;

const Result: React.FC = () => {
  const { t } = useTranslation();
  const billTitle = useSelector((state: RootState) => state.bill.title);
  const billItems = useSelector((state: RootState) => state.bill.items);
  const billPayers = useSelector((state: RootState) => state.bill.payers);

  const [total, setTotal] = React.useState(0);

  useEffect(() => {
    let total = 0;
    billItems.forEach((item) => {
      total += item.total ?? 0;
    });
    setTotal(total);
  }, [billItems]);

  return (
    <CardWrapper>
      <CardTop>
        <CardTitle>{billTitle}</CardTitle>
        <SummaryWrapper>
          <SummaryTitle>
            <div className="title">{t('result.total')}</div>
            <div className="value">{total}</div>
          </SummaryTitle>
          <SummaryTitle className="text-right">
            <div className="title">{t('result.people')}</div>
            <div className="value">{billPayers.length}</div>
          </SummaryTitle>
        </SummaryWrapper>
        <TextSeparator>
          <div style={{ fontSize: 14, fontWeight: 300, color: '#979ca2' }}>
            {t('result.expenseList')}
          </div>
        </TextSeparator>
        <ExpenseList />
      </CardTop>
      <Separator />
      <CardBottom>
        <QRCode promptpayId="0806956194" />
      </CardBottom>
    </CardWrapper>
  );
};

export default Result;
