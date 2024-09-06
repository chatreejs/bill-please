import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface BackButtonProps {
  show: boolean;
}

const BackButton: React.FC<BackButtonProps> = ({ show }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const routes = ['/', '/mapping', '/result'];

  const onBack = () => {
    const currentRoute = location.pathname;
    const index = routes.indexOf(currentRoute);
    if (index > 0) {
      navigate(routes[index - 1], { replace: true });
    }
  };

  return (
    <div>
      {show && (
        <Button
          type="text"
          size="large"
          style={{ fontSize: '1.5rem', color: '#fafafad1' }}
          onClick={() => onBack()}
        >
          <ArrowLeftOutlined />
        </Button>
      )}
    </div>
  );
};

export default BackButton;
