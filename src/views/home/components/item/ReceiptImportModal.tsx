import { Empty, Flex, Table, Typography } from 'antd';
import Modal from 'antd/es/modal/Modal';
import Column from 'antd/es/table/Column';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { TableCard } from '@components';
import { IBillItem, IReceiptScanProgress } from '@interfaces';
import { currencyFormat } from '@utils';
import ReceiptScanProgress from './ReceiptScanProgress';

const { Text } = Typography;

const SummaryContainer = styled(Flex)`
  margin-top: 0.5rem;
  padding: 0 8px;
`;

interface Props {
  isOpen: boolean;
  isLoading: boolean;
  /** A new value for each scan, which remounts the progress and resets its timer */
  scanId: number;
  progress?: IReceiptScanProgress;
  items: IBillItem[];
  onConfirm: (items: IBillItem[]) => void;
  onClose: () => void;
}

const ReceiptImportModal: React.FC<Props> = ({
  isOpen,
  isLoading,
  scanId,
  progress,
  items,
  onConfirm,
  onClose,
}) => {
  const { t } = useTranslation();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // Select every scanned item by default
  useEffect(() => {
    setSelectedRowKeys(items.map((item) => item.id));
  }, [items]);

  const selectedItems = items.filter((item) =>
    selectedRowKeys.includes(item.id),
  );
  const selectedTotal = selectedItems.reduce(
    (acc, item) => acc + (item.total ?? 0),
    0,
  );

  return (
    <Modal
      title={t('home.itemList.importModal.title')}
      open={isOpen}
      onOk={() => onConfirm(selectedItems)}
      onCancel={onClose}
      okText={t('home.itemList.importModal.confirm', {
        count: selectedItems.length,
      })}
      cancelText={t('common.button.cancel')}
      // Hide the add button while the scan runs
      okButtonProps={{
        disabled: selectedItems.length === 0,
        style: isLoading ? { display: 'none' } : undefined,
      }}
      maskClosable={!isLoading}
    >
      {isLoading ? (
        // A closed antd Modal keeps its old children mounted. Without the key,
        // the next scan's timer keeps counting from the cancelled one
        <ReceiptScanProgress key={scanId} progress={progress} />
      ) : items.length === 0 ? (
        <Empty description={t('home.itemList.importModal.empty')} />
      ) : (
        <>
          <Text type="secondary">
            {t('home.itemList.importModal.description')}
          </Text>
          <TableCard>
            <Table
              dataSource={items}
              pagination={false}
              size="small"
              rowKey={(record) => record.id}
              rowSelection={{
                selectedRowKeys,
                onChange: setSelectedRowKeys,
              }}
            >
              <Column
                title={t('home.itemList.table.name')}
                key="name"
                render={(_, item: IBillItem) => (
                  <Flex vertical>
                    <span>{item.name}</span>
                    {(item.servicePercentage > 0 || item.vatPercentage > 0) && (
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {[
                          item.servicePercentage > 0 &&
                            `${t('common.text.service')} ${item.servicePercentage}%`,
                          item.vatPercentage > 0 &&
                            `${t('common.text.vat')} ${item.vatPercentage}%`,
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                      </Text>
                    )}
                  </Flex>
                )}
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
                render={(price: number) => currencyFormat(price)}
              />
            </Table>
          </TableCard>
          <SummaryContainer justify="space-between">
            <b>{t('common.text.total')}:</b>
            <b>{currencyFormat(selectedTotal)}</b>
          </SummaryContainer>
        </>
      )}
    </Modal>
  );
};

export default ReceiptImportModal;
