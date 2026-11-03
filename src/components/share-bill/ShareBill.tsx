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

/** Buttons and links the shared image leaves out */
const EXCLUDED_SELECTOR = [
  '.change-qr-code',
  '.change-payment-method',
  '.change-bank-account',
  '.ant-typography-copy',
].join(', ');

/**
 * Copy the bill without the excluded nodes and lay the copy out off screen,
 * so the image fits what is left. The page itself does not change.
 */
const copyForImage = (element: HTMLElement) => {
  const copy = element.cloneNode(true) as HTMLElement;
  copy.removeAttribute('id');

  // cloneNode copies neither what a canvas shows nor what an input holds.
  // Do this before removing nodes, so both lists still line up
  const canvases = element.querySelectorAll('canvas');
  copy.querySelectorAll('canvas').forEach((canvas, index) => {
    canvas.getContext('2d')?.drawImage(canvases[index], 0, 0);
  });
  const inputs = element.querySelectorAll('input');
  copy.querySelectorAll('input').forEach((input, index) => {
    input.value = inputs[index].value;
  });

  copy.querySelectorAll(EXCLUDED_SELECTOR).forEach((node) => node.remove());

  const container = document.createElement('div');
  container.setAttribute('aria-hidden', 'true');
  Object.assign(container.style, {
    position: 'fixed',
    top: '0',
    left: '-10000px',
    width: `${element.getBoundingClientRect().width}px`,
    pointerEvents: 'none',
  });
  container.appendChild(copy);
  element.parentElement?.appendChild(container);
  // A fractional height draws faint lines along the card edges in the image
  copy.style.height = `${Math.ceil(copy.getBoundingClientRect().height)}px`;
  return { copy, remove: () => container.remove() };
};

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
    const { copy, remove } = copyForImage(elementRef.current);
    try {
      return await domToJpeg(copy, {
        quality: 1,
        fetch: {
          bypassingCache: true,
        },
        scale: 4,
      });
    } catch (error) {
      trackError('share_image', error);
      return;
    } finally {
      remove();
    }
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
