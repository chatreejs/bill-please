import { RightOutlined } from '@ant-design/icons';
import { BillCard, ButtonWrapper } from '@components';
import { RootState } from '@config';
import { Button, Card, Tag, Typography } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const BillItemMapping: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const billItems = useSelector((state: RootState) => state.bill.items);

  return (
    <BillCard
      top={
        <>
          <Title level={2}>{t('mapping.title')}</Title>
          <Text italic>กรุณาเลือกว่ารายการไหนใครต้องจ่ายบ้าง</Text>
          <div>
            {billItems.map((item, index) => (
              <Card key={index} style={{ marginBottom: '6px' }}>
                <div>
                  {item.name}
                  <br />
                  <Tag>Kaemaros</Tag>
                  <Tag>Chanon</Tag>
                  <Tag>T</Tag>
                </div>
              </Card>
            ))}
          </div>
        </>
      }
      bottom={
        <ButtonWrapper>
          <Button
            type="primary"
            size="large"
            onClick={() => {
              navigate('/result');
            }}
          >
            {t('common.button.next')}
            <RightOutlined />
          </Button>
        </ButtonWrapper>
      }
    ></BillCard>
  );
};

export default BillItemMapping;
