import { Flex } from 'antd';
import React, { useState } from 'react';
import styled from 'styled-components';

import dayjs from 'dayjs';
import packageJson from '../../../package.json';

const FooterWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 1rem 0;

  span {
    color: #fafafa;
    margin-top: 0.25rem;
    font-size: 12px;
  }

  a {
    color: #fafafa;
    text-decoration: underline;
  }

  a.gh-username {
    color: #fafafa;
    text-decoration: underline;
    font-weight: 600;
  }
`;

const Footer: React.FC = () => {
  const [isShowBuildNumber, setIsShowBuildNumber] = useState(false);
  const { version } = packageJson;

  const toggleBuildNumber = () => {
    setIsShowBuildNumber((prev) => !prev);
  };

  const getBuildNumber = () => {
    const minutes = dayjs(BUILD_DATE).diff(
      dayjs(BUILD_DATE).startOf('day'),
      'minute',
    );
    const formattedDate = dayjs(BUILD_DATE).format('YYMMDD');
    const intervals = Math.floor(minutes / 2);
    return `${formattedDate}${intervals}`;
  };

  return (
    <FooterWrapper>
      <span>
        Made with ❤️ by
        <a
          className="gh-username"
          href="https://github.com/chatreejs/bill-please"
          target="_blank"
          rel="noopener noreferrer"
          style={{ marginLeft: '0.25rem' }}
        >
          Chatree.js
        </a>
      </span>
      <Flex gap={6}>
        <span onClick={toggleBuildNumber}>
          {isShowBuildNumber
            ? `v${version} (${getBuildNumber()})`
            : `v${version}`}
        </span>
        <span>|</span>
        <span>
          <a
            href="https://github.com/chatreejs/bill-please/issues/new/choose"
            target="_blank"
            rel="noopener noreferrer"
          >
            Report Issue
          </a>
        </span>
      </Flex>
    </FooterWrapper>
  );
};

export default Footer;
