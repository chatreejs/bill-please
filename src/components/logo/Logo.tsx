import React from 'react';
import styled from 'styled-components';

interface LogoProps {
  systemName: string;
  showEnvBadge?: boolean;
}

const LogoWrapper = styled.div`
  height: 40px;
  display: flex;
  align-items: center;
  user-select: none;
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
  const env = process.env.VITE_APP_ENV;
  const isProduction = env === 'production';

  const getEnvironmentText = (env: string) => {
    switch (env) {
      case 'local':
        return 'LOCAL';
      case 'develop':
        return 'DEV';
      case 'staging':
        return 'STAGE';
      default:
        return '';
    }
  };

  return (
    <LogoWrapper>
      <LogoText>{systemName}</LogoText>
      {!isProduction && showEnvBadge && (
        <EnvBadge>{getEnvironmentText(env)}</EnvBadge>
      )}
    </LogoWrapper>
  );
};

export default Logo;
