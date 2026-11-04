import { theme } from 'antd';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { keyframes } from 'styled-components';

import { IReceiptScanProgress } from '@interfaces';

const ICON_SIZE = 56;

/** Rounded frame of the image icon, drawn on both layers */
const FRAME_PATH =
  'M6.8 21H17.2C18.8802 21 19.7202 21 20.362 20.673C20.9265 20.3854 21.3854 19.9265 21.673 19.362C22 18.7202 22 17.8802 22 16.2V7.8C22 6.11984 22 5.27976 21.673 4.63803C21.3854 4.07354 20.9265 3.6146 20.362 3.32698C19.7202 3 18.8802 3 17.2 3H6.8C5.11984 3 4.27976 3 3.63803 3.32698C3.07354 3.6146 2.6146 4.07354 2.32698 4.63803C2 5.27976 2 6.11984 2 7.8V16.2C2 17.8802 2 18.7202 2.32698 19.362C2.6146 19.9265 3.07354 20.3854 3.63803 20.673C4.27976 21 5.11984 21 6.8 21Z';

/** Mountains and sun inside the frame of the clean image icon */
const PICTURE_PATH =
  'M4.27209 20.7279L10.8686 14.1314C11.2646 13.7354 11.4627 13.5373 11.691 13.4632C11.8918 13.3979 12.1082 13.3979 12.309 13.4632C12.5373 13.5373 12.7354 13.7354 13.1314 14.1314L19.6839 20.6839M14 15L16.8686 12.1314C17.2646 11.7354 17.4627 11.5373 17.691 11.4632C17.8918 11.3979 18.1082 11.3979 18.309 11.4632C18.5373 11.5373 18.7354 11.7354 19.1314 12.1314L22 15M10 9C10 10.1046 9.10457 11 8 11C6.89543 11 6 10.1046 6 9C6 7.89543 6.89543 7 8 7C9.10457 7 10 7.89543 10 9Z';

/** Pixels of the scanned picture, shown where the bar has passed, as [x, y, width, height] */
const PIXELS: [number, number, number, number][] = [
  [6, 19, 1, 1],
  [7, 18, 1, 1],
  [7, 19, 3, 1],
  [9, 18, 1, 1],
  [14, 19, 3, 1],
  [15, 18, 1, 1],
  [5, 18, 2, 1],
  [5, 17, 1, 1],
  [10, 19, 1, 1],
  [7, 17, 1, 1],
  [11, 19, 1, 1],
  [10, 18, 1, 1],
  [17, 19, 1, 1],
  [15, 4, 2, 1],
  [3, 9, 1, 3],
  [4, 10, 1, 2],
  [6, 9, 1, 1],
  [15, 5, 1, 1],
  [20, 8, 1, 3],
  [19, 9, 1, 1],
  [7, 13, 1, 1],
  [9, 11, 1, 1],
  [16, 12, 1, 2],
  [13, 14, 1, 1],
  [12, 11, 1, 1],
  [10, 9, 1, 1],
  [10, 15, 1, 1],
  [10, 13, 1, 1],
  [15, 9, 1, 1],
  [13, 10, 1, 1],
  [12, 14, 1, 1],
  [5, 4, 3, 1],
  [6, 5, 1, 1],
  [7, 14, 1, 2],
  [6, 14, 3, 1],
  [16, 8, 1, 1],
  [8, 9, 1, 1],
  [20, 16, 1, 1],
  [12, 12, 1, 1],
  [8, 8, 1, 1],
  [14, 12, 1, 1],
  [17, 16, 2, 1],
  [14, 17, 1, 1],
  [11, 5, 3, 1],
  [12, 4, 1, 1],
  [12, 7, 1, 1],
  [7, 11, 1, 1],
  [15, 15, 1, 1],
  [11, 11, 1, 1],
  [13, 9, 1, 1],
  [12, 15, 1, 1],
  [9, 12, 2, 1],
  [19, 13, 2, 1],
  [9, 6, 1, 1],
  [20, 4, 1, 1],
  [19, 4, 1, 1],
  [3, 15, 1, 2],
  [3, 19, 1, 1],
];

/*
 * The bar sweeps right to left in 1.5s and straight back in 1s, then pauses
 * 0.2s. animation-direction: alternate plays every other cycle backwards.
 * The timing copies the framer-motion version of the 21st.dev analyzing-image
 * loader.
 */
