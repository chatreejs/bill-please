import React, { useRef, useState } from 'react';
import styled from 'styled-components';

import DebugInfoModal from '../debug-info/DebugInfoModal';

const DEBUG_TAP_COUNT = 10;
const DEBUG_TAP_TIMEOUT_MS = 500;

interface LogoProps {
  systemName: string;
  showEnvBadge?: boolean;
}

const LogoWrapper = styled.div`
  height: 40px;
  display: flex;
  align-items: center;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
`;

const LogoText = styled.div`
  font-family: 'Pacifico', sans-serif;
  font-size: 32px;
  font-weight: 500;
  color: #fafafa;
`;

const EnvBadge = styled.div`
  background: #fa3e3e;
  color: #fff;
  font-size: 10px;
  font-weight: bold;
  padding: 2px 8px;
  border-radius: 4px;
  margin-left: 8px;
  align-self: flex-start;
`;

const Logo: React.FC<LogoProps> = ({ systemName, showEnvBadge = true }) => {
  const env = process.env.VITE_APP_ENV ?? 'local';
  const isProduction = env === 'production';
  const [isDebugOpen, setIsDebugOpen] = useState(false);
  const tapCount = useRef(0);
  const lastTapAt = useRef(0);

  // Rapid taps open the debug modal; a pause longer than the timeout resets.
  const handleTap = () => {
    const now = Date.now();
    tapCount.current =
      now - lastTapAt.current > DEBUG_TAP_TIMEOUT_MS ? 1 : tapCount.current + 1;
    lastTapAt.current = now;
    if (tapCount.current >= DEBUG_TAP_COUNT) {
      tapCount.current = 0;
      setIsDebugOpen(true);
    }
  };

  const getEnvironmentText = (env: string) => {
    switch (env) {
      case 'local':
        return 'LOCAL';
      case 'develop':
        return 'BETA';
      default:
        return '';
    }
  };

  return (
    <>
      <LogoWrapper onClick={handleTap}>
        <LogoText>{systemName}</LogoText>
        {!isProduction && showEnvBadge && (
          <EnvBadge>{getEnvironmentText(env)}</EnvBadge>
        )}
      </LogoWrapper>
      <DebugInfoModal
        open={isDebugOpen}
        onClose={() => setIsDebugOpen(false)}
      />
    </>
  );
};

export default Logo;
