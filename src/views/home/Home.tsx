import {
  RightOutlined,
  UnorderedListOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { BillCard } from '@components';
import { Button, Input, Tabs, TabsProps } from 'antd';
import React, { useState } from 'react';
import styled from 'styled-components';
import ItemTable from './components/ItemTable';
import PayerTable from './components/PayerTable';

const ButtonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Home: React.FC = () => {
  const [billName, setBillName] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('item');

  const tabItems: TabsProps['items'] = [
    {
      key: 'item',
      label: 'Item',
      icon: <UnorderedListOutlined />,
      children: <ItemTable />,
    },
    {
      key: 'payer',
      label: 'Payer',
      icon: <UserOutlined />,
      children: <PayerTable />,
    },
  ];

  const updateBillName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBillName(e.target.value);
    console.log(billName);
  };

  const onTabClick = (key: string) => {
    setActiveTab(key);
  };

  return (
    <BillCard
      top={
        <>
          <Input
            size="large"
            placeholder="Bill name"
            variant="borderless"
            onChange={updateBillName}
            style={{
              fontSize: '28px',
              padding: '1rem 0',
            }}
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
          <Button type="primary" size="large">
            Next
            <RightOutlined />
          </Button>
        </ButtonWrapper>
      }
    />
  );
};

export default Home;
