import { QrcodeOutlined } from '@ant-design/icons';
import { Button, Flex, Form, Input, QRCode } from 'antd';
import generatePayload from 'promptpay-qr';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useBrowserStorage } from '@hooks';
import { trackError, trackEvent } from '@utils';
import PromptPayLogo from '/src/assets/images/PromptPay-logo.png';
import ThaiQRPayment from '/src/assets/images/thai-qr-payment.png';

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

  const onSubmit = (isRestored = false) => {
    form
      .validateFields()
      .then(() => {
        const formData = form.getFieldsValue(true) as PromptPayForm;
        const promptPayPayload = generatePayload(formData.promptPayId, {});
        setPromptPayId(formData.promptPayId);
        setQrCodePayload(promptPayPayload);
        setIsSubmit(true);
        trackEvent('promptpay_qr_generated', { is_restored: isRestored });
      })
      .catch((error: unknown) => {
        // validateFields rejects with { errorFields }; anything else is a
        // real failure, e.g. generatePayload throwing on a malformed ID.
        if (error && typeof error === 'object' && 'errorFields' in error) {
          trackEvent('form_validation_failed', { form: 'promptpay' });
        } else {
          trackError('promptpay', error);
        }
      });
  };

  useEffect(() => {
    if (promptPayId) {
      form.setFieldsValue({ promptPayId });
      onSubmit(true);
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
                    message: t('result.payment.promptPay.inputError'),
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Button
                type="primary"
                onClick={() => onSubmit()}
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
            className="change-qr-code"
            style={{ fontSize: 12, textDecoration: 'underline' }}
            onClick={() => {
              trackEvent('promptpay_qr_changed');
              setIsSubmit(false);
            }}
          >
            {t('result.payment.qr.changeQRCode')}
          </span>
        </Flex>
      )}
    </>
  );
};

export default PromptPayQRCode;
