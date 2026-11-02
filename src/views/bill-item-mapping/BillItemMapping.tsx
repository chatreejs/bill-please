import { RightOutlined } from '@ant-design/icons';
import { Button, Card, Flex, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { BillCard, ButtonWrapper, PayerTag } from '@components';
import { RootState } from '@config';
import { IBillItemShare } from '@interfaces';
import { getColorByName, trackEvent } from '@utils';
import BillItemMappingModal from './components/BillItemMappingModal';

const { Title, Text } = Typography;

const ShareWeight = styled.span`
  margin-left: 4px;
  font-weight: 600;
`;

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

  const getPayerShareList = (shares: IBillItemShare[]) => {
    const payerShareList: { id: string; name: string; weight: number }[] = [];
    const add = (id: string, name: string) => {
      const share = shares.find((s) => s.payerId === id);
      if (share) payerShareList.push({ id, name, weight: share.weight });
    };
    billPayers.forEach((payer) => {
      add(payer.id, payer.name);
      payer.friend?.forEach((friend) => add(friend.id, friend.name));
    });
    return payerShareList;
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
      billItemMappings.some((mapping) => mapping.shares.length === 0),
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
                // The bottom padding is smaller because each payer tag adds an 8px margin below itself
                styles={{ body: { paddingTop: 16, paddingBottom: 8 } }}
                onClick={() => openModal(item.id)}
              >
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                  }}
                >
                  {item.name}
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <Text italic>
                    {t('common.text.quantity')}: {item.quantity}
                  </Text>
                </div>
                <Flex wrap>
                  {billItemMappings?.some((mapping) => {
                    if (mapping.itemId === item.id) {
                      return mapping.shares.length > 0;
                    }
                  }) ? (
                    <>
                      {billItemMappings?.map((mapping) => {
                        if (mapping.itemId === item.id) {
                          return getPayerShareList(mapping.shares).map(
                            (payer) => (
                              <PayerTag
                                style={{
                                  marginBottom: '8px',
                                  height: 30,
                                  fontSize: 16,
                                }}
                                key={payer.id}
                                color={getColorByName(payer.name)}
                              >
                                {payer.name}
                                {payer.weight > 1 && (
                                  <ShareWeight>×{payer.weight}</ShareWeight>
                                )}
                              </PayerTag>
                            ),
                          );
                        }
                      })}
                    </>
                  ) : (
                    <PayerTag style={{ borderStyle: 'dashed' }}>
                      {t('mapping.noPayer')}
                    </PayerTag>
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
              const totalAssigned = billItemMappings.reduce(
                (sum, mapping) => sum + mapping.shares.length,
                0,
              );
              trackEvent('bill_step_mapping_completed', {
                item_count: billItems.length,
                avg_payers_per_item:
                  billItemMappings.length > 0
                    ? Math.round(
                        (totalAssigned / billItemMappings.length) * 10,
                      ) / 10
                    : 0,
              });
              void navigate('/result', { replace: true });
            }}
            disabled={isDisableButton}
          >
            {t('mapping.button.submit')}
            <RightOutlined />
          </Button>
        </ButtonWrapper>
      }
    ></BillCard>
  );
};

export default BillItemMapping;
