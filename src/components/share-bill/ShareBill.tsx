import { ShareAltOutlined } from '@ant-design/icons';
import { RootState } from '@config';
import { Button, Flex } from 'antd';
import { toPng } from 'html-to-image';
import React, { RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

interface Props {
  show: boolean;
  elementRef: RefObject<HTMLDivElement>;
}

const ShareBill: React.FC<Props> = ({ show, elementRef }) => {
  const { t } = useTranslation();
  const billTitle = useSelector((state: RootState) => state.bill.title);

  const convertHtmlToPng = () => {
    if (!elementRef.current) {
      return;
    }
    toPng(elementRef.current, { filter })
      .then((dataUrl) => {
        const fileName = `bill-${billTitle.replace(/\s/g, '-')}.png`;
        const link = document.createElement('a');
        link.download = fileName;
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const filter = (node: HTMLElement) => {
    const exclusionClasses = ['change-qr-code', 'change-payment-method'];
    return !exclusionClasses.some((className) =>
      node.classList?.contains(className),
    );
  };

  return (
    <>
      {show && (
        <Flex justify="center" align="center" style={{ paddingTop: 12 }}>
          <Button style={{ width: '84x' }} onClick={convertHtmlToPng}>
            <ShareAltOutlined />
            {t('result.share')}
          </Button>
        </Flex>
      )}
    </>
  );
};

export default ShareBill;
