import { RightOutlined } from '@ant-design/icons';
import { Button, Card, Flex, Tag, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { BillCard, ButtonWrapper, PayerTag } from '@components';
import { RootState } from '@config';
import { getColorByName } from '@utils';
import BillItemMappingModal from './components/BillItemMappingModal';

const { Title, Text } = Typography;

const BillItemMapping: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const billItems = useSelector((state: RootState) => state.bill.items);
  const billPayers = useSelector((state: RootState) => state.bill.payers);
  const billItemMappings = useSelector(
    (state: RootState) => state.bill.itemMapping,
  );

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [selectedItemId, setSelectedItemId] = useState<string>();
  const [isDisableButton, setIsDisableButton] = useState<boolean>(true);

  const getPayerNameList = (payerIds: string[]) => {
    const payerNameList: string[] = [];
    billPayers.forEach((payer) => {
      if (payerIds.includes(payer.id)) {
        payerNameList.push(payer.name);
      }
      if (payer.friend) {
        payer.friend.forEach((friend) => {
          if (payerIds.includes(friend.id)) {
            payerNameList.push(friend.name);
          }
        });
      }
    });
    return payerNameList;
  };

  const openModal = (id: string) => {
    setSelectedItemId(id);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedItemId(undefined);
  };

  useEffect(() => {
    setIsDisableButton(
      billItemMappings.some((mapping) => mapping.payerId.length === 0),
    );
  }, [billItemMappings]);

  return (
    <BillCard
      top={
        <>
          <Title level={3} style={{ marginBottom: '0.25rem' }}>
            {t('mapping.title')}
          </Title>
          <Text italic>{t('mapping.description')}</Text>
          <div style={{ marginTop: '1rem' }}>
            {billItems.map((item) => (
              <Card
                key={item.id}
                style={{ marginBottom: '6px' }}
                onClick={() => openModal(item.id)}
              >
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    marginBottom: '12px',
                  }}
                >
                  {item.name}
                </div>
                <Flex wrap>
                  {billItemMappings?.some((mapping) => {
                    if (mapping.itemId === item.id) {
                      return mapping.payerId.length > 0;
                    }
                  }) ? (
                    <>
                      {billItemMappings?.map((mapping) => {
                        if (mapping.itemId === item.id) {
                          return getPayerNameList(mapping.payerId).map(
                            (payerName) => (
                              <PayerTag
                                style={{
                                  marginBottom: '8px',
                                  height: 30,
                                  fontSize: 16,
                                }}
                                key={payerName}
                                color={getColorByName(payerName)}
                              >
                                {payerName}
                              </PayerTag>
                            ),
                          );
                        }
                      })}
                    </>
                  ) : (
                    <Tag
                      style={{
                        height: 26,
                        fontSize: 16,
                        borderStyle: 'dashed',
                      }}
                    >
                      {t('mapping.noPayer')}
                    </Tag>
                  )}
                </Flex>
              </Card>
            ))}
          </div>
          <BillItemMappingModal
            isOpen={isModalVisible}
            itemId={selectedItemId!}
            onClose={closeModal}
          />
        </>
      }
      bottom={
        <ButtonWrapper>
          <Button
            type="primary"
            size="large"
            onClick={() => {
              navigate('/result', { replace: true });
            }}
            disabled={isDisableButton}
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
