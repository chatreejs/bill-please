import { Button, Flex, Form, Input, QRCode } from 'antd';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { QrcodeOutlined } from '@ant-design/icons';
import { useBrowserStorage } from '@hooks';
import generatePayload from 'promptpay-qr';
import PromptPayLogo from '../../../../assets/PromptPay-logo.png';

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
        <Flex
          vertical
          justify="center"
          align="center"
          onClick={() => setIsSubmit(false)}
        >
          <div>{t('result.payment.qr.scanToPay')}</div>
          <img
            src={PromptPayLogo}
            alt="PromptPayLogo"
            style={{ width: '100px' }}
          />
          <QRCode
            type={'svg'}
            bordered={false}
            value={qrCodePayload ?? '-'}
            size={90}
          />
        </Flex>
      )}
    </>
  );
};

export default PromptPayQRCode;
