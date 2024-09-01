import { Flex } from 'antd';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { PaymentMethod } from '@enums';
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
    setSelectedPaymentMethod(method);
  };

  return (
    <>
      <PaymentWrapper>
        {selectedPaymentMethod === PaymentMethod.None && (
          <Flex vertical justify="center" align="center" gap={6}>
            <div>{t('result.payment.selectPaymentMethod')}</div>
            <div
              role="button"
              onClick={() => onPaymentMethodSelected(PaymentMethod.PromptPay)}
            >
              <img
                src={PromptPayLogo}
                alt="prompt-pay"
                style={{ width: '84px' }}
              />
            </div>
          </Flex>
        )}
        {selectedPaymentMethod === PaymentMethod.PromptPay && (
          <PromptPayQRCode />
        )}
      </PaymentWrapper>
      {selectedPaymentMethod !== PaymentMethod.None && (
        <span
          className="change-payment-method"
          style={{
            marginTop: '1rem',
            fontSize: 12,
            textDecoration: 'underline',
          }}
          onClick={() => onPaymentMethodSelected(PaymentMethod.None)}
        >
          {t('result.payment.changePaymentMethod')}
        </span>
      )}
    </>
  );
};

export default Payment;
