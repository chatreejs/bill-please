import { FileTextOutlined, PlusOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { App, Button, Flex, Popconfirm, Table, Tooltip } from 'antd';
import Column from 'antd/es/table/Column';
import { TableRowSelection } from 'antd/es/table/interface';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import styled, { keyframes } from 'styled-components';

import { ActionButtonWrapper, ButtonWrapper, TableCard } from '@components';
import { RootState } from '@config';
import { ModalType } from '@enums';
import { useTurnstile } from '@hooks';
import { IBillItem } from '@interfaces';
import { addItems, removeAllItems, removeItems } from '@slices';
import {
  checkReceiptApiHealth,
  currencyFormat,
  receiptItemToBillItem,
  scanReceipt,
  trackEvent,
} from '@utils';
import ItemListModal from './ItemListModal';
import ReceiptImportModal from './ReceiptImportModal';
import TurnstileVerifying from './TurnstileVerifying';

const revealButton = keyframes`
  from {
    opacity: 0;
    transform: translateY(-4px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: none;
  }
`;

const RevealWrapper = styled.div`
  display: flex;
  flex-direction: column;
  animation: ${revealButton} 0.35s ease-out;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const TurnstileContainer = styled.div`
  display: flex;
  justify-content: center;

  &:empty {
    display: none;
  }
`;

const SummaryContainer = styled.div`
  margin-bottom: 0.5rem;
  padding: 0 8px;
  font-size: 12px;
`;

const ItemTable: React.FC = () => {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const billItems = useSelector((state: RootState) => state.bill.items);
  const dispatch = useDispatch();

  const [isShowCheckbox, setIsShowCheckbox] = useState<boolean>(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<ModalType>(ModalType.Create);
  const [selectedItemId, setSelectedItemId] = useState<string>();

  const { isSuccess: isReceiptApiHealthy } = useQuery({
    queryKey: ['receiptApiHealth'],
    queryFn: checkReceiptApiHealth,
    refetchInterval: 60_000,
    retry: 1,
  });

  // Only offer "Add from bill" to visitors who pass Turnstile
  const {
    containerRef: turnstileRef,
    getToken: getTurnstileToken,
    status: turnstileStatus,
  } = useTurnstile('receipt_scan');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const scanRequestRef = useRef(0);
  const [isImportModalVisible, setIsImportModalVisible] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedItems, setScannedItems] = useState<IBillItem[]>([]);

  const [total, setTotal] = useState(0);
  const [service, setService] = useState(0);
  const [vat, setVat] = useState(0);

  useEffect(() => {
    let total = 0;
    let service = 0;
    let vat = 0;
    billItems.forEach((item) => {
      total += item.total ?? 0;
      service += item.service ?? 0;
      vat += item.vat ?? 0;
    });
    setTotal(total);
    setService(service);
    setVat(vat);
  }, [billItems]);

  const toggleCheckbox = () => {
    setIsShowCheckbox(!isShowCheckbox);
    setSelectedRowKeys([]);
  };

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection: TableRowSelection<IBillItem> = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const deleteItemList = () => {
    trackEvent('items_bulk_deleted', {
      count: selectedRowKeys.length || billItems.length,
      is_all:
        selectedRowKeys.length === 0 ||
        selectedRowKeys.length === billItems.length,
    });
    if (selectedRowKeys.length === 0) {
      dispatch(removeAllItems());
      setSelectedRowKeys([]);
    } else if (selectedRowKeys?.length > 0) {
      const idList = selectedRowKeys.map((key) => key.toString());
      dispatch(removeItems(idList));
      setSelectedRowKeys([]);
    }
    toggleCheckbox();
  };

  const openModal = (mode: ModalType, id?: string) => {
    setModalMode(mode);
    setIsModalVisible(true);
    setSelectedItemId(id);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedItemId(undefined);
  };

  const onReceiptSelected = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    // Reset so selecting the same file again still fires onChange
    event.target.value = '';
    if (!file) return;

    const requestId = ++scanRequestRef.current;
    trackEvent('receipt_scan_started');
    setScannedItems([]);
    setIsScanning(true);

    // Verify before opening the modal so a managed challenge, if Cloudflare
    // asks for one, shows under the buttons instead of behind the modal mask
    let turnstileToken: string | undefined;
    try {
      turnstileToken = await getTurnstileToken();
    } catch {
      if (requestId !== scanRequestRef.current) return;
      trackEvent('receipt_scan_failed', { reason: 'turnstile' });
      void message.error(t('home.itemList.importModal.verifyError'));
      setIsScanning(false);
      return;
    }
    if (requestId !== scanRequestRef.current) return;

    setIsImportModalVisible(true);
    try {
      const receiptItems = await scanReceipt(file, turnstileToken);
      // Ignore results from a scan the user already cancelled
      if (requestId !== scanRequestRef.current) return;
      trackEvent('receipt_scan_succeeded', { count: receiptItems.length });
      setScannedItems(receiptItems.map(receiptItemToBillItem));
    } catch {
      if (requestId !== scanRequestRef.current) return;
      trackEvent('receipt_scan_failed');
      void message.error(t('home.itemList.importModal.error'));
      setIsImportModalVisible(false);
    } finally {
      if (requestId === scanRequestRef.current) setIsScanning(false);
    }
  };

  const closeImportModal = () => {
    scanRequestRef.current++;
    setIsScanning(false);
    setIsImportModalVisible(false);
  };

  const importScannedItems = (items: IBillItem[]) => {
    trackEvent('receipt_items_imported', {
      count: items.length,
      scanned_count: scannedItems.length,
    });
    dispatch(addItems(items));
    closeImportModal();
  };

  return (
    <>
      {billItems.length > 0 && (
        <ActionButtonWrapper>
          {isShowCheckbox && (
            <Popconfirm
              title={t('home.itemList.popup.deleteTitle')}
              description={
                selectedRowKeys.length === 0
                  ? t('home.itemList.popup.deleteAll')
                  : t('home.itemList.popup.deleteSelected', {
                      count: selectedRowKeys.length,
                    })
              }
              onConfirm={deleteItemList}
              okText={t('common.button.ok')}
              cancelText={t('common.button.cancel')}
            >
              <Button danger>
                {selectedRowKeys.length > 0
                  ? t('home.itemList.button.deleteSelected')
                  : t('home.itemList.button.deleteAll')}
              </Button>
            </Popconfirm>
          )}
          <Button type="default" onClick={toggleCheckbox}>
            {isShowCheckbox
              ? t('common.button.cancel')
              : t('home.itemList.button.select')}
          </Button>
        </ActionButtonWrapper>
      )}
      {billItems.length > 0 && (
        <>
          <TableCard>
            <Table
              dataSource={billItems}
              pagination={false}
              size="small"
              rowSelection={isShowCheckbox ? rowSelection : undefined}
              rowKey={(record) => record.id}
              onRow={(record) => {
                return {
                  onClick: () => {
                    openModal(ModalType.Edit, record.id);
                  },
                };
              }}
            >
              <Column
                title={t('home.itemList.table.name')}
                key="name"
                dataIndex="name"
              />
              <Column
                title={t('common.text.quantity')}
                key="quantity"
                dataIndex="quantity"
                align="right"
              />
              <Column
                title={t('home.itemList.table.price')}
                key="total"
                dataIndex="total"
                align="right"
                render={(price: number) => {
                  return currencyFormat(price);
                }}
              />
            </Table>
          </TableCard>
          <SummaryContainer>
            <Flex vertical>
              {(service > 0 || vat > 0) && (
                <Flex justify="space-between">
                  <span>{t('common.text.subTotal')}:</span>
                  <span>{currencyFormat(total - service - vat)}</span>
                </Flex>
              )}
              {service > 0 && (
                <Flex justify="space-between">
                  <span>{t('common.text.service')}:</span>
                  <span>{currencyFormat(service)}</span>
                </Flex>
              )}
              {vat > 0 && (
                <Flex justify="space-between">
                  <span>{t('common.text.vat')}:</span>
                  <span>{currencyFormat(vat)}</span>
                </Flex>
              )}
              <Flex justify="space-between">
                <span>
                  <b>{t('common.text.total')}:</b>
                </span>
                <span>
                  <b>{currencyFormat(total)}</b>
                </span>
              </Flex>
            </Flex>
          </SummaryContainer>
        </>
      )}
      <ButtonWrapper>
        <Button
          type="dashed"
          size="large"
          icon={<PlusOutlined />}
          onClick={() => openModal(ModalType.Create)}
        >
          {t('home.itemList.button.add')}
        </Button>
        {(turnstileStatus === 'verifying' ||
          turnstileStatus === 'interactive') && (
          <TurnstileVerifying
            isInteractive={turnstileStatus === 'interactive'}
          />
        )}
        {turnstileStatus === 'passed' && (
          <RevealWrapper>
            <Tooltip
              title={
                isReceiptApiHealthy
                  ? undefined
                  : t('home.itemList.importModal.unavailable')
              }
            >
              <Button
                type="dashed"
                size="large"
                icon={<FileTextOutlined />}
                loading={isScanning}
                disabled={!isReceiptApiHealthy}
                onClick={() => fileInputRef.current?.click()}
                block
              >
                {t('home.itemList.button.addFromBill')}
              </Button>
            </Tooltip>
          </RevealWrapper>
        )}
        {/* image/* lets mobile browsers offer both camera and photo library */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(event) => void onReceiptSelected(event)}
        />
      </ButtonWrapper>
      <TurnstileContainer ref={turnstileRef} />
      <ItemListModal
        mode={modalMode}
        isOpen={isModalVisible}
        itemId={selectedItemId}
        onClose={closeModal}
      />
      <ReceiptImportModal
        isOpen={isImportModalVisible}
        isLoading={isScanning}
        items={scannedItems}
        onConfirm={importScannedItems}
        onClose={closeImportModal}
      />
    </>
  );
};

export default ItemTable;
