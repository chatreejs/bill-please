import { DownloadOutlined, ShareAltOutlined } from '@ant-design/icons';
import { Button, Flex } from 'antd';
import { domToJpeg } from 'modern-screenshot';
import React, { RefObject } from 'react';
import { isMobile, isTablet } from 'react-device-detect';
import ReactGA from 'react-ga4';
import { useTranslation } from 'react-i18next';
import { shareOnMobile } from 'react-mobile-share';
import { useSelector } from 'react-redux';

import { RootState } from '@config';
import { downloadFile } from '@utils';
interface Props {
  show: boolean;
  elementRef: RefObject<HTMLDivElement>;
}

const ShareBill: React.FC<Props> = ({ show, elementRef }) => {
  const { t } = useTranslation();
  const billTitle = useSelector((state: RootState) => state.bill.title);

  const onDownload = async () => {
    ReactGA.event({
      category: 'Social Links',
      action: 'download-bill-button',
      label: 'Download Bill',
    });

    const result = await convertHtmlToImage();
    if (!result) {
      return;
    }
    const fileName = `bill-${billTitle.replace(/\s/g, '-')}.jpeg`;
    downloadFile(result, fileName);
  };

  const onShare = async () => {
    ReactGA.event({
      category: 'Social Links',
      action: 'share-bill-button',
      label: 'Share Bill',
    });
    const result = await convertHtmlToImage();
    if (!result) {
      return;
    }

    const fileName = `bill-${billTitle.replace(/\s/g, '-')}.jpeg`;
    shareOnMobile({
      title: fileName,
      images: [result],
    });
  };

  const convertHtmlToImage = () => {
    if (!elementRef.current) {
      return;
    }
    return domToJpeg(elementRef.current, {
      filter,
      quality: 1,
      fetch: {
        bypassingCache: true,
      },
      scale: 4,
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
        <Flex
          vertical
          justify="center"
          align="center"
          style={{ paddingTop: 12 }}
        >
          {isMobile || isTablet ? (
            <Button style={{ width: '84x' }} onClick={() => void onShare()}>
              <ShareAltOutlined />
              {t('result.share')}
            </Button>
          ) : (
            <Button style={{ width: '84x' }} onClick={() => void onDownload()}>
              <DownloadOutlined />
              {t('result.download')}
            </Button>
          )}
        </Flex>
      )}
    </>
  );
};

export default ShareBill;
