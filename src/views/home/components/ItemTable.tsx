import { FileTextOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Popconfirm, Table } from 'antd';
import Column from 'antd/es/table/Column';
import { TableRowSelection } from 'antd/es/table/interface';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import { ActionButtonWrapper, ButtonWrapper, TableWrapper } from '@components';
import { RootState } from '@config';
import { ModalType } from '@enums';
import { IBillItem } from '@interfaces';
import { removeAllItems, removeItems } from '@slices';

import ItemListModal from './ItemListModal';

const ItemTable: React.FC = () => {
  const { t } = useTranslation();
  const billItems = useSelector((state: RootState) => state.bill.items);
  const dispatch = useDispatch();

  const [isShowCheckbox, setIsShowCheckbox] = useState<boolean>(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<ModalType>(ModalType.Create);
  const [selectedItemId, setSelectedItemId] = useState<string>();

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
    if (selectedRowKeys.length === 0) {
      dispatch(removeAllItems());
      setSelectedRowKeys([]);
    } else if (selectedRowKeys?.length > 0) {
      const idList = selectedRowKeys.map((key) => key.toString());
      dispatch(removeItems(idList));
      setSelectedRowKeys([]);
      toggleCheckbox();
    }
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
        <TableWrapper>
          <Table
            dataSource={billItems}
            pagination={false}
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
              title={t('home.itemList.table.quantity')}
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
                return price.toFixed(2);
              }}
            />
          </Table>
        </TableWrapper>
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
        <Button type="dashed" size="large" icon={<FileTextOutlined />} disabled>
          {t('home.itemList.button.addFromBill')}
        </Button>
      </ButtonWrapper>
      <ItemListModal
        mode={modalMode}
        isOpen={isModalVisible}
        itemId={selectedItemId}
        onClose={closeModal}
      />
    </>
  );
};

export default ItemTable;
