import {
  BackButton,
  Footer,
  LanguageSwitcher,
  Logo,
  SplashSpinner,
} from '@components';
import { App as AntApp, ConfigProvider } from 'antd';

import { AppRoutes, persistor, store } from '@config';
import { Suspense, useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { PersistGate } from 'redux-persist/integration/react';
import styled from 'styled-components';

const MainWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  padding: 0.5rem;
  width: 100%;
  max-width: 420px;
`;

const ProductLogoWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1.5rem;
  padding-left: 1.75rem;
  padding-right: 1.75rem;
`;

const LanguageSwitcherWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 0.5rem 1.75rem;
`;

const App: React.FC = () => {
  const [isShowBackButton, setIsShowBackButton] = useState<boolean>(false);
  const location = useLocation();

  useEffect(() => {
    setIsShowBackButton(location.pathname !== '/');
  }, [location]);

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#2C9C91',
          fontFamily: 'Outfit, Kanit',
          fontSize: 14,
          fontWeightStrong: 700,
        },
      }}
    >
      <Suspense fallback={<SplashSpinner />}>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <AntApp>
              <MainWrapper>
                <ProductLogoWrapper>
                  <BackButton show={isShowBackButton} />
                  <Logo systemName="Bill Please" showEnvBadge={true} />
                </ProductLogoWrapper>
                <LanguageSwitcherWrapper>
                  <LanguageSwitcher />
                </LanguageSwitcherWrapper>
                <AppRoutes />
                <Footer />
              </MainWrapper>
            </AntApp>
          </PersistGate>
        </Provider>
      </Suspense>
    </ConfigProvider>
  );
};

export default App;
