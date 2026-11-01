import { useQuery } from '@tanstack/react-query';
import { Modal } from 'antd';
import axios from 'axios';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { IGitHubTag } from '@interfaces';
import { compareVersions, isNewerVersion, trackEvent } from '@utils';
import packageJson from '../../../package.json';

const fetchLatestVersion = async (): Promise<string> => {
  const { data } = await axios.get<IGitHubTag[]>(
    'https://api.github.com/repos/chatreejs/bill-please/git/refs/tags',
  );
  // GitHub returns refs sorted lexically (v0.10.0 before v0.9.1),
  // so pick the highest version instead of the last entry.
  return data
    .map((tag) => tag.ref.replace('refs/tags/v', ''))
    .filter((version) => /^\d+(\.\d+)*$/.test(version))
    .reduce((latest, version) =>
      compareVersions(version, latest) > 0 ? version : latest,
    );
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
    ? isNewerVersion(version, latestVersion)
    : false;

  useEffect(() => {
    if (isUpdateAvailable) {
      trackEvent('update_prompt_shown', {
        current_version: version,
        latest_version: latestVersion!,
      });
    }
  }, [isUpdateAvailable, version, latestVersion]);

  return (
    <Modal
      title={t('checkForUpdate.title') + ` (v${version} → v${latestVersion})`}
      open={isUpdateAvailable}
      centered
      okText={t('checkForUpdate.update')}
      onOk={() => {
        trackEvent('update_accepted', {
          current_version: version,
          latest_version: latestVersion!,
        });
        window.location.reload();
      }}
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
