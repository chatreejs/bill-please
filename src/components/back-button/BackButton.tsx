import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

import { trackEvent } from '@utils';

interface BackButtonProps {
  show: boolean;
}

const BackButton: React.FC<BackButtonProps> = ({ show }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const routes = ['/', '/mapping', '/result'];

  const onBack = () => {
    const currentRoute = location.pathname;
    const index = routes.indexOf(currentRoute);
    trackEvent('navigate_back', { from_page: currentRoute });
    if (index > 0) {
      void navigate(routes[index - 1], { replace: true });
    } else if (index === -1) {
      // Routes outside the linear bill flow (e.g. /tos) go back in history
      void navigate(-1);
    }
  };

  return (
    <div>
      {show && (
        <Button
          type="text"
          size="large"
          style={{ fontSize: '1.5rem', color: '#fafafad1' }}
          aria-label={t('common.button.back')}
          onClick={() => onBack()}
        >
          <ArrowLeftOutlined />
        </Button>
      )}
    </div>
  );
};

export default BackButton;
