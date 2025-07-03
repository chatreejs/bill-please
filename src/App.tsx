import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App as AntApp, ConfigProvider } from 'antd';
import { Suspense, useEffect, useRef, useState } from 'react';
import ReactGA from 'react-ga4';
import { Provider } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { PersistGate } from 'redux-persist/integration/react';
import styled from 'styled-components';

import {
  BackButton,
  CheckForUpdate,
  Footer,
  LanguageSwitcher,
  Logo,
  ShareBill,
  SplashSpinner,
} from '@components';
import { AppRoutes, persistor, store } from '@config';

const MainWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0 auto;
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

const BillRefStyled = styled.div`
  padding: 0.5rem;
  background-color: #2c9c91;
`;

const App: React.FC = () => {
  const [isShowBackButton, setIsShowBackButton] = useState<boolean>(false);
  const [isShowShareButton, setIsShowShareButton] = useState<boolean>(false);
  const location = useLocation();
  const billRef = useRef<HTMLDivElement>(null);
  const queryClient = new QueryClient();

  useEffect(() => {
    setIsShowBackButton(location.pathname !== '/');
    setIsShowShareButton(location.pathname === '/result');
  }, [location]);

  useEffect(() => {
    const gaMeasurementId = process.env.VITE_APP_GA_MEASUREMENT_ID;
    if (gaMeasurementId === undefined) return;
    ReactGA.initialize(gaMeasurementId);
    ReactGA.send({
      hitType: 'page_view',
      page: '/home',
      title: 'Home',
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
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
                  <CheckForUpdate />
                  <ProductLogoWrapper>
                    <BackButton show={isShowBackButton} />
                    <Logo systemName="Bill Please" showEnvBadge={true} />
                  </ProductLogoWrapper>
                  <LanguageSwitcherWrapper>
                    <LanguageSwitcher />
                  </LanguageSwitcherWrapper>
                  <BillRefStyled id="bill-ref-element" ref={billRef}>
                    <AppRoutes />
                  </BillRefStyled>
                  <ShareBill show={isShowShareButton} elementRef={billRef} />
                  <Footer />
                </MainWrapper>
              </AntApp>
            </PersistGate>
          </Provider>
        </Suspense>
      </ConfigProvider>
    </QueryClientProvider>
  );
};

export default App;
