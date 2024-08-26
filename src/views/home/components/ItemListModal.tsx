import { Button, Form, Input, InputNumber } from 'antd';
import Modal from 'antd/es/modal/Modal';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { uuidv7 } from 'uuidv7';

import { DeleteOutlined } from '@ant-design/icons';
import { RootState } from '@config';
import { ModalType } from '@enums';
import { IBillItemForm } from '@interfaces';
import { addItem, editItem, removeItem } from '@slices';

const FormWrapper = styled.div`
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
`;

interface Props {
  mode: ModalType;
  isOpen: boolean;
  itemId?: string;
  onClose: () => void;
}

const ItemListModal: React.FC<Props> = ({ mode, isOpen, itemId, onClose }) => {
  const { t } = useTranslation();
  const billItems = useSelector((state: RootState) => state.bill.items);
  const dispatch = useDispatch();
  const [form] = Form.useForm<IBillItemForm>();

  const initialValues: IBillItemForm = {
    name: '',
    quantity: undefined,
    price: undefined,
  };

  const saveItem = () => {
    form
      .validateFields()
      .then(() => {
        const formData = form.getFieldsValue(true) as IBillItemForm;
        if (mode === ModalType.Create) {
          dispatch(addItem({ ...formData, id: uuidv7() }));
        } else {
          dispatch(editItem({ ...formData, id: itemId }));
        }
        onClose();
      })
      .catch(() => {
        return;
      });
  };

  const deleteItem = () => {
    dispatch(removeItem(itemId));
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      if (mode === ModalType.Edit && itemId) {
        const item = billItems.find((item) => item.id === itemId);
        form.setFieldsValue(item);
      } else {
        form.setFieldsValue(initialValues);
      }
    }

    return () => {
      form.resetFields();
    };
  }, [isOpen, mode, itemId]);

  return (
    <Modal
      title={
        mode === ModalType.Create
          ? t('home.itemList.modal.title.add')
          : t('home.itemList.modal.title.edit')
      }
      open={isOpen}
      onOk={saveItem}
      onCancel={onClose}
      okText={t('common.button.save')}
      cancelText={t('common.button.cancel')}
      forceRender
    >
      <FormWrapper>
        <Form name="itemListForm" form={form} layout="vertical" size="large">
          <Form.Item
            name="name"
            label={t('home.itemList.modal.form.name')}
            rules={[
              {
                required: true,
                message: t('home.itemList.modal.form.nameError'),
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="quantity"
            label={t('home.itemList.modal.form.quantity')}
            rules={[
              {
                required: true,
                message: t('home.itemList.modal.form.quantityError'),
              },
            ]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="price"
            label={t('home.itemList.modal.form.price')}
            rules={[
              {
                required: true,
                message: t('home.itemList.modal.form.priceError'),
              },
            ]}
          >
            <InputNumber min={0.01} step="0.01" style={{ width: '100%' }} />
          </Form.Item>
        </Form>
        {mode === ModalType.Edit && (
          <Button
            type="primary"
            size="middle"
            icon={<DeleteOutlined />}
            onClick={() => deleteItem()}
            danger
          >
            {t('home.itemList.modal.form.delete')}
          </Button>
        )}
      </FormWrapper>
    </Modal>
  );
};

export default ItemListModal;
