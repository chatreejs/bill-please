import { faKoFi } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Flex } from 'antd';
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';

import { getBuildNumber } from '@utils';
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
    // text-decoration: underline;
  }

  a.gh-username {
    color: #fafafa;
    text-decoration: underline;
    font-weight: 600;
  }

  a.kofi-button {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    margin-bottom: 0.75rem;
    padding: 0.4rem 0.9rem;
    background-color: #ff5e5b;
    color: #fff;
    font-size: 13px;
    font-weight: 600;
    border-radius: 9999px;
    text-decoration: none;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: #e94f4c;
    }
  }
`;

const Footer: React.FC = () => {
  const [isShowBuildNumber, setIsShowBuildNumber] = useState(false);
  const { version } = packageJson;
  const { pathname } = useLocation();
  const isResultPage = pathname === '/result';

  const toggleBuildNumber = () => {
    setIsShowBuildNumber((prev) => !prev);
  };

  return (
    <FooterWrapper>
      {isResultPage && (
        <a
          className="kofi-button"
          href="https://ko-fi.com/chatreejs"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FontAwesomeIcon icon={faKoFi} />
          Buy me a coffee
        </a>
      )}
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
      <Flex gap={2}>
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
        <span>|</span>
        <span>
          <Link to="/tos">Terms</Link>
        </span>
        <span>|</span>
        <span>
          <Link to="/privacy">Privacy</Link>
        </span>
      </Flex>
    </FooterWrapper>
  );
};

export default Footer;
