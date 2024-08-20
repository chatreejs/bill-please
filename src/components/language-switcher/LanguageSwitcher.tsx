import { DownOutlined } from '@ant-design/icons';
import { useBrowserStorage } from '@hooks';
import { ILanguage } from '@interfaces';
import { Dropdown } from 'antd';
import 'flag-icons/css/flag-icons.min.css';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const LanguageSwitcherDropdown = styled.div`
  cursor: pointer;
  color: white;
`;

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const [languageStorage, setLanguageStorage] = useBrowserStorage<string>(
    'language',
    '',
    'local',
  );
  const [selectedLanguage, setSelectedLanguage] = useState<ILanguage>();
  const languages: ILanguage[] = [
    {
      code: 'en',
      countryCode: 'us',
      name: 'English (US)',
    },
    {
      code: 'th',
      countryCode: 'th',
      name: 'ไทย',
    },
    {
      code: 'zh',
      countryCode: 'cn',
      name: '中文',
    },
    {
      code: 'ja',
      countryCode: 'jp',
      name: '日本語',
    },
  ];

  useEffect(() => {
    let language: ILanguage;
    if (languageStorage) {
      language = languages.find((lang) => lang.code === languageStorage);
    } else {
      const browserLanguage = navigator.language.split('-')[0];
      language = languages.find((lang) => lang.code === browserLanguage);
    }
    setSelectedLanguage(language || languages[0]);
    setLanguageStorage(language.code || languages[0].code);
    i18n.changeLanguage(language.code || languages[0].code);
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
            i18n.changeLanguage(lang.code);
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
