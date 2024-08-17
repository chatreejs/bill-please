import { DownOutlined } from '@ant-design/icons';
import { useBrowserStorage } from '@hooks';
import { Language } from '@interfaces';
import { Dropdown } from 'antd';
import 'flag-icons/css/flag-icons.min.css';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

const LanguageSwitcherDropdown = styled.div`
  cursor: pointer;
  color: white;
`;

const LanguageSwitcher: React.FC = () => {
  const [languageStorage, setLanguageStorage] = useBrowserStorage<string>(
    'language',
    '',
    'local',
  );
  const [selectedLanguage, setSelectedLanguage] = useState<Language>();
  const languages: Language[] = [
    {
      code: 'en-US',
      countryCode: 'us',
      name: 'English (US)',
    },
    {
      code: 'th-TH',
      countryCode: 'th',
      name: 'ไทย',
    },
    {
      code: 'zh-CN',
      countryCode: 'cn',
      name: '中文',
    },
    {
      code: 'ja-JP',
      countryCode: 'jp',
      name: '日本語',
    },
  ];

  useEffect(() => {
    let language: Language;
    if (languageStorage) {
      language = languages.find((lang) => lang.code === languageStorage);
    } else {
      const browserLanguage = navigator.language;
      language = languages.find((lang) => lang.code === browserLanguage);
    }

    setSelectedLanguage(language || languages[0]);
    setLanguageStorage(language.code || languages[0].code);
  }, []);

  return (
    <Dropdown
      trigger={['click']}
      menu={{
        items: languages.map((lang) => ({
          key: lang.code,
          label: lang.name,
          icon: <span className={`fi fi-${lang.countryCode}`}></span>,
          onClick: () => {
            setSelectedLanguage(lang);
            setLanguageStorage(lang.code);
          },
        })),
      }}
    >
      <LanguageSwitcherDropdown>
        <span
          className={`fi fi-${selectedLanguage?.countryCode}`}
          style={{ marginRight: '6px' }}
        ></span>
        <span
          style={{
            fontWeight: 'bold',
          }}
        >
          {selectedLanguage?.name}
        </span>
        <DownOutlined style={{ fontSize: '10px' }} />
      </LanguageSwitcherDropdown>
    </Dropdown>
  );
};

export default LanguageSwitcher;
