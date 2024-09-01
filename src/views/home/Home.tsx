import {
  RightOutlined,
  UnorderedListOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Button, Tabs, TabsProps, Typography } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { BillCard, ButtonWrapper } from '@components';
import { RootState } from '@config';
import { setTitle } from '@slices';
import ItemTable from './components/item/ItemTable';
import PayerTable from './components/payer/PayerTable';

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

  useEffect(() => {
    if (billTitle === '') {
      dispatch(setTitle(dayjs().format('YYYY-MM-DD')));
    }
  }, [billTitle]);

  return (
    <BillCard
      top={
        <>
          <Typography.Title
            level={3}
            style={{ marginBottom: '1rem' }}
            editable={{
              onChange: (value) => dispatch(setTitle(value)),
            }}
          >
            {billTitle}
          </Typography.Title>
          <div>
            <Tabs
              size="large"
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
              navigate('/mapping', {
                replace: true,
              });
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
