import { useQuery } from '@tanstack/react-query';
import { Modal } from 'antd';
import axios from 'axios';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { IGitHubTag } from '@interfaces';
import packageJson from '../../../package.json';

const fetchLatestVersion = async (): Promise<string> => {
  const { data } = await axios.get<IGitHubTag[]>(
    'https://api.github.com/repos/chatreejs/bill-please/git/refs/tags',
  );
  return data[data.length - 1].ref.replace('refs/tags/v', '');
};

const checkVersion = (
  currentVersion: string,
  latestVersion: string,
): boolean => {
  const currentVersionArray = currentVersion.split('.').map(Number);
  const latestVersionArray = latestVersion.split('.').map(Number);
  const versionLength = Math.max(
    currentVersionArray.length,
    latestVersionArray.length,
  );
  for (let i = 0; i < versionLength; i++) {
    if ((latestVersionArray[i] || 0) > (currentVersionArray[i] || 0)) {
      return true;
    }
  }
  return false;
};

const CheckForUpdate: React.FC = () => {
  const { version } = packageJson;
  const { t } = useTranslation();

  const { data: latestVersion } = useQuery({
    queryKey: ['latestVersion'],
    queryFn: fetchLatestVersion,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  const isUpdateAvailable = latestVersion
    ? checkVersion(version, latestVersion)
    : false;

  return (
    <Modal
      title={t('checkForUpdate.title')}
      open={isUpdateAvailable}
      centered
      okText={t('checkForUpdate.update')}
      onOk={() => window.location.reload()}
      closable={false}
      cancelButtonProps={{ style: { display: 'none' } }}
    >
      <div>
        <p>{t('checkForUpdate.description')}</p>
      </div>
    </Modal>
  );
};

export default CheckForUpdate;
