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

    &.version {
      margin-top: 0.25rem;
      font-size: 12px;
    }
  }

  a {
    color: #fafafa;
    text-decoration: underline;
    font-weight: 600;
    margin-left: 0.25rem;
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
            href="https://github.com/chatreejs"
            target="_blank"
            rel="noopener noreferrer"
          >
            Chatree.js
          </a>
        </span>
        <span className="version">Bill Please Version {version}</span>
      </FooterWrapper>
    </>
  );
};

export default Footer;
