import { Flex, Spin, Typography } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { IReceiptScanProgress } from '@interfaces';

const { Text } = Typography;

const Wrapper = styled(Flex)`
  padding: 2rem 0;
`;

interface Props {
  progress?: IReceiptScanProgress;
}

/** A spinner with one line for the current step of the scan */
const ReceiptScanProgress: React.FC<Props> = ({ progress }) => {
  const { t } = useTranslation();

  const status = (() => {
    switch (progress?.stage) {
      case 'queue':
        return t('home.itemList.importModal.progress.extracting');
      case 'llm':
        return progress.items
          ? t('home.itemList.importModal.progress.found', {
              count: progress.items,
            })
          : t('home.itemList.importModal.progress.extracting');
      default:
        // upload and ocr
        return t('home.itemList.importModal.progress.reading');
    }
  })();

  return (
    <Wrapper
      vertical
      align="center"
      gap={16}
      data-testid="receipt-scan-progress"
    >
      <Spin size="large" />
      <Text type="secondary">{status}</Text>
    </Wrapper>
  );
};

export default ReceiptScanProgress;
