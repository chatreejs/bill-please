import { Flex } from 'antd';
import React from 'react';
import styled from 'styled-components';
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
  const { version } = packageJson;

  return (
    <>
      <FooterWrapper>
        <span>
          Made with ❤️ by
          <a
            className="gh-username"
            href="https://github.com/chatreejs"
            target="_blank"
            rel="noopener noreferrer"
            style={{ marginLeft: '0.25rem' }}
          >
            Chatree.js
          </a>
        </span>
        <Flex gap={6}>
          <span>v{version}</span>
          <span>|</span>
          <span>
            <a
              href="https://github.com/chatreejs/bill-please/issues/new?assignees=&labels=&projects=&template=bug_report.md&title="
              target="_blank"
              rel="noopener noreferrer"
            >
              Report Issue
            </a>
          </span>
        </Flex>
      </FooterWrapper>
    </>
  );
};

export default Footer;
