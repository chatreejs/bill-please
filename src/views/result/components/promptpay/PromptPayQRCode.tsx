import { QrcodeOutlined } from '@ant-design/icons';
import { Button, Flex, Form, Input, QRCode } from 'antd';
import generatePayload from 'promptpay-qr';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useBrowserStorage } from '@hooks';
import PromptPayLogo from '../../../../assets/images/PromptPay-logo.png';
import ThaiQRPayment from '../../../../assets/images/thai-qr-payment.png';

interface PromptPayForm {
  promptPayId: string;
}

const PromptPayQRCode: React.FC = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm<PromptPayForm>();
  const [promptPayId, setPromptPayId] = useBrowserStorage<string>(
    'promptPayId',
    '',
    'local',
  );
  const [qrCodePayload, setQrCodePayload] = useState<string>();
  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const onSubmit = () => {
    form
      .validateFields()
      .then(() => {
        const formData = form.getFieldsValue(true) as PromptPayForm;
        const promptPayPayload = generatePayload(formData.promptPayId, {});
        setPromptPayId(formData.promptPayId);
        setQrCodePayload(promptPayPayload);
        setIsSubmit(true);
      })
      .catch(() => {
        return;
      });
  };

  useEffect(() => {
    if (promptPayId) {
      form.setFieldsValue({ promptPayId });
      onSubmit();
    }
  }, [form]);

  return (
    <>
      {!isSubmit && (
        <Flex vertical justify="center" align="center">
          <div>{t('result.payment.promptPay.inputLabel')}</div>
          <Form form={form} size="small">
            <Flex gap={6}>
              <Form.Item
                name="promptPayId"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Button
                type="primary"
                onClick={onSubmit}
                icon={<QrcodeOutlined />}
              ></Button>
            </Flex>
          </Form>
        </Flex>
      )}
      {isSubmit && (
        <Flex vertical justify="center" align="center" gap={8}>
          <div>{t('result.payment.qr.scanToPay')}</div>
          <img
            src={ThaiQRPayment}
            alt="ThaiQRPayment"
            style={{ width: '160px' }}
          />
          <img
            src={PromptPayLogo}
            alt="PromptPayLogo"
            style={{ width: '64px' }}
          />
          <QRCode
            type={'svg'}
            bordered={false}
            value={qrCodePayload ?? '-'}
            size={160}
          />
          <span
            style={{ fontSize: 12, textDecoration: 'underline' }}
            onClick={() => setIsSubmit(false)}
          >
            {t('result.payment.qr.changeQRCode')}
          </span>
        </Flex>
      )}
    </>
  );
};

export default PromptPayQRCode;
