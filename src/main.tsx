import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import CounterPage from './pages/CounterPage.tsx';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('#root が見つかりません');
}

createRoot(rootElement).render(
  <StrictMode>
    <CounterPage />
  </StrictMode>,
);
