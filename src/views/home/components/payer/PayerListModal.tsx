import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, Checkbox, Flex, Form, Input } from 'antd';
import Modal from 'antd/es/modal/Modal';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { uuidv7 } from 'uuidv7';

import { RootState } from '@config';
import { ModalType } from '@enums';
import { IPayerForm } from '@interfaces';
import { addPayer, editPayer, removePayer } from '@slices';

const FormWrapper = styled.div`
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
`;

interface Props {
  mode: ModalType;
  isOpen: boolean;
  payerId?: string;
  onClose: () => void;
}

const PayerListModal: React.FC<Props> = ({
  mode,
  isOpen,
  payerId,
  onClose,
}) => {
  const { t } = useTranslation();
  const billPayers = useSelector((state: RootState) => state.bill.payers);
  const dispatch = useDispatch();
  const [form] = Form.useForm<IPayerForm>();
  const [isHasFriend, setIsHasFriend] = React.useState<boolean>(false);

  const initialValues: IPayerForm = {
    name: '',
    friend: [],
  };

  const savePayer = () => {
    form
      .validateFields()
      .then(() => {
        const formData = form.getFieldsValue(true) as IPayerForm;
        if (!isHasFriend) {
          formData.friend = [];
        } else {
          formData.friend = formData.friend.map((item) => ({
            id: item.id || uuidv7(),
            name: item.name,
          }));
        }
        if (mode === ModalType.Create) {
          dispatch(addPayer({ ...formData, id: uuidv7() }));
        } else {
          dispatch(editPayer({ ...formData, id: payerId! }));
        }
        onClose();
      })
      .catch(() => {
        return;
      });
  };

  const deletePayer = () => {
    dispatch(removePayer(payerId!));
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      if (mode === ModalType.Edit && payerId) {
        const payer = billPayers.find((item) => item.id === payerId)!;
        form.setFieldsValue(payer);
        if (payer.friend && payer.friend.length > 0) {
          setIsHasFriend(true);
        }
      } else {
        form.setFieldsValue(initialValues);
      }
    }

    return () => {
      form.resetFields();
      setIsHasFriend(false);
    };
  }, [isOpen, mode, payerId]);

  return (
    <Modal
      title={
        mode === ModalType.Create
          ? t('home.payerList.modal.title.add')
          : t('home.payerList.modal.title.edit')
      }
      open={isOpen}
      onOk={() => savePayer()}
      onCancel={() => onClose()}
      okText={t('common.button.save')}
      cancelText={t('common.button.cancel')}
    >
      <FormWrapper>
        <Form name="payerListForm" form={form} layout="vertical" size="middle">
          <Form.Item
            name="name"
            label={t('home.payerList.modal.form.name')}
            rules={[
              {
                required: true,
                message: t('home.payerList.modal.form.nameError'),
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Checkbox
            checked={isHasFriend}
            onChange={() => setIsHasFriend(!isHasFriend)}
          >
            {t('home.payerList.modal.form.hasChildren')}
          </Checkbox>
          {isHasFriend && (
            <Card style={{ marginTop: '1rem' }}>
              <Form.List name="friend">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <Flex key={key} justify="space-between" gap={'6px'}>
                        <Form.Item
                          {...restField}
                          key={key}
                          name={[name, 'name']}
                          rules={[
                            {
                              required: true,
                              message: t(
                                'home.payerList.modal.form.childrenNameError',
                              ),
                            },
                          ]}
                          style={{ width: '100%' }}
                        >
                          <Input
                            size="middle"
                            placeholder={t(
                              'home.payerList.modal.form.childrenName',
                            )}
                          />
                        </Form.Item>
                        <Button
                          type="default"
                          size="middle"
                          onClick={() => remove(name)}
                          icon={<DeleteOutlined />}
                          danger
                        />
                      </Flex>
                    ))}
                    <Form.Item>
                      <Button
                        type="dashed"
                        onClick={() => add()}
                        block
                        icon={<PlusOutlined />}
                      >
                        {t('home.payerList.modal.form.addChildren')}
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>
            </Card>
          )}
        </Form>
        {mode === ModalType.Edit && (
          <Button
            type="primary"
            size="middle"
            icon={<DeleteOutlined />}
            onClick={() => deletePayer()}
            danger
            style={{ marginTop: '1rem' }}
          >
            {t('home.payerList.modal.form.delete')}
          </Button>
        )}
      </FormWrapper>
    </Modal>
  );
};

export default PayerListModal;
