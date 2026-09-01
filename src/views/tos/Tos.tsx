import { Typography } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const { Title, Paragraph, Text } = Typography;

const TosWrapper = styled.div`
  background: #faf9f6;
  border-radius: 26px;
  padding: 24px;
  filter: var(--card-shadow-filter);

  h5.ant-typography {
    margin-top: 1.5rem;
  }
`;

interface TosSection {
  heading: string;
  body: string[];
}

const Tos: React.FC = () => {
  const { t } = useTranslation('tos');
  const sections = t('sections', { returnObjects: true }) as TosSection[];

  return (
    <TosWrapper>
      <Title level={3} style={{ marginBottom: '0.25rem' }}>
        {t('title')}
      </Title>
      <Text type="secondary" style={{ fontSize: 13 }}>
        {t('lastUpdated')}
      </Text>
      <Paragraph style={{ marginTop: '1rem' }}>{t('intro')}</Paragraph>
      {sections.map((section, index) => (
        <section key={index}>
          <Title level={5}>{section.heading}</Title>
          {section.body.map((paragraph, i) => (
            <Paragraph key={i}>{paragraph}</Paragraph>
          ))}
        </section>
      ))}
    </TosWrapper>
  );
};

export default Tos;
