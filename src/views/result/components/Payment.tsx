import { BankOutlined } from '@ant-design/icons';
import { Button, Flex } from 'antd';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { TextButton } from '@components';
import { PaymentMethod } from '@enums';
import { trackEvent } from '@utils';
import BankAccount from './bank-account/BankAccount';
import PromptPayQRCode from './promptpay/PromptPayQRCode';
import PromptPayLogo from '/src/assets/images/PromptPay-logo.png';

const PaymentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 18px;
  background: #fefefe;
  border-radius: 24px;
  box-shadow: 0 0 3px 0 rgba(0, 0, 0, 0.1);
`;

const Payment: React.FC = () => {
  const { t } = useTranslation();
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod>(PaymentMethod.None);

  const onPaymentMethodSelected = (method: PaymentMethod) => {
    if (method === PaymentMethod.None) {
      trackEvent('payment_method_changed');
    } else {
      trackEvent('payment_method_selected', { method });
    }
    setSelectedPaymentMethod(method);
  };

  return (
    <>
      <PaymentWrapper>
        {selectedPaymentMethod === PaymentMethod.None && (
          <Flex vertical justify="center" align="center" gap={6}>
            <div>{t('result.payment.selectPaymentMethod')}</div>
            <Flex align="center" gap={16}>
              <TextButton
                onClick={() => onPaymentMethodSelected(PaymentMethod.PromptPay)}
              >
                {/* As tall as the Bank account button */}
                <img
                  src={PromptPayLogo}
                  alt="PromptPay"
                  style={{ display: 'block', height: 32, width: 'auto' }}
                />
              </TextButton>
              <Button
                icon={<BankOutlined />}
                onClick={() =>
                  onPaymentMethodSelected(PaymentMethod.BankAccount)
                }
              >
                {t('result.payment.bankAccount.label')}
              </Button>
            </Flex>
          </Flex>
        )}
        {selectedPaymentMethod === PaymentMethod.PromptPay && (
          <PromptPayQRCode />
        )}
        {selectedPaymentMethod === PaymentMethod.BankAccount && <BankAccount />}
      </PaymentWrapper>
      {selectedPaymentMethod !== PaymentMethod.None && (
        <TextButton
          className="change-payment-method"
          style={{ marginTop: '1rem' }}
          onClick={() => onPaymentMethodSelected(PaymentMethod.None)}
        >
          {t('result.payment.changePaymentMethod')}
        </TextButton>
      )}
    </>
  );
};

export default Payment;
