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
  const defaultVatPercentage = useSelector(
    (state: RootState) => state.app.vatPercentage,
  );
  const billItems = useSelector((state: RootState) => state.bill.items);
  const dispatch = useDispatch();
  const [form] = Form.useForm<IBillItemForm>();
  const [isVat, setIsVat] = useState(false);
  const [isService, setIsService] = useState(false);
  const [approxVat, setApproxVat] = useState(0);
  const [approxService, setApproxService] = useState(0);

  const initialValues: IBillItemForm = {
    name: '',
    quantity: undefined,
    price: undefined,
    isVat: false,
    isService: false,
    vatPercentage: defaultVatPercentage,
    servicePercentage: 10,
  };

  const calculateService = (
    price: number,
    quantity: number,
    percentage: number,
  ) => {
    if (!percentage) return 0;
    return price * quantity * (percentage / 100);
  };

  const calculateVat = (
    price: number,
    quantity: number,
    servicePercentage: number,
    vatPercentage: number,
  ) => {
    const service = calculateService(price, quantity, servicePercentage);
    const vat = (price * quantity + service) * (vatPercentage / 100);
    return vat;
  };

  const onFormValuesChange = (
    changedValues: IBillItemForm,
    values: IBillItemForm,
  ) => {
    if ('isVat' in changedValues) {
      const isVat = changedValues.isVat!;
      setIsVat(isVat);
      form.setFieldsValue({ vatPercentage: isVat ? defaultVatPercentage : 0 });
    }
    if ('isService' in changedValues) {
      const isService = changedValues.isService!;
      setIsService(isService);
      form.setFieldsValue({ servicePercentage: isService ? 10 : 0 });
    }
    const vatPercentage = form.getFieldValue('vatPercentage') as number;
    const servicePercentage = form.getFieldValue('servicePercentage') as number;
    const approxVat = calculateVat(
      values.price!,
      values.quantity!,
      servicePercentage,
      vatPercentage,
    );
    const approxService =
      values.price! * values.quantity! * (servicePercentage / 100);
    setApproxVat(isNaN(approxVat) ? 0 : approxVat);
    setApproxService(isNaN(approxService) ? 0 : approxService);
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
              vat: formData.isVat
                ? calculateVat(
                    formData.price!,
                    formData.quantity!,
                    formData.servicePercentage!,
                    formData.vatPercentage!,
                  )
                : 0,
              vatPercentage: formData.isVat ? formData.vatPercentage! : 0,
              service: formData.isService
                ? calculateService(
                    formData.price!,
                    formData.quantity!,
                    formData.servicePercentage!,
                  )
                : 0,
              servicePercentage: formData.isService
                ? formData.servicePercentage!
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
              vat: formData.isVat
                ? calculateVat(
                    formData.price!,
                    formData.quantity!,
                    formData.servicePercentage!,
                    formData.vatPercentage!,
                  )
                : 0,
              vatPercentage: formData.isVat ? formData.vatPercentage! : 0,
              service: formData.isService
                ? calculateService(
                    formData.price!,
                    formData.quantity!,
                    formData.servicePercentage!,
                  )
                : 0,
              servicePercentage: formData.isService
                ? formData.servicePercentage!
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
          isService: item.servicePercentage > 0,
          vatPercentage: item.vatPercentage,
          servicePercentage: item.servicePercentage,
        });
        setIsService(item.servicePercentage > 0);
        setIsVat(item.vatPercentage > 0);
        setApproxService(
          calculateService(item.price, item.quantity, item.servicePercentage),
        );
        setApproxVat(
          calculateVat(
            item.price,
            item.quantity,
            item.servicePercentage,
            item.vatPercentage,
          ),
        );
      } else {
        form.setFieldsValue(initialValues);
        setIsVat(false);
        setIsService(false);
        setApproxVat(defaultVatPercentage);
        setApproxService(10);
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
          <Flex gap={6}>
            <Form.Item
              name="isService"
              valuePropName="checked"
              style={{ marginBottom: 6, maxWidth: '50vw' }}
            >
              <Checkbox>{t('home.itemList.modal.form.isService')} (%)</Checkbox>
            </Form.Item>
            {isService && (
              <>
                <Form.Item name="servicePercentage" style={{ marginBottom: 6 }}>
                  <InputNumber style={{ width: '3.5rem' }} />
                </Form.Item>
                <Form.Item style={{ marginBottom: 6 }}>
                  <Text type="secondary">
                    ≈ {currencyFormat(approxService)}
                  </Text>
                </Form.Item>
              </>
            )}
          </Flex>
          <Flex gap={6}>
            <Form.Item
              name="isVat"
              valuePropName="checked"
              style={{ maxWidth: '50vw' }}
            >
              <Checkbox>{t('home.itemList.modal.form.isVat')} (%)</Checkbox>
            </Form.Item>
            {isVat && (
              <>
                <Form.Item name="vatPercentage">
                  <InputNumber style={{ width: '3.5rem' }} />
                </Form.Item>
                <Form.Item>
                  <Text type="secondary">≈ {currencyFormat(approxVat)}</Text>
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
