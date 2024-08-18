import { BackButton, Footer, LanguageSwitcher, Logo } from '@components';
import { App as AntApp, ConfigProvider } from 'antd';

import { AppRoutes as Router, store } from '@config';
import { Provider } from 'react-redux';
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
      <Provider store={store}>
        <AntApp>
          <MainWrapper>
            <ProductLogoWrapper>
              <BackButton show={true} />
              <Logo systemName="Bill Please" showEnvBadge={false} />
            </ProductLogoWrapper>
            <LanguageSwitcherWrapper>
              <LanguageSwitcher />
            </LanguageSwitcherWrapper>
            <Router />
            <Footer />
          </MainWrapper>
        </AntApp>
      </Provider>
    </ConfigProvider>
  );
};

export default App;
