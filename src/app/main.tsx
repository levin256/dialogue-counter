import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.tsx';
import './index.css';

// 登録した値に使う、日本語の等幅フォント（index.css の --font-mono）。
// 文字の範囲ごとに分かれた @font-face が多く、最初の描画を待たせないように、あとから読み込む。
// フォントのファイルは、画面に出た文字の分だけをブラウザが読み込む
void import('@fontsource/biz-udgothic/400.css');

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('#root が見つかりません');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
