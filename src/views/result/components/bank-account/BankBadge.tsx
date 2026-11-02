import React, { useState } from 'react';
import styled from 'styled-components';

import { IBank } from '@interfaces';

const Badge = styled.span<{ $size: number; $color: string; $text: string }>`
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  border-radius: 50%;
  overflow: hidden;
  background: ${({ $color }) => $color};
  color: ${({ $text }) => $text};
  font-size: ${({ $size }) => Math.max(6, Math.round($size / 4))}px;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

interface Props {
  bank: IBank;
  size?: number;
}

/** The bank's logo, or its short name on the bank color when the logo is missing */
const BankBadge: React.FC<Props> = ({ bank, size = 24 }) => {
  const [isIconBroken, setIsIconBroken] = useState(false);
  const showIcon = bank.icon && !isIconBroken;

  return (
    <Badge
      $size={size}
      $color={showIcon ? 'transparent' : bank.color}
      $text={bank.textColor ?? '#ffffff'}
      aria-hidden
    >
      {showIcon ? (
        <img src={bank.icon} alt="" onError={() => setIsIconBroken(true)} />
      ) : (
        bank.id
      )}
    </Badge>
  );
};

export default BankBadge;
