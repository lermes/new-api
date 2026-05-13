/*
Copyright (C) 2025 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/

import React, { useContext, useEffect, useMemo, useState } from 'react';
import { API, showError } from '../../helpers';
import { useIsMobile } from '../../hooks/common/useIsMobile';
import { StatusContext } from '../../context/Status';
import { useActualTheme } from '../../context/Theme';
import { marked } from 'marked';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import NoticeModal from '../../components/layout/NoticeModal';

const API_EXAMPLES = {
  chat: {
    method: 'POST',
    route: '/v1/chat/completions',
    accent: 'chat',
    request: (serverAddress) => `<span class="code-green">curl</span> <span class="code-blue">-X POST</span> <span class="code-orange">"${serverAddress}/v1/chat/completions"</span> \\
  <span class="code-blue">-H</span> <span class="code-orange">"Authorization: Bearer sk-••••"</span> \\
  <span class="code-blue">-H</span> <span class="code-orange">"Content-Type: application/json"</span> \\
  <span class="code-blue">-d</span> <span class="code-orange">'{</span>
    <span class="code-blue">"model"</span>: <span class="code-orange">"gpt-4o-mini"</span>,
    <span class="code-blue">"messages"</span>: [
      { <span class="code-blue">"role"</span>: <span class="code-orange">"user"</span>, <span class="code-blue">"content"</span>: <span class="code-orange">"Hello Infinity"</span> }
    ]
  <span class="code-orange">}'</span>`,
    response: `{
  <span class="code-blue">"choices"</span>: [{ <span class="code-blue">"message"</span>: { <span class="code-blue">"content"</span>: <span class="code-green">"Chat request routed."</span> }}],
  <span class="code-blue">"usage"</span>: { <span class="code-blue">"total_tokens"</span>: <span class="code-purple">27</span> }
}`,
  },
  responses: {
    method: 'POST',
    route: '/v1/responses',
    accent: 'responses',
    request: (serverAddress) => `<span class="code-green">curl</span> <span class="code-blue">-X POST</span> <span class="code-orange">"${serverAddress}/v1/responses"</span> \\
  <span class="code-blue">-H</span> <span class="code-orange">"Authorization: Bearer sk-••••"</span> \\
  <span class="code-blue">-H</span> <span class="code-orange">"Content-Type: application/json"</span> \\
  <span class="code-blue">-d</span> <span class="code-orange">'{</span>
    <span class="code-blue">"model"</span>: <span class="code-orange">"your-model"</span>,
    <span class="code-blue">"input"</span>: <span class="code-orange">"Hello Infinity"</span>
  <span class="code-orange">}'</span>`,
    response: `{
  <span class="code-blue">"output"</span>: [{ <span class="code-blue">"type"</span>: <span class="code-orange">"output_text"</span>, <span class="code-blue">"text"</span>: <span class="code-orange">"Response workflow ready."</span> }],
  <span class="code-blue">"usage"</span>: { <span class="code-blue">"total_tokens"</span>: <span class="code-purple">31</span> }
}`,
  },
  claude: {
    method: 'POST',
    route: '/v1/messages',
    accent: 'claude',
    request: (serverAddress) => `<span class="code-green">curl</span> <span class="code-blue">-X POST</span> <span class="code-orange">"${serverAddress}/v1/messages"</span> \\
  <span class="code-blue">-H</span> <span class="code-orange">"x-api-key: sk-••••"</span> \\
  <span class="code-blue">-H</span> <span class="code-orange">"anthropic-version: 2023-06-01"</span> \\
  <span class="code-blue">-H</span> <span class="code-orange">"Content-Type: application/json"</span> \\
  <span class="code-blue">-d</span> <span class="code-orange">'{</span>
    <span class="code-blue">"model"</span>: <span class="code-orange">"your-model"</span>,
    <span class="code-blue">"max_tokens"</span>: <span class="code-muted">1024</span>,
    <span class="code-blue">"messages"</span>: [
      { <span class="code-blue">"role"</span>: <span class="code-orange">"user"</span>, <span class="code-blue">"content"</span>: <span class="code-orange">"Hello Infinity"</span> }
    ]
  <span class="code-orange">}'</span>`,
    response: `{
  <span class="code-blue">"content"</span>: [{ <span class="code-blue">"type"</span>: <span class="code-orange">"text"</span>, <span class="code-blue">"text"</span>: <span class="code-blue">"Claude message routed."</span> }],
  <span class="code-blue">"usage"</span>: { <span class="code-blue">"input_tokens"</span>: <span class="code-purple">11</span>, <span class="code-blue">"output_tokens"</span>: <span class="code-purple">18</span> }
}`,
  },
  gemini: {
    method: 'POST',
    route: '/v1beta/models/{model}:generateContent',
    accent: 'gemini',
    request: (serverAddress) => `<span class="code-green">curl</span> <span class="code-blue">-X POST</span> <span class="code-orange">"${serverAddress}/v1beta/models/{model}:generateContent"</span> \\
  <span class="code-blue">-H</span> <span class="code-orange">"x-goog-api-key: sk-••••"</span> \\
  <span class="code-blue">-H</span> <span class="code-orange">"Content-Type: application/json"</span> \\
  <span class="code-blue">-d</span> <span class="code-orange">'{</span>
    <span class="code-blue">"contents"</span>: [
      { <span class="code-blue">"role"</span>: <span class="code-orange">"user"</span>, <span class="code-blue">"parts"</span>: [{ <span class="code-blue">"text"</span>: <span class="code-orange">"Hello Infinity"</span> }] }
    ]
  <span class="code-orange">}'</span>`,
    response: `{
  <span class="code-blue">"candidates"</span>: [{ <span class="code-blue">"content"</span>: { <span class="code-blue">"parts"</span>: [{ <span class="code-blue">"text"</span>: <span class="code-purple">"Gemini request served."</span> }] } }],
  <span class="code-blue">"usageMetadata"</span>: { <span class="code-blue">"totalTokenCount"</span>: <span class="code-purple">25</span> }
}`,
  },
};

const MODEL_ICONS = [
  'openaigym',
  'anthropic',
  'googlegemini',
  'minimax',
  'qwen',
  'xiaomi',
  'mistralai',
];

const getDefaultServerAddress = () => {
  const { protocol, hostname } = window.location;
  return `${protocol}//${hostname}:3000`;
};

const HOME_STYLE = `
.infinity-home {
  min-height: 100vh;
  overflow-x: hidden;
  color: var(--infinity-text);
  background:
    radial-gradient(circle at 50% 0%, color-mix(in srgb, var(--infinity-brand) 10%, transparent), transparent 42%),
    radial-gradient(circle at 50% 62%, rgba(37, 99, 235, .06), transparent 38%),
    var(--infinity-bg);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  letter-spacing: 0;
}

.infinity-home[data-theme="light"] {
  color-scheme: light;
  --infinity-bg: #f8fafc;
  --infinity-surface: rgba(255, 255, 255, .82);
  --infinity-surface-strong: rgba(255, 255, 255, .96);
  --infinity-line: rgba(15, 23, 42, .11);
  --infinity-line-strong: rgba(15, 23, 42, .16);
  --infinity-text: #111827;
  --infinity-muted: #64748b;
  --infinity-subtle: #94a3b8;
  --infinity-brand: #4f46e5;
  --infinity-brand-2: #2563eb;
  --infinity-green: #10b981;
}

.infinity-home[data-theme="dark"] {
  color-scheme: dark;
  --infinity-bg: #101116;
  --infinity-surface: rgba(20, 24, 34, .74);
  --infinity-surface-strong: rgba(22, 27, 39, .94);
  --infinity-line: rgba(148, 163, 184, .16);
  --infinity-line-strong: rgba(148, 163, 184, .24);
  --infinity-text: #f8fafc;
  --infinity-muted: #9aa4b8;
  --infinity-subtle: #748098;
  --infinity-brand: #818cf8;
  --infinity-brand-2: #60a5fa;
  --infinity-green: #34d399;
}

.infinity-home * {
  box-sizing: border-box;
}

.infinity-page {
  width: 100%;
  min-height: 100vh;
  padding: clamp(24px, 4vh, 48px) 22px 42px;
}

.infinity-shell {
  width: min(1180px, 100%);
  margin: 0 auto;
}

.infinity-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.infinity-logo {
  width: min(42vw, 280px);
  height: auto;
  display: block;
  margin: 0 auto -48px;
}

.infinity-badge {
  width: fit-content;
  display: inline-flex;
  align-items: center;
  gap: 9px;
  padding: 8px 13px;
  border: 1px solid color-mix(in srgb, var(--infinity-brand) 32%, transparent);
  border-radius: 999px;
  color: var(--infinity-brand);
  background: color-mix(in srgb, var(--infinity-brand) 9%, transparent);
  font-size: 14px;
  font-weight: 800;
  margin: 0 auto 16px;
}

.infinity-status-dot {
  position: relative;
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: var(--infinity-green);
  box-shadow: 0 0 0 0 color-mix(in srgb, var(--infinity-green) 28%, transparent);
  animation: infinityStatusBreath 2.4s ease-out infinite;
}

.infinity-title {
  width: min(1120px, 100%);
  max-width: 100%;
  margin: 0;
  color: var(--infinity-text);
  font-size: clamp(50px, 5.7vw, 78px);
  line-height: 1.03;
  font-weight: 850;
  letter-spacing: 0;
  text-align: center;
  text-wrap: balance;
}

.infinity-title-cjk {
  white-space: nowrap;
}

.infinity-title-latin {
  max-width: 1120px;
  font-size: clamp(42px, 5vw, 72px);
  line-height: 1.08;
}

.infinity-lead {
  max-width: 580px;
  margin: 20px auto 0;
  color: color-mix(in srgb, var(--infinity-muted) 86%, transparent);
  font-size: clamp(13px, 1.1vw, 16px);
  line-height: 1.62;
}

.infinity-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
  margin-bottom: 24px;
}

.infinity-button {
  height: 50px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 0 24px;
  border-radius: 12px;
  border: 1px solid transparent;
  font-size: 16px;
  font-weight: 850;
  color: inherit;
  text-decoration: none;
  transition: transform .18s ease, border-color .18s ease, box-shadow .18s ease;
}

.infinity-button:hover {
  color: inherit;
  text-decoration: none;
  transform: translateY(-1px);
}

.infinity-button-primary {
  min-width: 160px;
  color: #fff;
  background: linear-gradient(135deg, var(--infinity-brand-2), var(--infinity-brand));
  box-shadow: 0 16px 34px color-mix(in srgb, var(--infinity-brand) 34%, transparent);
}

.infinity-button-primary:hover {
  color: #fff;
}

.infinity-button-secondary {
  min-width: 150px;
  color: color-mix(in srgb, var(--infinity-text) 88%, var(--infinity-muted));
  border-color: color-mix(in srgb, var(--infinity-line-strong) 72%, transparent);
  background: color-mix(in srgb, var(--infinity-surface) 54%, transparent);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, .08),
    0 10px 24px rgba(15, 23, 42, .06);
  backdrop-filter: blur(12px);
}

.infinity-home[data-theme="dark"] .infinity-button-secondary {
  color: #e5e7eb;
  border-color: rgba(148, 163, 184, .18);
  background: rgba(20, 24, 34, .72);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, .06),
    0 10px 24px rgba(0, 0, 0, .18);
}

.infinity-model-roller {
  position: relative;
  width: 24px;
  height: 24px;
  display: inline-block;
  overflow: hidden;
  flex: 0 0 auto;
  --model-count: 1;
  --model-index: 0;
  --model-step: 1.2s;
  --model-duration: calc(var(--model-count) * var(--model-step));
}

.infinity-model-roller img {
  position: absolute;
  left: 0;
  top: 0;
  width: 22px;
  height: 22px;
  display: block;
  margin: 1px;
  opacity: 0;
  transform: translateY(18px) scale(.92);
  animation: infinityModelJump var(--model-duration) cubic-bezier(.22, 1, .36, 1) infinite both;
  animation-delay: calc((var(--model-index) - var(--model-count) + 1) * var(--model-step));
}

.infinity-panel-wrap {
  width: min(720px, 100%);
  position: relative;
  margin-top: 40px;
}

.infinity-panel {
  overflow: hidden;
  border: 1px solid var(--infinity-line-strong);
  border-radius: 12px;
  background: var(--infinity-surface-strong);
  box-shadow: 0 22px 60px rgba(15, 23, 42, .10);
  text-align: left;
}

.infinity-home[data-theme="dark"] .infinity-panel {
  box-shadow: 0 24px 70px rgba(0, 0, 0, .30);
}

.infinity-api-tabs {
  height: 48px;
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  border-bottom: 1px solid var(--infinity-line);
}

.infinity-tab-list {
  display: flex;
  align-items: stretch;
  min-width: 0;
  overflow: hidden;
}

.infinity-tab {
  position: relative;
  display: inline-flex;
  align-items: center;
  padding: 0 clamp(14px, 2.4vw, 26px);
  color: var(--infinity-subtle);
  border: 0;
  background: transparent;
  font-size: clamp(13px, 1.25vw, 15px);
  font-weight: 850;
  font-family: inherit;
  white-space: nowrap;
  cursor: pointer;
}

.infinity-tab-active {
  color: var(--infinity-green);
}

.infinity-tab-active::after {
  content: "";
  position: absolute;
  left: 14px;
  right: 14px;
  bottom: -1px;
  height: 2px;
  border-radius: 999px;
  background: var(--infinity-green);
}

.infinity-panel[data-api="responses"] .infinity-tab-active { color: #f59e0b; }
.infinity-panel[data-api="responses"] .infinity-tab-active::after { background: #f59e0b; }
.infinity-panel[data-api="claude"] .infinity-tab-active { color: #2563eb; }
.infinity-panel[data-api="claude"] .infinity-tab-active::after { background: #2563eb; }
.infinity-panel[data-api="gemini"] .infinity-tab-active { color: #8b5cf6; }
.infinity-panel[data-api="gemini"] .infinity-tab-active::after { background: #8b5cf6; }

.infinity-api-status {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 0 clamp(14px, 2vw, 24px);
  color: var(--infinity-subtle);
  font: 850 12px/1 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  white-space: nowrap;
}

.infinity-api-route {
  min-height: 54px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px clamp(18px, 2.5vw, 24px);
  border-bottom: 1px solid var(--infinity-line);
  font: 850 clamp(15px, 1.55vw, 18px)/1 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.infinity-method {
  padding: 6px 8px;
  border-radius: 9px;
  color: #059669;
  background: rgba(16, 185, 129, .12);
  font-size: clamp(12px, 1.25vw, 14px);
}

.infinity-panel[data-api="responses"] .infinity-method {
  color: #d97706;
  background: rgba(245, 158, 11, .12);
}

.infinity-panel[data-api="claude"] .infinity-method {
  color: #2563eb;
  background: rgba(37, 99, 235, .12);
}

.infinity-panel[data-api="gemini"] .infinity-method {
  color: #8b5cf6;
  background: rgba(139, 92, 246, .12);
}

.infinity-route-path {
  color: var(--infinity-text);
  overflow-wrap: anywhere;
}

.infinity-api-section {
  padding: clamp(22px, 3vw, 30px) clamp(20px, 3vw, 30px);
  border-bottom: 1px solid var(--infinity-line);
}

.infinity-api-section-title {
  margin-bottom: 18px;
  color: var(--infinity-subtle);
  font-size: 12px;
  font-weight: 900;
  letter-spacing: .24em;
}

.infinity-api-code {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  color: var(--infinity-muted);
  background: transparent;
  padding: 0;
  font: clamp(12px, 1.35vw, 16px)/1.52 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.infinity-api-response .infinity-api-code {
  font-size: clamp(12px, 1.28vw, 15px);
}

.infinity-api-code .code-green { color: #009f69; }
.infinity-api-code .code-blue { color: #005fba; }
.infinity-api-code .code-orange { color: #b94b00; }
.infinity-api-code .code-purple { color: #7c3aed; }
.infinity-api-code .code-muted { color: var(--infinity-subtle); }

.infinity-api-footer {
  min-height: 42px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
  padding: 0 clamp(18px, 2.5vw, 24px);
  color: var(--infinity-subtle);
  font: 850 clamp(11px, 1.15vw, 13px)/1 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  text-transform: uppercase;
}

.infinity-api-footer-right {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14px;
}

.infinity-api-dot {
  color: color-mix(in srgb, var(--infinity-subtle) 38%, transparent);
}

.infinity-features {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-top: 50px;
}

.infinity-feature {
  min-height: 132px;
  padding: 19px 18px;
  border: 1px solid var(--infinity-line);
  border-radius: 12px;
  background: var(--infinity-surface);
}

.infinity-feature strong {
  display: block;
  margin-bottom: 9px;
  color: var(--infinity-text);
  font-size: 17px;
}

.infinity-feature span {
  display: block;
  color: var(--infinity-muted);
  font-size: 14px;
  line-height: 1.68;
}

@keyframes infinityModelJump {
  0%, 2% {
    opacity: 0;
    transform: translateY(18px) scale(.92);
  }

  5%, 9% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }

  12.5%, 100% {
    opacity: 0;
    transform: translateY(-18px) scale(.92);
  }
}

@keyframes infinityStatusBreath {
  0% {
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--infinity-green) 30%, transparent);
  }

  70% {
    box-shadow: 0 0 0 9px color-mix(in srgb, var(--infinity-green) 0%, transparent);
  }

  100% {
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--infinity-green) 0%, transparent);
  }
}

@media (min-width: 921px) {
  .infinity-title-cjk {
    white-space: nowrap;
  }
}

@media (max-width: 920px) {
  .infinity-page {
    padding-top: 34px;
  }

  .infinity-hero,
  .infinity-panel {
    text-align: center;
  }

  .infinity-logo,
  .infinity-badge,
  .infinity-title,
  .infinity-lead {
    margin-left: auto;
    margin-right: auto;
  }

  .infinity-actions {
    justify-content: center;
  }

  .infinity-features {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .infinity-page {
    padding-left: 16px;
    padding-right: 16px;
  }

  .infinity-logo {
    width: min(86vw, 340px);
    margin-bottom: -56px;
  }

  .infinity-title {
    font-size: clamp(42px, 15vw, 58px);
  }

  .infinity-button,
  .infinity-actions {
    width: 100%;
  }

  .infinity-button {
    min-width: 0;
  }

  .infinity-features {
    grid-template-columns: 1fr;
  }

  .infinity-api-tabs {
    height: auto;
    flex-direction: column;
  }

  .infinity-tab-list {
    overflow-x: auto;
  }

  .infinity-tab {
    min-height: 54px;
  }

  .infinity-api-status {
    min-height: 42px;
    justify-content: flex-end;
  }

  .infinity-api-route {
    align-items: flex-start;
    flex-direction: column;
  }

  .infinity-api-footer {
    align-items: flex-start;
    flex-direction: column;
    justify-content: center;
    padding-top: 16px;
    padding-bottom: 16px;
  }
}
`;

const DefaultHome = ({
  actualTheme,
  serverAddress,
}) => {
  const { t, i18n } = useTranslation();
  const [activeApi, setActiveApi] = useState('chat');
  const currentExample = API_EXAMPLES[activeApi] || API_EXAMPLES.chat;
  const iconColor = actualTheme === 'dark' ? 'ffffff' : '111827';
  const isCjkLanguage = /^(zh|ja|ko)/i.test(i18n.language || '');
  const requestHtml = useMemo(
    () => currentExample.request(serverAddress),
    [currentExample, serverAddress],
  );

  return (
    <div className='infinity-home' data-theme={actualTheme || 'light'}>
      <style>{HOME_STYLE}</style>
      <main className='infinity-page'>
        <div className='infinity-shell'>
          <section
            className='infinity-hero'
            aria-label={t('Infinity LLM 首页')}
          >
            <div>
              <img
                className='infinity-logo'
                src='/home-logo.svg'
                alt='Infinity LLM'
              />
              <h1
                className={`infinity-title ${isCjkLanguage ? 'infinity-title-cjk' : 'infinity-title-latin'}`}
              >
                {t('大模型的统一接口')}
              </h1>
              <p className='infinity-lead'>
                {t(
                  '一个 API Key 适用所有主流模型。兼容 OpenAI SDK，统一 Base URL，按量使用，无需订阅。',
                )}
              </p>
              <div className='infinity-actions'>
                <Link
                  className='infinity-button infinity-button-primary'
                  to='/console/token'
                >
                  {t('获取 API 密钥')}
                </Link>
                <Link
                  className='infinity-button infinity-button-secondary'
                  to='/pricing'
                >
                  <span>{t('模型与价格')}</span>
                  <span
                    className='infinity-model-roller'
                    aria-hidden='true'
                    style={{ '--model-count': MODEL_ICONS.length }}
                  >
                    {MODEL_ICONS.map((icon, index) => (
                      <img
                        key={icon}
                        src={`https://cdn.simpleicons.org/${icon}/${iconColor}?v=${iconColor}`}
                        alt=''
                        style={{ '--model-index': index }}
                      />
                    ))}
                  </span>
                </Link>
              </div>
            </div>

            <div className='infinity-panel-wrap'>
              <div className='infinity-badge'>
                <span className='infinity-status-dot' />
                {t('OpenAI 兼容 · 多模型统一网关')}
              </div>
              <div
                className='infinity-panel'
                aria-label={t('API 调用示例')}
                data-api={currentExample.accent}
              >
                <div className='infinity-api-tabs'>
                  <div
                    className='infinity-tab-list'
                    role='tablist'
                    aria-label={t('API 示例类型')}
                  >
                    {Object.keys(API_EXAMPLES).map((name) => (
                      <button
                        key={name}
                        className={`infinity-tab ${activeApi === name ? 'infinity-tab-active' : ''}`}
                        type='button'
                        role='tab'
                        aria-selected={activeApi === name}
                        onClick={() => setActiveApi(name)}
                      >
                        {name === 'chat'
                          ? 'Chat'
                          : name.charAt(0).toUpperCase() + name.slice(1)}
                      </button>
                    ))}
                  </div>
                  <div className='infinity-api-status'>200 OK</div>
                </div>
                <div className='infinity-api-route'>
                  <span className='infinity-method'>
                    {currentExample.method}
                  </span>
                  <span className='infinity-route-path'>
                    {currentExample.route}
                  </span>
                </div>
                <div className='infinity-api-section'>
                  <div className='infinity-api-section-title'>REQUEST</div>
                  <pre
                    className='infinity-api-code'
                    dangerouslySetInnerHTML={{ __html: requestHtml }}
                  />
                </div>
                <div className='infinity-api-section infinity-api-response'>
                  <div className='infinity-api-section-title'>RESPONSE</div>
                  <pre
                    className='infinity-api-code'
                    dangerouslySetInnerHTML={{
                      __html: currentExample.response,
                    }}
                  />
                </div>
                <div className='infinity-api-footer'>
                  <div className='infinity-api-footer-right'>
                    <span>STREAM</span>
                    <span className='infinity-api-dot'>·</span>
                    <span>SSE</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section
            className='infinity-features'
            aria-label={t('平台能力')}
          >
            <div className='infinity-feature'>
              <strong>{t('模型统一接入')}</strong>
              <span>{t('通过统一的界面访问所有主流模型。')}</span>
            </div>
            <div className='infinity-feature'>
              <strong>{t('兼容现有生态')}</strong>
              <span>
                {t('支持 OpenAI 风格接口，适合 SDK、插件和自动化工具。')}
              </span>
            </div>
            <div className='infinity-feature'>
              <strong>{t('稳定优先')}</strong>
              <span>{t('面向长期使用场景，适合个人项目和生产任务接入。')}</span>
            </div>
            <div className='infinity-feature'>
              <strong>{t('控制台管理')}</strong>
              <span>{t('密钥、余额、日志、倍率和模型价格集中查看。')}</span>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

const Home = () => {
  const { t, i18n } = useTranslation();
  const [statusState] = useContext(StatusContext);
  const actualTheme = useActualTheme();
  const [homePageContentLoaded, setHomePageContentLoaded] = useState(false);
  const [homePageContent, setHomePageContent] = useState('');
  const [noticeVisible, setNoticeVisible] = useState(false);
  const isMobile = useIsMobile();
  const serverAddress =
    statusState?.status?.server_address || getDefaultServerAddress();

  const displayHomePageContent = async () => {
    setHomePageContent(localStorage.getItem('home_page_content') || '');
    try {
      const res = await API.get('/api/home_page_content', {
        skipErrorHandler: true,
      });
      const { success, message, data } = res.data;
      if (success) {
        let content = data;
        if (!data.startsWith('https://')) {
          content = marked.parse(data);
        }
        setHomePageContent(content);
        localStorage.setItem('home_page_content', content);

        // 如果内容是 URL，则发送主题模式
        if (data.startsWith('https://')) {
          const iframe = document.querySelector('iframe');
          if (iframe) {
            iframe.onload = () => {
              iframe.contentWindow.postMessage({ themeMode: actualTheme }, '*');
              iframe.contentWindow.postMessage({ lang: i18n.language }, '*');
            };
          }
        }
      } else {
        showError(message);
        setHomePageContent(t('加载首页内容失败...'));
      }
    } catch {
      setHomePageContent('');
      localStorage.removeItem('home_page_content');
    } finally {
      setHomePageContentLoaded(true);
    }
  };

  useEffect(() => {
    const checkNoticeAndShow = async () => {
      const lastCloseDate = localStorage.getItem('notice_close_date');
      const today = new Date().toDateString();
      if (lastCloseDate !== today) {
        try {
          const res = await API.get('/api/notice', {
            skipErrorHandler: true,
          });
          const { success, data } = res.data;
          if (success && data && data.trim() !== '') {
            setNoticeVisible(true);
          }
        } catch {
          // 公告接口不可用时忽略，避免影响默认首页展示。
        }
      }
    };

    checkNoticeAndShow();
  }, []);

  useEffect(() => {
    displayHomePageContent().then();
  }, []);

  return (
    <div className='w-full overflow-x-hidden'>
      <NoticeModal
        visible={noticeVisible}
        onClose={() => setNoticeVisible(false)}
        isMobile={isMobile}
      />
      {homePageContentLoaded && homePageContent === '' ? (
        <DefaultHome
          actualTheme={actualTheme}
          serverAddress={serverAddress}
        />
      ) : (
        <div className='overflow-x-hidden w-full'>
          {homePageContent.startsWith('https://') ? (
            <iframe
              src={homePageContent}
              className='w-full h-screen border-none'
            />
          ) : (
            <div
              className='mt-[60px]'
              dangerouslySetInnerHTML={{ __html: homePageContent }}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
