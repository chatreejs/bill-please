import { CheckOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Flex, Modal, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import { PayerTag } from '@components';
import { RootState } from '@config';
import { IPayer } from '@interfaces';
import { addBillItemMapping, editBillItemMapping } from '@slices';
import { getColorByName } from '@utils';

const { Text } = Typography;

interface Props {
  isOpen: boolean;
  itemId: string;
  onClose: () => void;
}

const BillItemMappingModal: React.FC<Props> = ({ isOpen, itemId, onClose }) => {
  const { t } = useTranslation();
  const billItems = useSelector((state: RootState) => state.bill.items);
  const billPayers = useSelector((state: RootState) => state.bill.payers);
  const billItemMappings = useSelector(
    (state: RootState) => state.bill.itemMapping,
  );
  const dispatch = useDispatch();
  const [selectedPayerIds, setSelectedPayerIds] = React.useState<string[]>([]);
  const [payers, setPayers] = useState<IPayer[]>([]);
  const [isAllSelected, setIsAllSelected] = useState<boolean>(false);

  const getAllPayer = () => {
    const allPayers = [...billPayers];
    billPayers.forEach((payer) => {
      if (payer.friend) {
        payer.friend.forEach((friend) => {
          allPayers.push({
            id: friend.id,
            name: friend.name,
          });
        });
      }
    });
    return allPayers;
  };

  const handleTagClick = (payerId: string) => {
    setSelectedPayerIds((prevSelectedPayerIds) => {
      if (prevSelectedPayerIds.includes(payerId)) {
        return prevSelectedPayerIds.filter((id) => id !== payerId);
      } else {
        return [...prevSelectedPayerIds, payerId];
      }
    });
  };

  const handleSelectAll = () => {
    const allPayerIds = payers.map((payer) => payer.id);
    if (selectedPayerIds.length === allPayerIds.length) {
      setSelectedPayerIds([]);
    } else {
      setSelectedPayerIds(allPayerIds);
    }
  };

  const saveItemMapping = () => {
    const itemMapping = billItemMappings.find(
      (mapping) => mapping.itemId === itemId,
    );
    if (itemMapping) {
      dispatch(
        editBillItemMapping({
          itemId,
          payerId: selectedPayerIds,
        }),
      );
    } else {
      dispatch(
        addBillItemMapping({
          itemId,
          payerId: selectedPayerIds,
        }),
      );
    }
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      const itemMapping = billItemMappings.find(
        (mapping) => mapping.itemId === itemId,
      );
      if (itemMapping) {
        setSelectedPayerIds(itemMapping.payerId);
      } else {
        setSelectedPayerIds([]);
      }
    }

    return () => {
      setSelectedPayerIds([]);
    };
  }, [isOpen, itemId]);

  useEffect(() => {
    setPayers(getAllPayer());
  }, []);

  useEffect(() => {
    const allPayerIds = payers.map((payer) => payer.id);
    const isAllSelected = selectedPayerIds.length === allPayerIds.length;
    setIsAllSelected(isAllSelected);
  }, [selectedPayerIds, payers]);

  return (
    <Modal
      title={t('mapping.modal.title', {
        itemName: billItems.find((item) => item.id === itemId)?.name,
      })}
      open={isOpen}
      onOk={saveItemMapping}
      onCancel={onClose}
      okText={t('common.button.save')}
      cancelText={t('common.button.cancel')}
    >
      <div style={{ marginBottom: '12px' }}>
        <Text italic>
          {t('common.text.quantity')}:{' '}
          {billItems.find((item) => item.id === itemId)?.quantity}
        </Text>
      </div>
      <Button onClick={handleSelectAll} style={{ marginBottom: '16px' }}>
        {isAllSelected
          ? t('mapping.modal.deselectAll')
          : t('mapping.modal.selectAll')}
      </Button>
      <Flex wrap>
        {payers.map((payer) => (
          <PayerTag
            key={payer.id}
            color={
              selectedPayerIds.includes(payer.id)
                ? getColorByName(payer.name)
                : 'default'
            }
            bordered={selectedPayerIds.includes(payer.id)}
            onClick={() => handleTagClick(payer.id)}
            style={{
              cursor: 'pointer',
            }}
          >
            {selectedPayerIds.includes(payer.id) ? (
              <CheckOutlined />
            ) : (
              <PlusOutlined />
            )}
            <span>{payer.name}</span>
          </PayerTag>
        ))}
      </Flex>
    </Modal>
  );
};

export default BillItemMappingModal;
