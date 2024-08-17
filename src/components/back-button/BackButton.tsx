import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import React from 'react';

interface BackButtonProps {
  show: boolean;
}

const BackButton: React.FC<BackButtonProps> = ({ show }) => {
  return (
    <Button
      type="text"
      size="large"
      style={{ fontSize: '1.5rem', color: '#fafafad1' }}
    >
      <ArrowLeftOutlined />
    </Button>
  );
};

export default BackButton;
