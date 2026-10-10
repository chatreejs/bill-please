import { CopyOutlined } from '@ant-design/icons';
import { App, Button, Modal, Table } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DeviceInfo, getBuildNumber, getDeviceInfo } from '@utils';
import packageJson from '../../../package.json';

interface DebugInfoModalProps {
  open: boolean;
  onClose: () => void;
}

const DebugInfoModal: React.FC<DebugInfoModalProps> = ({ open, onClose }) => {
  const { i18n } = useTranslation();
  const { message } = App.useApp();
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>();

  useEffect(() => {
    if (open) void getDeviceInfo().then(setDeviceInfo);
  }, [open]);

  const items = useMemo(() => {
    if (!open) return [];
    const isStandalone = window.matchMedia(
      '(display-mode: standalone)',
    ).matches;
    return [
      ['App version', `v${packageJson.version}`],
      ['Build number', getBuildNumber()],
      ['Build date', dayjs(BUILD_DATE).format('YYYY-MM-DD HH:mm:ss Z')],
      ['Environment', process.env.VITE_APP_ENV ?? 'local'],
      ['Device', deviceInfo?.device ?? '…'],
      ['OS', deviceInfo?.os ?? '…'],
      ['Browser', deviceInfo?.browser ?? '…'],
      ['Display mode', isStandalone ? 'standalone (PWA)' : 'browser'],
      ['Screen', `${window.screen.width}×${window.screen.height}`],
      ['Viewport', `${window.innerWidth}×${window.innerHeight}`],
      ['Pixel ratio', String(window.devicePixelRatio)],
      ['Touch points', String(navigator.maxTouchPoints)],
      ['App language', i18n.language],
      ['Browser language', navigator.languages.join(', ')],
      ['Timezone', Intl.DateTimeFormat().resolvedOptions().timeZone],
      ['Online', navigator.onLine ? 'yes' : 'no'],
      ['User agent', navigator.userAgent],
    ];
  }, [open, deviceInfo, i18n.language]);

  const copyToClipboard = () => {
    const text = items.map(([label, value]) => `${label}: ${value}`).join('\n');
    navigator.clipboard.writeText(text).then(
      () => void message.success('Copied debug info'),
      () => void message.error('Failed to copy'),
    );
  };

  return (
    <Modal
      title="Debug Info"
      open={open}
      onCancel={onClose}
      maskClosable={false}
      keyboard={false}
      centered
      footer={
        <Button icon={<CopyOutlined />} onClick={copyToClipboard}>
          Copy
        </Button>
      }
    >
      <Table
        size="small"
        bordered
        showHeader={false}
        pagination={false}
        rowKey="label"
        dataSource={items.map(([label, value]) => ({ label, value }))}
        columns={[
          {
            dataIndex: 'label',
            width: 120,
            render: (label: string) => <strong>{label}</strong>,
          },
          {
            dataIndex: 'value',
            render: (value: string) => (
              <span style={{ wordBreak: 'break-all' }}>{value}</span>
            ),
          },
        ]}
      />
    </Modal>
  );
};

export default DebugInfoModal;
