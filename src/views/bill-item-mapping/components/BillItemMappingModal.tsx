import { CheckOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Flex, InputNumber, Modal, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';

import { PayerTag } from '@components';
import { RootState } from '@config';
import { getCurrencySymbol } from '@enums';
import { IBillItemMapping, IBillItemShare, IPayer } from '@interfaces';
import { addBillItemMapping, editBillItemMapping } from '@slices';
import {
  currencyFormat,
  getBillItemTotal,
  getColorByName,
  getShareRatio,
  MAX_SHARE_WEIGHT,
  trackEvent,
} from '@utils';

import ItemPriceLine from './ItemPriceLine';

const { Text } = Typography;

const ShareSection = styled.div`
  margin-top: 8px;
  padding-top: 12px;
  border-top: 1px solid rgba(128, 128, 128, 0.2);
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ShareRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ShareName = styled.span`
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ShareInput = styled(InputNumber)`
  width: 52px;

  input {
    text-align: center !important;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }
`;

const ShareNote = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 13px;
`;

const ShareAmount = styled.span`
  min-width: 84px;
  text-align: right;
  font-variant-numeric: tabular-nums;
`;

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
  const mainCurrency = useSelector(
    (state: RootState) => state.app.mainCurrency,
  );
  const [shares, setShares] = useState<IBillItemShare[]>([]);
  const [payers, setPayers] = useState<IPayer[]>([]);

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

  const isSelected = (payerId: string) =>
    shares.some((share) => share.payerId === payerId);

  const handleTagClick = (payerId: string) => {
    setShares((prevShares) =>
      prevShares.some((share) => share.payerId === payerId)
        ? prevShares.filter((share) => share.payerId !== payerId)
        : [...prevShares, { payerId, weight: 1 }],
    );
  };

  /** Set a payer's weight, up to the max. Below 1 takes them off the item */
  const setWeight = (payerId: string, weight: number) => {
    setShares((prevShares) =>
      prevShares
        .map((share) =>
          share.payerId === payerId
            ? { ...share, weight: Math.min(weight, MAX_SHARE_WEIGHT) }
            : share,
        )
        .filter((share) => share.weight >= 1),
    );
  };

  const getWeight = (payerId: string) =>
    shares.find((share) => share.payerId === payerId)?.weight ?? 1;

  const handleSelectAll = () => {
    if (isAllSelected) {
      setShares([]);
    } else {
      trackEvent('mapping_select_all', { payer_count: payers.length });
      setShares(payers.map((payer) => ({ payerId: payer.id, weight: 1 })));
    }
  };

  const saveItemMapping = () => {
    const itemMapping = billItemMappings.find(
      (mapping) => mapping.itemId === itemId,
    );
    const maxWeight = Math.max(0, ...shares.map((share) => share.weight));
    if (maxWeight > 1) {
      trackEvent('mapping_uneven_split', {
        payer_count: shares.length,
        max_weight: maxWeight,
      });
    }
    if (itemMapping) {
      dispatch(editBillItemMapping({ itemId, shares }));
    } else {
      dispatch(addBillItemMapping({ itemId, shares }));
    }
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      const itemMapping = billItemMappings.find(
        (mapping) => mapping.itemId === itemId,
      );
      setShares(itemMapping?.shares ?? []);
    }

    return () => {
      setShares([]);
    };
  }, [isOpen, itemId]);

  useEffect(() => {
    setPayers(getAllPayer());
  }, []);

  const isAllSelected =
    payers.length > 0 && payers.every((payer) => isSelected(payer.id));

  const billItem = billItems.find((item) => item.id === itemId);
  const draftMapping: IBillItemMapping = { itemId, shares };
  // Rows follow the payer list order, not the order they were tapped
  const selectedPayers = payers.filter((payer) => isSelected(payer.id));
  const formatAmount = (amount: number) =>
    `${getCurrencySymbol(mainCurrency)} ${currencyFormat(amount)}`;

  // The note under the rows says whether the numbers add up to the item's
  // quantity. If they do, each person pays for their own count. If they
  // don't, the numbers work as a ratio.
  const quantity = billItem?.quantity ?? 0;
  const totalWeight = shares.reduce((sum, share) => sum + share.weight, 0);
  const isEven = shares.every((share) => share.weight === shares[0]?.weight);
  const isTotalMatch = totalWeight === quantity;

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
        {billItem && <ItemPriceLine item={billItem} />}
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
              isSelected(payer.id) ? getColorByName(payer.name) : 'default'
            }
            bordered={isSelected(payer.id)}
            onClick={() => handleTagClick(payer.id)}
            style={{
              cursor: 'pointer',
            }}
          >
            {isSelected(payer.id) ? <CheckOutlined /> : <PlusOutlined />}
            <span>{payer.name}</span>
          </PayerTag>
        ))}
      </Flex>
      {selectedPayers.length > 1 && billItem && (
        <ShareSection>
          <Text type="secondary">{t('mapping.modal.shareHint')}</Text>
          {selectedPayers.map((payer) => {
            const weight = getWeight(payer.id);
            const amount =
              getBillItemTotal(billItem) *
              getShareRatio(draftMapping, payer.id);
            return (
              <ShareRow key={payer.id}>
                <ShareName>{payer.name}</ShareName>
                <Button
                  size="small"
                  shape="circle"
                  icon={<MinusOutlined />}
                  aria-label={t('mapping.modal.decreaseShare', {
                    name: payer.name,
                  })}
                  onClick={() => setWeight(payer.id, weight - 1)}
                />
                <ShareInput
                  size="small"
                  controls={false}
                  inputMode="numeric"
                  min={1}
                  max={MAX_SHARE_WEIGHT}
                  precision={0}
                  value={weight}
                  aria-label={t('mapping.modal.shareOf', { name: payer.name })}
                  onFocus={(e) => e.target.select()}
                  onChange={(value) => {
                    // Clearing the box while typing keeps the last number
                    if (typeof value === 'number' && value >= 1) {
                      setWeight(payer.id, value);
                    }
                  }}
                />
                <Button
                  size="small"
                  shape="circle"
                  icon={<PlusOutlined />}
                  aria-label={t('mapping.modal.increaseShare', {
                    name: payer.name,
                  })}
                  disabled={weight >= MAX_SHARE_WEIGHT}
                  onClick={() => setWeight(payer.id, weight + 1)}
                />
                <ShareAmount>{formatAmount(amount)}</ShareAmount>
              </ShareRow>
            );
          })}
          <ShareNote>
            <Text type="secondary">
              {t('mapping.modal.shareRemark', { quantity })}
            </Text>
            {isEven ? (
              <Text type="success">{t('mapping.modal.splitEvenly')}</Text>
            ) : (
              <Text type={isTotalMatch ? 'success' : 'warning'}>
                {t(
                  isTotalMatch
                    ? 'mapping.modal.totalMatch'
                    : 'mapping.modal.totalOff',
                  { total: totalWeight, quantity },
                )}
              </Text>
            )}
          </ShareNote>
        </ShareSection>
      )}
    </Modal>
  );
};

export default BillItemMappingModal;