const SWEEP_DURATION = '2.7s';
const SWEEP_EASE = 'cubic-bezier(0.175, 0.885, 0.32, 1)';

const uncover = keyframes`
  0% {
    clip-path: inset(0 0 0 0);
    animation-timing-function: ${SWEEP_EASE};
  }
  55.56% {
    clip-path: inset(0 105% 0 0);
    animation-timing-function: ${SWEEP_EASE};
  }
  92.59%, 100% { clip-path: inset(0 0 0 0); }
`;

const sweep = keyframes`
  0% {
    transform: translateX(1400%);
    animation-timing-function: ${SWEEP_EASE};
  }
  55.56% {
    transform: translateX(-80%);
    animation-timing-function: ${SWEEP_EASE};
  }
  92.59%, 100% { transform: translateX(1400%); }
`;

const shimmer = keyframes`
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 2rem 0;
`;

const Icon = styled.div<{ $color: string }>`
  position: relative;
  isolation: isolate;
  flex-shrink: 0;
  width: ${ICON_SIZE}px;
  height: ${ICON_SIZE}px;
  color: ${({ $color }) => $color};

  svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }
`;

/** The clean icon. Its clip-path shrinks with the bar to show the pixels underneath */
const Cover = styled.div<{ $background: string }>`
  position: absolute;
  inset: 0;
  z-index: 1;
  background: ${({ $background }) => $background};
  animation: ${uncover} ${SWEEP_DURATION} infinite alternate;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const ScanBar = styled.div`
  position: absolute;
  z-index: 2;
  top: 0;
  width: 7%;
  height: 100%;
  border-radius: 999px;
  background: currentColor;
  transform: translateX(1400%);
  animation: ${sweep} ${SWEEP_DURATION} infinite alternate;

  @media (prefers-reduced-motion: reduce) {
    display: none;
  }
`;

const TextRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;
`;

const Label = styled.span<{ $muted: string; $strong: string }>`
  font-size: 14px;
  font-weight: 500;
  color: transparent;
  background-image: linear-gradient(
    90deg,
    ${({ $muted }) => $muted} 35%,
    ${({ $strong }) => $strong} 50%,
    ${({ $muted }) => $muted} 65%
  );
  background-size: 200% 100%;
  background-clip: text;
  -webkit-background-clip: text;
  animation: ${shimmer} 1.4s linear infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    color: ${({ $muted }) => $muted};
  }
`;

const Elapsed = styled.span<{ $color: string }>`
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  color: ${({ $color }) => $color};
`;

/** Time since mount, as `4.2s` or `1m 3.5s` */
const useElapsed = () => {
  const [tenths, setTenths] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTenths((n) => n + 1), 100);
    return () => clearInterval(id);
  }, []);

  const seconds = tenths / 10;
  return seconds < 60
    ? `${seconds.toFixed(1)}s`
    : `${Math.floor(seconds / 60)}m ${(seconds % 60).toFixed(1)}s`;
};

const strokeProps = {
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

interface Props {
  progress?: IReceiptScanProgress;
}

/** A scan bar sweeping over an image icon, the current step of the scan and the time since it started */
const ReceiptScanProgress: React.FC<Props> = ({ progress }) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const elapsed = useElapsed();

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
    <Wrapper data-testid="receipt-scan-progress" role="status">
      <Icon
        aria-hidden
        data-testid="receipt-scan-animation"
        $color={token.colorTextSecondary}
      >
        <Cover $background={token.colorBgElevated}>
          <svg viewBox="0 0 24 24" fill="none">
            <path d={PICTURE_PATH} {...strokeProps} />
            <path d={FRAME_PATH} {...strokeProps} />
          </svg>
        </Cover>
        <ScanBar />
        <svg viewBox="0 0 24 24" fill="none">
          <path d={FRAME_PATH} {...strokeProps} />
          {PIXELS.map(([x, y, width, height]) => (
            <rect
              key={`${x}-${y}`}
              x={x}
              y={y}
              width={width}
              height={height}
              fill="currentColor"
            />
          ))}
        </svg>
      </Icon>
      <TextRow>
        <Label $muted={token.colorTextTertiary} $strong={token.colorText}>
          {status}
        </Label>
        <Elapsed $color={token.colorTextTertiary} aria-hidden>
          {elapsed}
        </Elapsed>
      </TextRow>
    </Wrapper>
  );
};

export default ReceiptScanProgress;
