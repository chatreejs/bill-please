import { Modal } from 'antd';
import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { IGitHubTag } from '@interfaces';
import packageJson from '../../../package.json';

const CheckForUpdate: React.FC = () => {
  const { version } = packageJson;
  const { t } = useTranslation();
  const [isUpdateAvailable, setIsUpdateAvailable] = useState<boolean>(false);

  const checkForUpdate = useCallback(async () => {
    const { data } = await axios.get<IGitHubTag[]>(
      'https://api.github.com/repos/chatreejs/bill-please/git/refs/tags',
    );
    const latestVersion = data[data.length - 1].ref.replace('refs/tags/v', '');
    setIsUpdateAvailable(checkVersion(version, latestVersion));
  }, [version]);

  useEffect(() => {
    checkForUpdate().catch(console.error);
  }, [checkForUpdate]);

  const checkVersion = (currentVersion: string, latestVersion: string) => {
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
