import { PlusOutlined } from '@ant-design/icons';
import { Button, Popconfirm, Table, Tag } from 'antd';
import Column from 'antd/es/table/Column';
import { TableRowSelection } from 'antd/es/table/interface';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import { ActionButtonWrapper, ButtonWrapper, TableWrapper } from '@components';
import { RootState } from '@config';
import { ModalType } from '@enums';
import { IPayer } from '@interfaces';
import { removeAllPayers, removePayers } from '@slices';
import PayerListModal from './PayerListModal';

const PayerTable: React.FC = () => {
  const { t } = useTranslation();
  const billPayers = useSelector((state: RootState) => state.bill.payers);
  const dispatch = useDispatch();

  const [isShowCheckbox, setIsShowCheckbox] = useState<boolean>(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<ModalType>(ModalType.Create);
  const [selectedPayerId, setSelectedPayerId] = useState<string>();

  const toggleCheckbox = () => {
    setIsShowCheckbox(!isShowCheckbox);
    setSelectedRowKeys([]);
  };

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection: TableRowSelection<IPayer> = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const deletePayerList = () => {
    if (selectedRowKeys.length === 0) {
      dispatch(removeAllPayers());
      setSelectedRowKeys([]);
    } else if (selectedRowKeys?.length > 0) {
      const idList = selectedRowKeys.map((key) => key.toString());
      dispatch(removePayers(idList));
      setSelectedRowKeys([]);
      toggleCheckbox();
    }
  };

  const openModal = (mode: ModalType, id?: string) => {
    setModalMode(mode);
    setIsModalVisible(true);
    setSelectedPayerId(id);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedPayerId(undefined);
  };

  return (
    <>
      {billPayers.length > 0 && (
        <ActionButtonWrapper>
          {isShowCheckbox && (
            <Popconfirm
              title={t('home.payerList.popup.deleteTitle')}
              description={
                selectedRowKeys.length === 0
                  ? t('home.payerList.popup.deleteAll')
                  : t('home.payerList.popup.deleteSelected', {
                      count: selectedRowKeys.length,
                    })
              }
              onConfirm={deletePayerList}
              okText={t('common.button.ok')}
              cancelText={t('common.button.cancel')}
            >
              <Button danger>
                {selectedRowKeys.length > 0
                  ? t('home.payerList.button.deleteSelected')
                  : t('home.payerList.button.deleteAll')}
              </Button>
            </Popconfirm>
          )}
          <Button type="default" onClick={toggleCheckbox}>
            {isShowCheckbox
              ? t('common.button.cancel')
              : t('home.payerList.button.select')}
          </Button>
        </ActionButtonWrapper>
      )}
      {billPayers.length > 0 && (
        <TableWrapper>
          <Table
            dataSource={billPayers}
            pagination={false}
            expandable={{
              expandedRowRender: (record) => {
                return (
                  <div>
                    {record.friend?.map((friend) => (
                      <Tag key={friend.id}>{friend.name}</Tag>
                    ))}
                  </div>
                );
              },
              rowExpandable: (record) =>
                record.friend ? record.friend.length > 0 : false,
            }}
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
              title={t('home.payerList.table.name')}
              key="name"
              dataIndex="name"
              render={(text, record: IPayer) => {
                if (record.friend?.length === 0) {
                  return <span>{text}</span>;
                } else {
                  return (
                    <span>
                      {text} {t('home.payerList.table.andFriend')}
                    </span>
                  );
                }
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
          {t('home.payerList.button.add')}
        </Button>
      </ButtonWrapper>
      <PayerListModal
        mode={modalMode}
        isOpen={isModalVisible}
        onClose={closeModal}
        payerId={selectedPayerId}
      />
    </>
  );
};

export default PayerTable;
