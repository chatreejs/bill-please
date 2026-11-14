import '@fontsource/kanit';
import '@fontsource/outfit';
import '@fontsource/pacifico';
import { SpeedInsights } from '@vercel/speed-insights/react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './App';
import {
  applyAppTheme,
  readThemeCookie,
  refreshAppTheme,
  resolveAppTheme,
} from './config/theme';
import './i18n';
import './index.css';

applyAppTheme(
  resolveAppTheme(window.location.search, readThemeCookie(document.cookie)),
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <SpeedInsights />
    <App />
  </BrowserRouter>,
);

if (import.meta.env.PROD) void refreshAppTheme();
