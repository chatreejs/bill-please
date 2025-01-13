import { DeleteOutlined } from '@ant-design/icons';
import {
  Button,
  Checkbox,
  Flex,
  Form,
  Input,
  InputNumber,
  Typography,
} from 'antd';
import Modal from 'antd/es/modal/Modal';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { uuidv7 } from 'uuidv7';

import { RootState } from '@config';
import { ModalType } from '@enums';
import { IBillItemForm } from '@interfaces';
import { addItem, editItem, removeItem } from '@slices';
import { currencyFormat } from '@utils';

const { Text } = Typography;

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
  const vatPercentage = useSelector(
    (state: RootState) => state.app.vatPercentage,
  );
  const billItems = useSelector((state: RootState) => state.bill.items);
  const dispatch = useDispatch();
  const [form] = Form.useForm<IBillItemForm>();
  const [isVat, setIsVat] = useState(false);
  const [approxVat, setApproxVat] = useState(0);

  const initialValues: IBillItemForm = {
    name: '',
    quantity: undefined,
    price: undefined,
    isVat: false,
    vatPercentage: vatPercentage,
  };

  const calculateApproxVat = (
    price: number,
    quantity: number,
    vatPercentage: number,
  ) => {
    return price * quantity * (vatPercentage / 100);
  };

  const onFormValuesChange = (
    changedValues: IBillItemForm,
    values: IBillItemForm,
  ) => {
    if ('isVat' in changedValues) {
      const isVat = changedValues.isVat!;
      setIsVat(isVat);
    }
    const vatPercentage = form.getFieldValue('vatPercentage') as number;
    const approxVat = calculateApproxVat(
      values.price!,
      values.quantity!,
      vatPercentage,
    );
    setApproxVat(isNaN(approxVat) ? 0 : approxVat);
  };

  const saveItem = () => {
    form
      .validateFields()
      .then(() => {
        const formData = form.getFieldsValue(true) as IBillItemForm;
        if (mode === ModalType.Create) {
          dispatch(
            addItem({
              id: uuidv7(),
              name: formData.name,
              quantity: formData.quantity!,
              price: formData.price!,
              vatPercentage: formData.isVat ? formData.vatPercentage! : 0,
              vat: formData.isVat
                ? formData.price! *
                  formData.quantity! *
                  (formData.vatPercentage! / 100)
                : 0,
            }),
          );
        } else {
          dispatch(
            editItem({
              id: itemId!,
              name: formData.name,
              quantity: formData.quantity!,
              price: formData.price!,
              vatPercentage: formData.isVat ? formData.vatPercentage! : 0,
              vat: formData.isVat
                ? formData.price! *
                  formData.quantity! *
                  (formData.vatPercentage! / 100)
                : 0,
            }),
          );
        }
        onClose();
      })
      .catch(() => {
        return;
      });
  };

  const deleteItem = () => {
    dispatch(removeItem(itemId!));
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      if (mode === ModalType.Edit && itemId) {
        const item = billItems.find((item) => item.id === itemId)!;
        form.setFieldsValue({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          isVat: item.vatPercentage > 0,
          vatPercentage: item.vatPercentage,
        });
        setIsVat(item.vatPercentage > 0);
        setApproxVat(
          calculateApproxVat(item.price, item.quantity, item.vatPercentage),
        );
      } else {
        form.setFieldsValue(initialValues);
        setIsVat(false);
        setApproxVat(0);
      }
    }

    return () => {
      form.resetFields();
      setIsVat(false);
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
        <Form
          name="itemListForm"
          form={form}
          layout="vertical"
          size="large"
          onValuesChange={onFormValuesChange}
        >
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
            name="price"
            label={`${t('home.itemList.modal.form.price')} (${t('home.itemList.modal.form.priceTip')})`}
            rules={[
              {
                required: true,
                message: t('home.itemList.modal.form.priceError'),
              },
            ]}
          >
            <InputNumber style={{ width: '100%' }} />
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
          <Flex>
            <Form.Item name="isVat" valuePropName="checked">
              <Checkbox>{t('home.itemList.modal.form.isVat')}</Checkbox>
            </Form.Item>
            {isVat && (
              <>
                <Form.Item name="vatPercentage">
                  <InputNumber suffix="%" />
                </Form.Item>
                <Form.Item>
                  <Text type="secondary" style={{ marginLeft: 6 }}>
                    ≈ {currencyFormat(approxVat)}
                  </Text>
                </Form.Item>
              </>
            )}
          </Flex>
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
