import '@fontsource/kanit';
import '@fontsource/outfit';
import '@fontsource/pacifico';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './i18n';

import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter basename="/bill-please">
    <App />
  </BrowserRouter>,
);