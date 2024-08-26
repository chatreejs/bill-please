import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const QRCodeWrapper = styled.div`
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

interface Props {
  promptpayId: string;
}

const QRCode: React.FC<Props> = ({ promptpayId }) => {
  const { t } = useTranslation();

  return (
    <QRCodeWrapper>
      <div>{t('result.qr.scanToPay')}</div>
      <div>
        <img
          src={`https://promptpay.io/${promptpayId}.png`}
          alt="QR Code"
          style={{ width: '100px' }}
        />
      </div>
    </QRCodeWrapper>
  );
};

export default QRCode;
