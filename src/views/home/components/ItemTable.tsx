import { FileTextOutlined, PlusOutlined } from '@ant-design/icons';
import { IBillItem, IRecord } from '@interfaces';
import { Button, Popconfirm, Table } from 'antd';
import Column from 'antd/es/table/Column';
import { TableRowSelection } from 'antd/es/table/interface';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActionButton, ButtonWrapper, TableWrapper } from '../Home';

const ItemTable: React.FC = () => {
  const { t } = useTranslation();
  const [isShowCheckbox, setIsShowCheckbox] = useState<boolean>(false);
  const [selectedRowKeys, setSelectedRowKeys] =
    useState<React.Key[]>(undefined);
  const [billItems, setBillItems] = useState<(IBillItem & IRecord)[]>([
    {
      id: '1',
      key: '1',
      name: 'Item 1',
      price: 1000,
      quantity: 2,
    },
    {
      id: '2',
      key: '2',
      name: 'Item 2',
      price: 2000,
      quantity: 1,
    },
  ]);

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
    if (selectedRowKeys?.length > 0) {
      console.log('Delete selected items: ', selectedRowKeys);
    }
  };

  return (
    <>
      {billItems.length > -1 && (
        <ActionButton>
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
        </ActionButton>
      )}
      {billItems.length > 0 && (
        <TableWrapper>
          <Table
            dataSource={billItems}
            pagination={false}
            rowSelection={isShowCheckbox ? rowSelection : undefined}
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
              key="price"
              dataIndex="price"
              align="right"
              render={(price: number) => {
                return price.toFixed(2);
              }}
            />
          </Table>
        </TableWrapper>
      )}
      <ButtonWrapper>
        <Button type="dashed" size="large" icon={<PlusOutlined />}>
          {t('home.itemList.button.add')}
        </Button>
        <Button type="dashed" size="large" icon={<FileTextOutlined />} disabled>
          {t('home.itemList.button.addFromBill')}
        </Button>
      </ButtonWrapper>
    </>
  );
};

export default ItemTable;
