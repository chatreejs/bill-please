import {
  RightOutlined,
  UnorderedListOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { BillCard, ButtonWrapper } from '@components';
import { RootState } from '@config';
import { setTitle } from '@slices';
import { Button, Input, Tabs, TabsProps } from 'antd';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import ItemTable from './components/ItemTable';
import PayerTable from './components/PayerTable';

const Home: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const billTitle = useSelector((state: RootState) => state.bill.title);
  const billItems = useSelector((state: RootState) => state.bill.items);
  const billPayers = useSelector((state: RootState) => state.bill.payers);
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState<string>('item');
  const [isNextButtonDisabled, setIsNextButtonDisabled] =
    useState<boolean>(true);

  const tabItems: TabsProps['items'] = [
    {
      key: 'item',
      label: t('home.tab.itemList'),
      icon: <UnorderedListOutlined />,
      children: <ItemTable />,
    },
    {
      key: 'payer',
      label: t('home.tab.payerList'),
      icon: <UserOutlined />,
      children: <PayerTable />,
    },
  ];

  const updateBillName = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setTitle(e.target.value));
  };

  const onTabClick = (key: string) => {
    setActiveTab(key);
  };

  useEffect(() => {
    if (billItems.length > 0 && billPayers.length > 0) {
      setIsNextButtonDisabled(false);
    } else {
      setIsNextButtonDisabled(true);
    }
  }, [billItems, billPayers]);

  return (
    <BillCard
      top={
        <>
          <Input
            size="large"
            placeholder={t('home.billTitle')}
            variant="borderless"
            onChange={updateBillName}
            style={{
              fontSize: '28px',
              padding: '1rem 0',
            }}
            value={billTitle}
          />
          <div>
            <Tabs
              defaultActiveKey="1"
              items={tabItems}
              onTabClick={onTabClick}
              activeKey={activeTab}
              centered
            />
          </div>
        </>
      }
      bottom={
        <ButtonWrapper>
          <Button
            type="primary"
            size="large"
            onClick={() => {
              navigate('/mapping');
            }}
            disabled={isNextButtonDisabled}
          >
            {t('common.button.next')}
            <RightOutlined />
          </Button>
        </ButtonWrapper>
      }
    />
  );
};

export default Home;
