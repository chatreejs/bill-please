import { ShareAltOutlined } from '@ant-design/icons';
import { Button, Flex } from 'antd';
import { domToJpeg } from 'modern-screenshot';
import React, { RefObject } from 'react';
import ReactGA from 'react-ga4';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import { RootState } from '@config';
interface Props {
  show: boolean;
  elementRef: RefObject<HTMLDivElement>;
}

const ShareBill: React.FC<Props> = ({ show, elementRef }) => {
  const { t } = useTranslation();
  const billTitle = useSelector((state: RootState) => state.bill.title);

  const onShare = () => {
    ReactGA.event({
      category: 'Social Links',
      action: 'share-bill-button',
      label: 'Share Bill',
    });
    convertHtmlToImage();
  };

  const convertHtmlToImage = () => {
    if (!elementRef.current) {
      return;
    }
    domToJpeg(elementRef.current, {
      filter,
      quality: 1,
      fetch: {
        bypassingCache: true,
      },
      scale: 4,
    })
      .then((dataUrl) => {
        const fileName = `bill-${billTitle.replace(/\s/g, '-')}.jpeg`;
        const link = document.createElement('a');
        link.download = fileName;
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const filter = (node: Node) => {
    const exclusionClasses = ['change-qr-code', 'change-payment-method'];
    return !exclusionClasses.some((className) =>
      node.parentElement?.classList.contains(className),
    );
  };

  return (
    <>
      {show && (
        <Flex justify="center" align="center" style={{ paddingTop: 12 }}>
          <Button style={{ width: '84x' }} onClick={onShare}>
            <ShareAltOutlined />
            {t('result.share')}
          </Button>
        </Flex>
      )}
    </>
  );
};

export default ShareBill;
