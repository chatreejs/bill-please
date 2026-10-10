import { DownloadOutlined, ShareAltOutlined } from '@ant-design/icons';
import { Button, Flex } from 'antd';
import { domToJpeg } from 'modern-screenshot';
import React, { RefObject } from 'react';
import { isMobile, isTablet } from 'react-device-detect';
import { useTranslation } from 'react-i18next';
import { shareOnMobile } from 'react-mobile-share';
import { useSelector } from 'react-redux';

import { RootState } from '@config';
import { downloadFile, trackError, trackEvent } from '@utils';
interface Props {
  show: boolean;
  elementRef: RefObject<HTMLDivElement | null>;
}

const ShareBill: React.FC<Props> = ({ show, elementRef }) => {
  const { t } = useTranslation();
  const billTitle = useSelector((state: RootState) => state.bill.title);

  const onDownload = async () => {
    trackEvent('bill_image_downloaded');

    const result = await convertHtmlToImage();
    if (!result) {
      trackEvent('share_failed', { method: 'download' });
      return;
    }
    const fileName = `bill-${billTitle.replace(/\s/g, '-')}.jpeg`;
    downloadFile(result, fileName);
  };

  const onShare = async () => {
    trackEvent('share', {
      method: 'native_share',
      content_type: 'bill_image',
    });
    const result = await convertHtmlToImage();
    if (!result) {
      trackEvent('share_failed', { method: 'native_share' });
      return;
    }

    const fileName = `bill-${billTitle.replace(/\s/g, '-')}.jpeg`;
    shareOnMobile({
      title: fileName,
      images: [result],
    });
  };

  const convertHtmlToImage = async () => {
    if (!elementRef.current) {
      return;
    }
    try {
      return await domToJpeg(elementRef.current, {
        filter,
        quality: 1,
        fetch: {
          bypassingCache: true,
        },
        scale: 4,
      });
    } catch (error) {
      trackError('share_image', error);
      return;
    }
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
              {t('result.button.share')}
            </Button>
          ) : (
            <Button style={{ width: '84x' }} onClick={() => void onDownload()}>
              <DownloadOutlined />
              {t('result.button.download')}
            </Button>
          )}
        </Flex>
      )}
    </>
  );
};

export default ShareBill;
