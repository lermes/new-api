/*
Copyright (C) 2023-2026 QuantumNous

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
import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  AlertTriangle,
  CircleHelp,
  Code2,
  FileText,
  Image,
  KeyRound,
  MessageCircle,
  TerminalSquare,
  Zap,
} from 'lucide-react'
import type { Element } from 'hast'
import {
  type BundledLanguage,
  codeToHtml,
  type ShikiTransformer,
} from 'shiki/bundle/web'
import { CopyButton } from '@/components/copy-button'
import { PublicLayout } from '@/components/layout'

type DocsSlug =
  | 'getting-started'
  | 'faq'
  | 'authentication'
  | 'models'
  | 'chat'
  | 'embeddings'
  | 'images'
  | 'gpt-image-2'
  | 'nano-banana-pro'
  | 'nano-banana-pro-edit'
  | 'claude-code'
  | 'claude-desktop'
  | 'codex'
  | 'opencode'
  | 'hermes'
  | 'trae'
  | 'error-handling'
  | 'examples'

type DocsLink = {
  label: string
  slug: DocsSlug
  icon?: React.ElementType
}

type DocsGroup = {
  title: string
  links: DocsLink[]
}

type CodeSample = {
  label: string
  language: BundledLanguage
  code: string
}

type TableRow = {
  name: string
  value: React.ReactNode
}

type DocsTableRow = React.ReactNode[]

const BASE_URL = 'https://api.infillm.com'
const API_BASE_URL = `${BASE_URL}/v1`
const DEFAULT_DOCS_SLUG: DocsSlug = 'getting-started'

const docsGroups: DocsGroup[] = [
  {
    title: '概览',
    links: [
      { label: '快速开始', slug: 'getting-started', icon: Zap },
      { label: '常见问题', slug: 'faq', icon: CircleHelp },
    ],
  },
  {
    title: '认证',
    links: [{ label: '身份认证', slug: 'authentication', icon: KeyRound }],
  },
  {
    title: 'API 参考',
    links: [
      { label: '获取模型列表', slug: 'models', icon: FileText },
      { label: '聊天完成', slug: 'chat', icon: MessageCircle },
      { label: '文本嵌入', slug: 'embeddings', icon: Code2 },
      { label: '图像生成', slug: 'images', icon: Image },
      { label: 'GPT Image 2', slug: 'gpt-image-2', icon: Image },
      { label: 'NanoBanana Pro', slug: 'nano-banana-pro', icon: Image },
      { label: 'NanoBananaPro Edit', slug: 'nano-banana-pro-edit', icon: Image },
    ],
  },
  {
    title: '指南',
    links: [
      { label: 'Claude Code 设置', slug: 'claude-code', icon: TerminalSquare },
      { label: 'Claude Desktop 设置', slug: 'claude-desktop', icon: TerminalSquare },
      { label: 'OpenAI Codex 设置', slug: 'codex', icon: TerminalSquare },
      { label: 'OpenCode 设置', slug: 'opencode', icon: TerminalSquare },
      { label: 'Hermes Agent 设置', slug: 'hermes', icon: TerminalSquare },
      { label: 'Trae 设置', slug: 'trae', icon: TerminalSquare },
      { label: '错误处理', slug: 'error-handling', icon: AlertTriangle },
      { label: '代码示例', slug: 'examples', icon: Code2 },
    ],
  },
]

const docsSlugs = docsGroups.flatMap((group) =>
  group.links.map((link) => link.slug)
)

function normalizeDocsSlug(slug: string | undefined): DocsSlug {
  return docsSlugs.includes(slug as DocsSlug)
    ? (slug as DocsSlug)
    : DEFAULT_DOCS_SLUG
}

function docsPath(slug: DocsSlug) {
  return `/docs/${slug}`
}

const quickstartSamples: CodeSample[] = [
  {
    label: 'Python',
    language: 'python',
    code: `from openai import OpenAI

client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="${API_BASE_URL}"
)

response = client.chat.completions.create(
    model="google/gemini-2.5-flash",
    messages=[
        {"role": "user", "content": "Hello!"}
    ]
)

print(response.choices[0].message.content)`,
  },
  {
    label: 'TypeScript',
    language: 'typescript',
    code: `import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "YOUR_API_KEY",
  baseURL: "${API_BASE_URL}",
});

const response = await client.chat.completions.create({
  model: "google/gemini-2.5-flash",
  messages: [{ role: "user", content: "Hello!" }],
});

console.log(response.choices[0].message.content);`,
  },
  {
    label: 'Curl',
    language: 'bash',
    code: `curl ${API_BASE_URL}/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "model": "google/gemini-2.5-flash",
    "messages": [
      {"role": "user", "content": "Hello!"}
    ]
  }'`,
  },
]

const lineNumberTransformer: ShikiTransformer = {
  name: 'docs-line-numbers',
  line(node: Element, line: number) {
    node.children.unshift({
      type: 'element',
      tagName: 'span',
      properties: {
        className: [
          'mr-4',
          'inline-block',
          'w-8',
          'select-none',
          'text-right',
          'text-slate-500',
        ],
      },
      children: [{ type: 'text', value: String(line) }],
    })
  },
}

function InlineCode(props: { children: React.ReactNode }) {
  return (
    <code className='border-border bg-muted rounded-md border px-1.5 py-0.5 font-mono text-[0.9em] text-foreground'>
      {props.children}
    </code>
  )
}

function InfinityAccountLink() {
  return (
    <a href='https://infillm.com/profile' target='_blank' rel='noreferrer'>
      Infinity 账户
    </a>
  )
}

function InfinityApiKeyLink() {
  return (
    <a href='https://infillm.com/keys' target='_blank' rel='noreferrer'>
      Infinity API Key
    </a>
  )
}

function CodeBlock(props: {
  code: string
  language?: BundledLanguage
  showLineNumbers?: boolean
  showCopy?: boolean
  className?: string
}) {
  const {
    code,
    language = 'bash',
    showLineNumbers = true,
    showCopy = true,
    className,
  } = props
  const [html, setHtml] = useState('')

  useEffect(() => {
    let cancelled = false
    codeToHtml(code, {
      lang: language,
      theme: 'one-dark-pro',
      transformers: showLineNumbers ? [lineNumberTransformer] : [],
    }).then((next) => {
      if (!cancelled) setHtml(next)
    })
    return () => {
      cancelled = true
    }
  }, [code, language, showLineNumbers])

  return (
    <div
      className={[
        'docs-code group relative my-5 overflow-hidden rounded-lg bg-[#1e1e1e] shadow-lg ring-1 ring-black/10',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {showCopy ? (
        <CopyButton
          value={code}
          tooltip='复制代码'
          successTooltip='已复制'
          className='absolute top-3 right-3 z-10 size-8 border border-white/10 bg-white/5 text-slate-300 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-white/10 hover:text-white'
        />
      ) : null}
      <div
        className='overflow-x-auto'
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Shiki returns trusted highlighted code for local samples.
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}

function CodeExample(props: { samples: CodeSample[] }) {
  const [active, setActive] = useState(props.samples[0]?.label ?? '')
  const sample =
    props.samples.find((item) => item.label === active) ?? props.samples[0]

  if (!sample) return null

  return (
    <div className='my-5 overflow-hidden rounded-lg bg-[#252526] shadow-lg ring-1 ring-black/10'>
      <div className='flex items-center justify-between overflow-x-auto border-b border-white/10 px-3'>
        <div className='flex'>
          {props.samples.map((item) => (
            <button
              key={item.label}
              type='button'
              onClick={() => setActive(item.label)}
              className={[
                'px-4 py-3 text-sm font-medium transition-colors',
                item.label === sample.label
                  ? 'border-b-2 border-blue-500 bg-[#1e1e1e] text-white'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white',
              ].join(' ')}
            >
              {item.label}
            </button>
          ))}
        </div>
        <CopyButton
          value={sample.code}
          tooltip='复制代码'
          successTooltip='已复制'
          className='size-8 text-slate-300 hover:bg-white/10 hover:text-white'
        />
      </div>
      <CodeBlock
        code={sample.code}
        language={sample.language}
        showLineNumbers
        showCopy={false}
        className='my-0 rounded-none shadow-none ring-0'
      />
    </div>
  )
}

function InfoBlock(props: { children: React.ReactNode }) {
  return (
    <blockquote className='border-primary/40 bg-muted/40 my-6 rounded-r-lg border-l-4 px-5 py-4 text-[15px] leading-7 text-muted-foreground'>
      {props.children}
    </blockquote>
  )
}

function ConfigTable(props: { rows: TableRow[] }) {
  return (
    <div className='border-border my-5 overflow-hidden rounded-lg border'>
      <table className='w-full border-collapse text-left text-sm'>
        <tbody>
          {props.rows.map((row) => (
            <tr key={row.name} className='border-border border-b last:border-b-0'>
              <th className='bg-muted/40 w-40 px-4 py-3 text-left font-medium text-foreground'>
                {row.name}
              </th>
              <td className='px-4 py-3 text-muted-foreground'>{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ParamTable(props: { rows: TableRow[] }) {
  return (
    <div className='border-border my-5 overflow-hidden rounded-lg border'>
      <table className='w-full border-collapse text-left text-sm'>
        <thead className='bg-muted/60 text-muted-foreground'>
          <tr>
            <th className='w-36 px-4 py-3 font-medium'>参数</th>
            <th className='px-4 py-3 font-medium'>说明</th>
          </tr>
        </thead>
        <tbody>
          {props.rows.map((row) => (
            <tr key={row.name} className='border-border border-t'>
              <td className='px-4 py-3 font-medium text-foreground'>
                {row.name}
              </td>
              <td className='px-4 py-3 text-muted-foreground'>{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function DocsTable(props: { headers: string[]; rows: DocsTableRow[] }) {
  return (
    <div className='border-border my-5 overflow-x-auto rounded-lg border'>
      <table className='w-full min-w-[560px] border-collapse text-left text-sm'>
        <thead className='bg-muted/60 text-muted-foreground'>
          <tr>
            {props.headers.map((header) => (
              <th key={header} className='px-4 py-3 font-medium'>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {props.rows.map((row, rowIndex) => (
            <tr
              // biome-ignore lint/suspicious/noArrayIndexKey: Static documentation rows do not reorder.
              key={rowIndex}
              className='border-border border-t'
            >
              {row.map((cell, cellIndex) => (
                <td
                  // biome-ignore lint/suspicious/noArrayIndexKey: Static documentation cells do not reorder.
                  key={cellIndex}
                  className='px-4 py-3 text-muted-foreground'
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Sidebar(props: { activeSlug: DocsSlug }) {
  return (
    <aside className='border-border max-h-[46svh] overflow-y-auto border-b bg-transparent lg:fixed lg:top-16 lg:bottom-0 lg:left-0 lg:max-h-none lg:w-[292px] lg:overflow-y-auto lg:border-r lg:border-b-0'>
      <div className='flex min-h-full flex-col'>
        <nav className='flex-1 space-y-7 px-6 py-8 text-sm lg:py-12'>
          {docsGroups.map((group) => (
            <section key={group.title}>
              <div className='mb-3 px-0 text-sm font-bold tracking-wide text-muted-foreground'>
                {group.title}
              </div>
              <div className='space-y-1.5'>
                {group.links.map((link) => {
                  const Icon = link.icon
                  const isActive = props.activeSlug === link.slug
                  const className = [
                    'flex items-center gap-3 rounded-md px-3 py-2.5 text-[13px] transition-colors',
                    isActive
                      ? 'bg-muted text-foreground font-semibold'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  ].join(' ')

                  return (
                    <Link
                      key={link.slug}
                      to={docsPath(link.slug)}
                      className={className}
                    >
                      {Icon ? <Icon className='size-4 shrink-0' /> : null}
                      <span>{link.label}</span>
                    </Link>
                  )
                })}
              </div>
            </section>
          ))}
        </nav>
      </div>
    </aside>
  )
}

function GettingStartedPage() {
  return (
    <>
      <p>
        通过统一 API 接口访问多种 AI 模型。创建 API Key 后，将客户端地址改为{' '}
        <InlineCode>{API_BASE_URL}</InlineCode>，几分钟内即可完成接入。
      </p>
      <InfoBlock>
        模型列表会根据 API 令牌所在分组过滤；如果看不到某个模型，请先检查令牌分组。
      </InfoBlock>
      <h2>使用 OpenAI SDK</h2>
      <p>
        最简单的方式是使用官方 OpenAI SDK。已有 OpenAI 接入时，通常只需要修改{' '}
        <InlineCode>base_url</InlineCode> 或 <InlineCode>baseURL</InlineCode>。
      </p>
      <CodeExample samples={quickstartSamples} />
      <h2>直接使用 API</h2>
      <p>也可以使用 HTTP 请求直接调用 API。下面示例已经将原站点域名替换为当前服务地址。</p>
      <CodeExample
        samples={[
          {
            label: 'Python',
            language: 'python',
            code: `import requests

response = requests.post(
    "${API_BASE_URL}/chat/completions",
    headers={
        "Authorization": "Bearer YOUR_API_KEY",
        "Content-Type": "application/json",
    },
    json={
        "model": "google/gemini-2.5-flash",
        "messages": [{"role": "user", "content": "Hello!"}],
    },
)

print(response.json())`,
          },
          {
            label: 'TypeScript',
            language: 'typescript',
            code: `const response = await fetch("${API_BASE_URL}/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "google/gemini-2.5-flash",
    messages: [{ role: "user", content: "Hello!" }],
  }),
});

const data = await response.json();
console.log(data);`,
          },
          {
            label: 'Curl',
            language: 'bash',
            code: `curl ${API_BASE_URL}/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "model": "google/gemini-2.5-flash",
    "messages": [
      {"role": "user", "content": "Hello!"}
    ]
  }'`,
          },
        ]}
      />
      <h2>下一步</h2>
      <p>
        API 支持流式传输、批量处理等高级能力。继续阅读聊天完成、图像接口和各类桌面 /
        CLI 工具配置，可以覆盖绝大多数接入场景。
      </p>
      <h2>支持的模型</h2>
      <p>支持多种 AI 模型，包括但不限于：</p>
      <h3>OpenAI 模型</h3>
      <ul>
        <li>GPT-4、GPT-4 Turbo、GPT-3.5 Turbo。</li>
        <li>也可以使用 <InlineCode>openai/</InlineCode> 前缀模型名。</li>
      </ul>
      <h3>Anthropic 模型</h3>
      <ul>
        <li>Claude-3 Opus、Claude-3 Sonnet、Claude-3 Haiku。</li>
        <li>Claude 系列也提供适配不同工具的命名方式。</li>
      </ul>
      <h3>其他模型</h3>
      <ul>
        <li>Gemini Pro、Llama、DeepSeek、Grok、Kimi、MiniMax、GLM、Qwen 等。</li>
        <li>图像能力包括 GPT Image 2、NanoBanana Pro 和编辑模型。</li>
      </ul>
    </>
  )
}

function FaqPage() {
  return (
    <>
      <h2>在中国大陆需要代理才能连接吗？</h2>
      <p>通常不需要代理就能连接。若遇到网络超时，请检查本地网络、DNS 和防火墙策略。</p>
      <h2>模型支持缓存吗？</h2>
      <p>
        支持。Claude 全系列支持缓存，命中缓存后可降低重复上下文成本；其他模型也可按后台配置支持缓存。
      </p>
      <h2>充值和消费汇率如何理解？</h2>
      <p>充值、余额和消费折扣以控制台展示为准。高频调用前建议先用小额度请求确认计费结果。</p>
    </>
  )
}

function AuthenticationPage() {
  return (
    <>
      <p>
        所有 API 请求都需要进行身份认证。请求头使用 Bearer Token，Token 来自控制台创建的
        API 令牌。
      </p>
      <h2>获取 API 密钥</h2>
      <ol>
        <li>登录账户并进入控制台。</li>
        <li>进入控制台 → API 令牌页面。</li>
        <li>新建令牌，设置名称、额度和可用分组。</li>
        <li>复制生成的密钥，并保存到安全位置。</li>
      </ol>
      <h2>代码示例</h2>
      <CodeExample
        samples={[
          {
            label: 'cURL',
            language: 'bash',
            code: `curl ${API_BASE_URL}/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "model": "google/gemini-2.5-flash",
    "messages": [
      {
        "role": "user",
        "content": "Hello!"
      }
    ]
  }'`,
          },
          {
            label: 'Python',
            language: 'python',
            code: `import requests

headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json",
}

response = requests.post(
    "${API_BASE_URL}/chat/completions",
    headers=headers,
    json={
        "model": "google/gemini-2.5-flash",
        "messages": [{"role": "user", "content": "Hello!"}],
    },
)

print(response.json())`,
          },
          {
            label: 'TypeScript',
            language: 'typescript',
            code: `const response = await fetch("${API_BASE_URL}/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "google/gemini-2.5-flash",
    messages: [{ role: "user", content: "Hello!" }],
  }),
});

const data = await response.json();
console.log(data);`,
          },
        ]}
      />
      <h2>安全注意事项</h2>
      <ul>
        <li>不要在浏览器端、移动端包体或公开仓库中硬编码完整密钥。</li>
        <li>生产环境建议通过环境变量或密钥管理服务注入。</li>
        <li>密钥泄露后应立即删除并重新生成。</li>
        <li>为不同应用创建不同令牌，便于限额、审计和回收。</li>
      </ul>
      <h2>常见错误</h2>
      <ul>
        <li>401：密钥错误、过期、复制不完整或多了空格。</li>
        <li>403：账户或令牌分组没有访问对应模型的权限。</li>
      </ul>
    </>
  )
}

function ModelsPage() {
  return (
    <>
      <p>模型列表接口返回当前 API Key 可访问的所有 AI 模型，包括模型 ID、提供商和支持端点。</p>
      <InfoBlock>返回结果取决于 API 令牌所在分组。创建令牌时请选择对应的令牌分组。</InfoBlock>
      <h2>API 端点</h2>
        <p>
            <InlineCode>GET {API_BASE_URL}/models</InlineCode>
        </p>
      <h2>请求示例</h2>
      <CodeExample
        samples={[
          {
            label: 'cURL',
            language: 'bash',
            code: `curl -X GET "${API_BASE_URL}/models" \\
  -H "Authorization: Bearer sk-your-api-token-here" \\
  -H "Content-Type: application/json"`,
          },
          {
            label: 'Python',
            language: 'python',
            code: `import requests

url = "${API_BASE_URL}/models"
headers = {
    "Authorization": "Bearer sk-your-api-token-here",
    "Content-Type": "application/json",
}

response = requests.get(url, headers=headers)
print(response.json())`,
          },
          {
            label: 'TypeScript',
            language: 'typescript',
            code: `const response = await fetch("${API_BASE_URL}/models", {
  method: "GET",
  headers: {
    "Authorization": "Bearer sk-your-api-token-here",
    "Content-Type": "application/json",
  },
});

const data = await response.json();
console.log(data);`,
          },
        ]}
      />
      <h2>响应格式</h2>
      <h3>成功响应 (200 OK)</h3>
      <CodeBlock
        language='json'
        code={`{
  "success": true,
  "data": [
    {
      "id": "gpt-4",
      "object": "model",
      "created": 1626777600,
      "owned_by": "openai",
      "supported_endpoint_types": ["chat", "completion"]
    },
    {
      "id": "claude-3-sonnet-20240229",
      "object": "model",
      "created": 1626777600,
      "owned_by": "anthropic",
      "supported_endpoint_types": ["chat"]
    }
  ]
}`}
      />
      <h2>响应字段说明</h2>
      <p>顶层字段：</p>
      <ul>
        <li><InlineCode>success</InlineCode>：布尔值，表示请求是否成功。</li>
        <li><InlineCode>data</InlineCode>：模型列表数组，仅在成功时返回。</li>
        <li><InlineCode>message</InlineCode>：错误信息，仅在失败时返回。</li>
      </ul>
      <p>模型对象字段：</p>
      <ParamTable
        rows={[
          { name: 'id', value: '模型唯一标识，调用接口时填写到 model 字段。' },
          { name: 'object', value: '对象类型，通常固定为 model。' },
          { name: 'created', value: '模型创建时间戳。' },
          { name: 'owned_by', value: '模型所属服务商或上游通道标识。' },
          { name: 'supported_endpoint_types', value: '模型支持的端点类型，例如 chat、embedding、image。' },
        ]}
      />
      <h2>支持的端点类型</h2>
      <ul>
        <li><InlineCode>chat</InlineCode>：聊天完成。</li>
        <li><InlineCode>completion</InlineCode>：文本完成。</li>
        <li><InlineCode>embedding</InlineCode>：文本嵌入。</li>
        <li><InlineCode>image</InlineCode>：图像生成或编辑。</li>
        <li><InlineCode>audio</InlineCode>：音频处理。</li>
        <li><InlineCode>rerank</InlineCode>：重排序。</li>
      </ul>
      <h2>注意事项</h2>
      <p>必须提供有效 API 令牌，令牌决定用户可访问哪些模型。</p>
      <p>返回模型列表会基于用户组和令牌组过滤，只显示当前令牌有权限访问的模型。</p>
      <h2>常见错误</h2>
      <ul>
        <li>401 Unauthorized：令牌无效。</li>
        <li>403 Forbidden：当前账户或令牌没有模型列表访问权限。</li>
        <li>500 Internal Server Error：服务端或上游配置异常。</li>
      </ul>
    </>
  )
}

function ChatPage() {
  return (
    <>
      <p>聊天完成接口用于创建对话式响应，兼容 OpenAI Chat Completions 请求格式。</p>
      <h2>创建聊天完成</h2>
      <p>
        <InlineCode>POST {API_BASE_URL}/chat/completions</InlineCode>
      </p>
      <CodeExample
        samples={[
          {
            label: 'cURL',
            language: 'bash',
            code: `curl ${API_BASE_URL}/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "model": "gpt-4",
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "What is the capital of France?"}
    ],
    "temperature": 0.7
  }'`,
          },
          {
            label: 'Python',
            language: 'python',
            code: `from openai import OpenAI

client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="${API_BASE_URL}",
)

response = client.chat.completions.create(
    model="gpt-4",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "What is the capital of France?"},
    ],
    temperature=0.7,
)

print(response.choices[0].message.content)`,
          },
          {
            label: 'TypeScript',
            language: 'typescript',
            code: `import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "${API_BASE_URL}",
});

const response = await client.chat.completions.create({
  model: "gpt-4",
  messages: [
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: "What is the capital of France?" },
  ],
  temperature: 0.7,
});

console.log(response.choices[0].message.content);`,
          },
        ]}
      />
      <h2>请求参数</h2>
      <DocsTable
        headers={['参数', '类型', '必需', '描述']}
        rows={[
          ['model', 'string', '是', '要使用的模型 ID。'],
          ['messages', 'array', '是', '消息对象数组。'],
          ['temperature', 'number', '否', '采样温度，范围通常为 0-2，默认值为 1。'],
          ['max_tokens', 'integer', '否', '生成的最大令牌数。'],
          ['top_p', 'number', '否', '核采样参数。'],
          ['stream', 'boolean', '否', '是否流式传输响应。'],
        ]}
      />
      <h2>消息角色</h2>
      <ul>
        <li><InlineCode>system</InlineCode>：设置助手行为和边界。</li>
        <li><InlineCode>user</InlineCode>：用户输入。</li>
        <li><InlineCode>assistant</InlineCode>：历史模型回复。</li>
      </ul>
      <h2>流式响应</h2>
      <p>启用流式传输后可以增量接收响应。</p>
      <CodeExample
        samples={[
          {
            label: 'Python',
            language: 'python',
            code: `from openai import OpenAI

client = OpenAI(api_key="YOUR_API_KEY", base_url="${API_BASE_URL}")

stream = client.chat.completions.create(
    model="gpt-4",
    messages=[{"role": "user", "content": "Tell me a story"}],
    stream=True
)

for chunk in stream:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")`,
          },
          {
            label: 'TypeScript',
            language: 'typescript',
            code: `const stream = await client.chat.completions.create({
  model: "gpt-4",
  messages: [{ role: "user", content: "Tell me a story" }],
  stream: true,
});

for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content || "");
}`,
          },
        ]}
      />
      <h2>最佳实践</h2>
      <ul>
        <li>为生产请求设置合理的 <InlineCode>max_tokens</InlineCode>。</li>
        <li>事实性任务使用较低 temperature，创意任务可以适当提高。</li>
        <li>长对话需要裁剪历史或做摘要，避免超过模型上下文窗口。</li>
      </ul>
    </>
  )
}

function EmbeddingsPage() {
  return (
    <>
      <p>文本嵌入接口会把文本转换为向量，常用于语义搜索、推荐、聚类和 RAG 召回。</p>
      <h2>创建嵌入</h2>
      <p>
        <InlineCode>POST {API_BASE_URL}/embeddings</InlineCode>
      </p>
      <CodeExample
        samples={[
          {
            label: 'Python',
            language: 'python',
            code: `from openai import OpenAI

client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="${API_BASE_URL}",
)

response = client.embeddings.create(
    model="text-embedding-3-small",
    input="Your text here"
)

embedding = response.data[0].embedding
print(f"Embedding dimension: {len(embedding)}")`,
          },
          {
            label: 'cURL',
            language: 'bash',
            code: `curl ${API_BASE_URL}/embeddings \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "text-embedding-3-small",
    "input": "Your text here"
  }'`,
          },
        ]}
      />
      <InfoBlock>嵌入向量适合用于相似度搜索，不适合直接展示给最终用户。</InfoBlock>
    </>
  )
}

function ImagesPage() {
  return (
    <>
      <p>当前支持以下图像相关能力，请点击对应页面查看使用说明与接入方式。</p>
      <h2>图像生成</h2>
      <p>GPT Image 2：通过 OpenAI 兼容图像接口生成与编辑图片。</p>
      <p>NanoBanana Pro：根据文本描述生成图像。</p>
      <h2>图像编辑</h2>
      <p>GPT Image 2：支持参考图、蒙版编辑与流式局部图片兼容参数。</p>
      <p>NanoBananaPro Edit：在已有图像基础上进行编辑与修改。</p>
    </>
  )
}

function GptImagePage() {
  return (
    <>
      <p>
        GPT Image 2 是 GPT Image 图像生成与编辑模型，通过 OpenAI 兼容图像接口提供能力。
        使用官方 OpenAI SDK 时，只需要把 <InlineCode>base_url</InlineCode> /{' '}
        <InlineCode>baseURL</InlineCode> 改为 <InlineCode>{API_BASE_URL}</InlineCode>。
      </p>
      <ul>
        <li>生图端点：<InlineCode>POST {API_BASE_URL}/images/generations</InlineCode></li>
        <li>编辑端点：<InlineCode>POST {API_BASE_URL}/images/edits</InlineCode></li>
        <li>模型：<InlineCode>gpt-image-2</InlineCode></li>
      </ul>
      <h2>选择接口</h2>
      <p>如果只需要通过一次请求生成或编辑图片，使用 Image API 即可，这也是大多数接入场景推荐的方式。</p>
      <p>
        OpenAI 官方还提供了 Responses API 的图片生成工具，适合对话式、多步骤图片工作流。
        如果业务需要多轮改图，请先确认当前模型与端点是否支持 Responses API。
      </p>
      <h2>生成图片</h2>
      <p>
        Image API 会在 <InlineCode>data[0].b64_json</InlineCode> 返回 base64 图片数据，
        解码后写入文件即可。
      </p>
      <CodeExample
        samples={[
          {
            label: 'Python',
            language: 'python',
            code: `from openai import OpenAI
import base64

client = OpenAI(api_key="YOUR_API_KEY", base_url="${API_BASE_URL}")

result = client.images.generate(
    model="gpt-image-2",
    prompt="一张干净的产品摄影图，白色背景上有一盏哑光黑色智能台灯",
    size="1024x1024",
    quality="medium",
)

image_bytes = base64.b64decode(result.data[0].b64_json)
with open("lamp.png", "wb") as f:
    f.write(image_bytes)`,
          },
          {
            label: 'TypeScript',
            language: 'typescript',
            code: `import fs from "fs";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "${API_BASE_URL}",
});

const result = await client.images.generate({
  model: "gpt-image-2",
  prompt: "一张干净的产品摄影图，白色背景上有一盏哑光黑色智能台灯",
  size: "1024x1024",
  quality: "medium",
});

fs.writeFileSync("lamp.png", Buffer.from(result.data[0].b64_json, "base64"));`,
          },
          {
            label: 'cURL',
            language: 'bash',
            code: `curl -X POST "${API_BASE_URL}/images/generations" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-image-2",
    "prompt": "一张干净的产品摄影图，白色背景上有一盏哑光黑色智能台灯",
    "size": "1024x1024",
    "quality": "medium"
  }' | jq -r '.data[0].b64_json' | base64 --decode > lamp.png`,
          },
        ]}
      />
      <h3>已验证示例输出</h3>
      <p>示例会从 <InlineCode>data[0].b64_json</InlineCode> 解码并保存为 PNG 文件。</p>
      <h2>使用参考图编辑</h2>
      <p>将一张或多张图片传给 <InlineCode>images.edit</InlineCode>，再用文字描述希望得到的结果。多张输入图片可以作为新构图参考。</p>
      <CodeExample
        samples={[
          {
            label: 'Python',
            language: 'python',
            code: `from openai import OpenAI
import base64

client = OpenAI(api_key="YOUR_API_KEY", base_url="${API_BASE_URL}")

result = client.images.edit(
    model="gpt-image-2",
    image=[open("product.png", "rb"), open("background.png", "rb")],
    prompt="把产品放到桌面上，保持真实光照。",
    size="1536x1024",
    quality="high",
)

with open("edited-product.png", "wb") as f:
    f.write(base64.b64decode(result.data[0].b64_json))`,
          },
          {
            label: 'TypeScript',
            language: 'typescript',
            code: `import fs from "fs";
import OpenAI, { toFile } from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "${API_BASE_URL}",
});

const images = await Promise.all([
  toFile(fs.createReadStream("product.png"), null, { type: "image/png" }),
  toFile(fs.createReadStream("background.png"), null, { type: "image/png" }),
]);

const result = await client.images.edit({
  model: "gpt-image-2",
  image: images,
  prompt: "把第一张图中的产品放到第二张图的桌面上，保持真实光照。",
  size: "1536x1024",
  quality: "high",
});

fs.writeFileSync("edited-product.png", Buffer.from(result.data[0].b64_json, "base64"));`,
          },
          {
            label: 'cURL',
            language: 'bash',
            code: `curl -X POST "${API_BASE_URL}/images/edits" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -F "model=gpt-image-2" \\
  -F "image[]=@product.png" \\
  -F "image[]=@background.png" \\
  -F "prompt=把第一张图中的产品放到第二张图的桌面上，保持真实光照。" \\
  -F "size=1536x1024" \\
  -F "quality=high" \\
  | jq -r '.data[0].b64_json' | base64 --decode > edited-product.png`,
          },
        ]}
      />
      <h3>已验证参考图编辑</h3>
      <p>示例将产品图和桌面背景图合成，返回一张新的 1536x1024 PNG。</p>
      <h2>使用蒙版编辑</h2>
      <p>如果只希望修改指定区域，可以传入与原图尺寸一致、包含 alpha 通道的 mask 文件。</p>
      <CodeExample
        samples={[
          {
            label: 'Python',
            language: 'python',
            code: `from openai import OpenAI
import base64

client = OpenAI(api_key="YOUR_API_KEY", base_url="${API_BASE_URL}")

result = client.images.edit(
    model="gpt-image-2",
    image=open("room.png", "rb"),
    mask=open("mask.png", "rb"),
    prompt="把蒙版区域替换成一个现代胡桃木书架。",
)

image_bytes = base64.b64decode(result.data[0].b64_json)
with open("room-bookshelf.png", "wb") as f:
    f.write(image_bytes)`,
          },
          {
            label: 'cURL',
            language: 'bash',
            code: `curl -X POST "${API_BASE_URL}/images/edits" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -F "model=gpt-image-2" \\
  -F "image[]=@room.png" \\
  -F "mask=@mask.png" \\
  -F "prompt=把蒙版区域替换成一个现代胡桃木书架。" \\
  | jq -r '.data[0].b64_json' | base64 --decode > room-bookshelf.png`,
          },
        ]}
      />
      <h3>已验证蒙版编辑</h3>
      <p>mask 图片使用 alpha 通道标记可编辑区域，接口返回结果是普通 PNG。</p>
      <h2>流式返回局部图片</h2>
      <p>
        上游接口文档中提供 <InlineCode>stream</InlineCode> 和{' '}
        <InlineCode>partial_images</InlineCode>，用于在最终图完成前接收中间图片。
        这是兼容性相关能力；除非确认当前端点已经支持流式图片事件，否则建议使用标准非流式调用。
      </p>
      <p>
        即使传入 <InlineCode>stream: true</InlineCode> 和{' '}
        <InlineCode>partial_images</InlineCode>，响应也可能仍然是普通最终 JSON，并通过{' '}
        <InlineCode>data[0].b64_json</InlineCode> 返回图片。
      </p>
      <h2>输出选项</h2>
      <DocsTable
        headers={['参数', '可选值', '说明']}
        rows={[
          ['size', 'auto、1024x1024、1536x1024、1024x1536、2048x2048、2048x1152、3840x2160、2160x3840，或其他符合约束的自定义尺寸', '每条边必须是 16 px 的倍数，最长边不超过 3840 px，比例不超过 3:1，总像素数需在 655,360 到 8,294,400 之间。'],
          ['quality', 'auto、low、medium、high', '草稿和快速迭代可用 low，最终素材建议用 medium 或 high。'],
          ['output_format', 'png、jpeg、webp', '默认 png。不需要透明背景时，jpeg 通常更快。'],
          ['output_compression', '0 到 100', '仅适用于 jpeg 和 webp。'],
          ['background', 'auto、不透明背景选项', 'gpt-image-2 当前不支持 background: "transparent"。'],
          ['stream、partial_images', '兼容性相关', '可能返回普通最终 JSON，而不是流式局部图片事件。'],
          ['moderation', 'auto、low', 'auto 是默认过滤级别。'],
        ]}
      />
      <h2>注意事项与限制</h2>
      <ul>
        <li>复杂 prompt 可能需要更长处理时间，业务侧建议设置合理超时或后台任务。</li>
        <li>文字渲染能力已有提升，但仍不能保证完全准确；Logo、标签、UI mockup 等场景需要人工检查。</li>
        <li>跨多次生成时，角色、精确布局、品牌细节可能无法完全保持一致。</li>
        <li>使用 gpt-image-2 编辑图片时不要传 <InlineCode>input_fidelity</InlineCode>。</li>
        <li>蒙版是对编辑区域的引导，不等于像素级精确选区。</li>
      </ul>
    </>
  )
}

function NanoBananaPage() {
  return (
    <>
      <p>
        NanoBanana Pro 是 Gemini 的图像生成服务，支持多种宽高比和分辨率。不同分辨率价格相同，
        但 4K 图生成速度较慢，不建议默认使用。
      </p>
      <ul>
        <li>端点：<InlineCode>POST {BASE_URL}/v1beta/models/gemini-3-pro-image-preview:generateContent</InlineCode></li>
        <li>模型：<InlineCode>gemini-3-pro-image-preview</InlineCode></li>
      </ul>
      <h2>示例代码</h2>
      <p>
        请求体 <InlineCode>contents</InlineCode> 中传入文本描述，<InlineCode>generationConfig</InlineCode>{' '}
        中设置 <InlineCode>responseModalities</InlineCode> 和 <InlineCode>imageConfig</InlineCode>。
        Python SDK 使用下划线命名，REST / cURL 使用驼峰命名。
      </p>
      <CodeExample
        samples={[
          {
            label: 'Python',
            language: 'python',
            code: `from google import genai
from google.genai import types
import base64

client = genai.Client(
    api_key="YOUR_API_KEY",
    http_options=types.HttpOptions(api_version="v1beta", base_url="${BASE_URL}"),
)

response = client.models.generate_content(
    model="gemini-3-pro-image-preview",
    contents="生成一只可爱的小海獭图片",
    config=types.GenerateContentConfig(
        response_modalities=["IMAGE"],
        image_config=types.ImageConfig(
            aspect_ratio="1:1",
            image_size="2K",
        ),
    ),
)

for part in response.candidates[0].content.parts:
    if part.inline_data:
        with open("gemini_sdk_generated.png", "wb") as f:
            f.write(part.inline_data.data)`,
          },
          {
            label: 'TypeScript',
            language: 'typescript',
            code: `import fs from "fs";

const response = await fetch("${BASE_URL}/v1beta/models/gemini-3-pro-image-preview:generateContent", {
  method: "POST",
  headers: {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    contents: [{ parts: [{ text: "生成一只可爱的小海獭图片" }] }],
    systemInstruction: { parts: [{ text: "You are a helpful assistant." }] },
    generationConfig: {
      responseModalities: ["IMAGE"],
      imageConfig: {
        aspectRatio: "1:1",
        imageSize: "2K",
      },
    },
  }),
});

const data = await response.json();
const part = data.candidates[0].content.parts.find((item) => item.inlineData);
fs.writeFileSync("gemini_sdk_generated.png", Buffer.from(part.inlineData.data, "base64"));`,
          },
          {
            label: 'cURL',
            language: 'bash',
            code: `curl -X POST "${BASE_URL}/v1beta/models/gemini-3-pro-image-preview:generateContent" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "contents": [{"parts": [{"text": "生成一只可爱的小海獭图片"}]}],
    "systemInstruction": {"parts": [{"text": "You are a helpful assistant."}]},
    "generationConfig": {
      "responseModalities": ["IMAGE"],
      "imageConfig": {
        "aspectRatio": "1:1",
        "imageSize": "2K"
      }
    }
  }'`,
          },
        ]}
      />
      <h3>cURL 图像参数</h3>
      <p>下面列出的是 cURL 请求里的参数名；使用 Python SDK 时请改成下划线写法。</p>
      <DocsTable
        headers={['参数', '可选值', '说明']}
        rows={[
          ['imageConfig.aspectRatio', '1:1、2:3、3:2、3:4、4:3、4:5、5:4、9:16、16:9、21:9', '控制输出图宽高比。'],
          ['imageConfig.imageSize', '1K、2K、4K', '控制输出分辨率。4K 更慢，不建议默认使用。'],
          ['responseModalities', '["IMAGE"] 或 ["TEXT", "IMAGE"]', '决定返回文本、图片或两者。'],
          ['systemInstruction', '文本指令', '可选，用于设定模型行为。'],
          ['temperature / topP / topK', '采样参数', '可按 Gemini 兼容格式传入。'],
        ]}
      />
      <h2>如何开启谷歌搜索？</h2>
      <p>仅 Gemini 格式支持启用谷歌搜索。在配置中传入 <InlineCode>tools</InlineCode> 即可，模型会按需调用实时网络信息并返回带引用的回答。</p>
      <p>不建议默认开启：开启后会增加延迟与计费，对纯生图场景无帮助。若无实时检索需求，建议关闭搜索。</p>
      <CodeBlock
        language='json'
        code={`{
  "tools": [
    {
      "googleSearch": {}
    }
  ]
}`}
      />
      <h2>常见问题</h2>
      <ul>
        <li>响应里没有图片：确认模型为 <InlineCode>gemini-3-pro-image-preview</InlineCode>，且 prompt 是清晰的图像描述。</li>
        <li>解码失败：只截取 <InlineCode>data:image/...;base64,</InlineCode> 后面的 base64 字符串，并去掉换行再解码。</li>
      </ul>
    </>
  )
}

function NanoBananaEditPage() {
  return (
    <>
      <p>
        图片编辑与 NanoBanana Pro 生图使用同一套 Gemini API，只是请求里需要带上原图与编辑指令，
        响应中返回编辑后的图片。
      </p>
      <ul>
        <li>端点：<InlineCode>POST {BASE_URL}/v1beta/models/gemini-3-pro-image-preview:generateContent</InlineCode></li>
        <li>要点：<InlineCode>contents</InlineCode> 中传入图片 part 与文本 part。</li>
        <li><InlineCode>generationConfig.responseModalities</InlineCode> 建议设为 <InlineCode>["TEXT", "IMAGE"]</InlineCode>。</li>
      </ul>
      <h2>示例代码</h2>
      <p>Python 使用下划线命名，REST / cURL 使用驼峰命名，含义相同。</p>
      <CodeExample
        samples={[
          {
            label: 'Python',
            language: 'python',
            code: `from google import genai
from google.genai import types
from PIL import Image

client = genai.Client(
    api_key="YOUR_API_KEY",
    http_options=types.HttpOptions(api_version="v1beta", base_url="${BASE_URL}"),
)

image = Image.open("original.png")
response = client.models.generate_content(
    model="gemini-3-pro-image-preview",
    contents=["给这张图加上一顶时尚的礼帽，保持其余部分不变。", image],
    config=types.GenerateContentConfig(response_modalities=["TEXT", "IMAGE"]),
)

for part in response.candidates[0].content.parts:
    if part.inline_data:
        with open("edited.png", "wb") as f:
            f.write(part.inline_data.data)`,
          },
          {
            label: 'TypeScript',
            language: 'typescript',
            code: `import fs from "fs";

const imageBase64 = fs.readFileSync("original.png").toString("base64");
const response = await fetch("${BASE_URL}/v1beta/models/gemini-3-pro-image-preview:generateContent", {
  method: "POST",
  headers: {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    contents: [{
      parts: [
        { inlineData: { mimeType: "image/png", data: imageBase64 } },
        { text: "给这张图加上一顶时尚的礼帽，保持其余部分不变。" },
      ],
    }],
    generationConfig: {
      responseModalities: ["TEXT", "IMAGE"],
    },
  }),
});

const data = await response.json();
const part = data.candidates[0].content.parts.find((item) => item.inlineData);
fs.writeFileSync("edited.png", Buffer.from(part.inlineData.data, "base64"));`,
          },
          {
            label: 'cURL',
            language: 'bash',
            code: `# 先将原图转为 base64，再放入 contents.parts
# 例：IMAGE_B64=$(base64 -w0 original.png)
curl -X POST "${BASE_URL}/v1beta/models/gemini-3-pro-image-preview:generateContent" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "contents": [{
      "parts": [
        { "inlineData": { "mimeType": "image/png", "data": "<BASE64_原图>" }},
        { "text": "给这张图加上一顶时尚的礼帽，保持其余部分不变。" }
      ]
    }],
    "generationConfig": {
      "responseModalities": ["TEXT", "IMAGE"]
    }
  }'`,
          },
        ]}
      />
      <h2>与生图的区别</h2>
      <DocsTable
        headers={['能力', '生图（NanoBanana Pro）', '编辑（本页）']}
        rows={[
          ['请求 contents', '仅文本，描述要生成的图。', '原图 + 文本，描述如何改图。'],
          ['generationConfig.imageConfig', '需要设置宽高比、分辨率。', '编辑可不传。'],
          ['responseModalities', '["IMAGE"] 或 ["TEXT","IMAGE"]。', '建议 ["TEXT","IMAGE"] 以拿到编辑后图。'],
        ]}
      />
      <p>同一端点、同一认证方式，仅 <InlineCode>contents</InlineCode> 与是否传 <InlineCode>imageConfig</InlineCode> 不同。</p>
      <h2>多张图</h2>
      <p>在 <InlineCode>contents</InlineCode> 的 <InlineCode>parts</InlineCode> 里按顺序放入多张图，每张图一个 <InlineCode>inlineData</InlineCode>，最后放一条文本编辑指令即可。</p>
      <p>例如：把第一张图的主体合成到第二张图的背景上。</p>
      <h2>使用图片 URL</h2>
      <p>接口只接受 <InlineCode>inlineData</InlineCode>（base64）或通过 File API 的 <InlineCode>fileData</InlineCode>，不能直接传图片 URL。</p>
      <p>如果图片在网络上，需要先下载，再转成 base64 或交给 SDK 处理。</p>
    </>
  )
}

function ClaudeCodePage() {
  return (
    <>
      <p>
        学习如何配置 Claude Code CLI 使用当前 API。本指南涵盖 Windows、macOS 和 Linux 的安装和配置。
      </p>
      <h2>什么是 Claude Code？</h2>
      <p>
        Claude Code 是 Anthropic 的官方命令行界面工具，将 AI 助手直接带到终端和代码编辑器中。
        通过配置第三方 Anthropic 兼容地址，可以在熟悉的界面里使用平台模型。
      </p>
      <h2>前置条件</h2>
      <ul>
        <li><InfinityAccountLink />。</li>
        <li><InfinityApiKeyLink />。</li>
        <li>计算机上的终端或命令提示符访问权限。</li>
      </ul>
      <h2>安装</h2>
      <p>选择你的操作系统查看安装说明。</p>
      <h3>macOS 和 Linux</h3>
      <p>打开终端并运行：</p>
      <CodeBlock code='curl -fsSL https://claude.ai/install.sh | sh' />
      <p>此安装脚本会自动处理依赖项，无需预先安装 Node.js 或 npm。</p>
      <p>验证安装：</p>
      <CodeBlock code='claude --version' />
      <p>如果提示 <InlineCode>zsh: command not found: claude</InlineCode></p>
      <p>需要将安装目录添加到 PATH：</p>
      <CodeBlock
        code={`# 1. 将 ~/.local/bin 添加到 PATH 并写入配置文件
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
# 2. 让配置立即生效
source ~/.zshrc
# 3. 再次验证是否成功
claude --version`}
      />
      <h3>Windows</h3>
      <ol>
        <li>以管理员身份打开 PowerShell。</li>
        <li>运行安装命令：</li>
      </ol>
      <CodeBlock code='irm https://claude.ai/install.ps1 | iex' />
      <p>安装后，将 Claude Code 添加到 PATH，例如 <InlineCode>C:\Users\YourUsername\.claude\bin</InlineCode>，然后重启终端并验证安装。</p>
      <CodeBlock code='claude --version' />
      <h2>api-key配置</h2>
      <p>Claude Code 使用 Anthropic 兼容配置：</p>
      <ul>
        <li><InlineCode>ANTHROPIC_AUTH_TOKEN</InlineCode>：你的 API 密钥。</li>
      </ul>
      <h3>方法 1：永久配置（推荐）</h3>
      <p>将这行添加到 shell 配置文件中：</p>
      <CodeBlock
        code={`export ANTHROPIC_AUTH_TOKEN="sk-your-api-key"`}
      />
      <p>对于 Zsh 添加到 <InlineCode>~/.zshrc</InlineCode>，对于 Bash 添加到 <InlineCode>~/.bashrc</InlineCode> 或 <InlineCode>~/.bash_profile</InlineCode>，然后应用更改：</p>
      <CodeBlock code='source ~/.zshrc  # 或 source ~/.bashrc' />
      <p>PowerShell 持久配置：</p>
      <CodeBlock
        code={`[System.Environment]::SetEnvironmentVariable('ANTHROPIC_AUTH_TOKEN', 'sk-your-api-key', 'User')`}
      />
      <p>命令提示符持久配置：</p>
      <CodeBlock
        code={`setx ANTHROPIC_AUTH_TOKEN "sk-your-api-key"`}
      />
      <h3>方法 2：临时配置（仅当前会话）</h3>
      <p>macOS 和 Linux</p>
      <CodeBlock
        code={`export ANTHROPIC_AUTH_TOKEN="sk-your-api-key"`}
      />
      <p>Windows PowerShell</p>
      <CodeBlock
        code={`$env:ANTHROPIC_AUTH_TOKEN="sk-your-api-key"`}
      />
      <p>Windows 命令提示符</p>
      <CodeBlock
        code={`set ANTHROPIC_AUTH_TOKEN=sk-your-api-key`}
      />
      <h2>配置请求地址和模型</h2>
      <p>创建或编辑 <InlineCode>~/.claude/settings.json</InlineCode>：</p>
      <CodeBlock
        language='json'
        code={`{
  "env": {
    "ANTHROPIC_BASE_URL": "${BASE_URL}",
    "ANTHROPIC_MODEL": "you-claude-model"
  }
}`}
      />
      <h3>方法 4：使用 CC Switch（图形界面）</h3>
      <p>
        <a
          href='https://github.com/farion1231/cc-switch'
          target='_blank'
          rel='noreferrer'
        >
          CC Switch
        </a> 是 Claude Code 供应商切换工具，可用图形界面管理多个 API 供应商配置。
      </p>
      <ul>
        <li>关闭顶部 Live 代理开关，避免请求走额外代理。</li>
        <li>供应商名称填写 <InlineCode>api.infillm.com</InlineCode>。</li>
        <li>API Key 填写你的 API 密钥。</li>
        <li>请求地址填写 <InlineCode>{BASE_URL}</InlineCode>，不要以斜杠结尾。</li>
        <li>API 格式选择 <InlineCode>Anthropic Messages (原生)</InlineCode>。</li>
        <li>主模型、推理模型、Haiku、Sonnet、Opus 默认模型可分别填写平台可用的 Claude 模型。</li>
      </ul>
      <h2>验证配置</h2>
      <p>启动 Claude Code 后，输入 <InlineCode>/status</InlineCode> 查看配置状态；如果看到 Anthropic base URL 指向当前地址，说明配置成功。</p>
      <CodeBlock code={`Anthropic base URL: ${BASE_URL}`} showLineNumbers={false} />
      <p>也可以发送消息测试：</p>
      <CodeBlock code='claude "Hi"' />
      <p>检查环境变量：</p>
      <p>macOS/Linux</p>
      <CodeBlock
        code={`echo $ANTHROPIC_AUTH_TOKEN`}
      />
      <p>Windows PowerShell</p>
      <CodeBlock
        code={`echo $env:ANTHROPIC_AUTH_TOKEN`}
      />
      <h2>故障排除</h2>
      <h3>“无效的 API 密钥”错误</h3>
      <ul>
        <li>验证 API 密钥是否正确：<a
            href='https://infillm.com/keys'
            target='_blank'
            rel='noreferrer'
        >控制台 → API 密钥</a></li>
        <li>确保环境变量中没有额外空格。</li>
        <li>检查 <InlineCode>ANTHROPIC_BASE_URL</InlineCode> 是否设置为 <InlineCode>{BASE_URL}</InlineCode>。</li>
      </ul>
      <h3>“连接被拒绝”错误</h3>
      <ul>
        <li>验证互联网连接。</li>
        <li>检查浏览器是否可以访问 <a href='https://infillm.com'
                                      target='_blank'
                                      rel='noreferrer'>本站</a></li>
        <li>确保防火墙允许出站 HTTPS 连接。</li>
      </ul>
    </>
  )
}

function ClaudeDesktopPage() {
  return (
    <>
      <p>
        Claude Desktop 可以配置第三方推理服务。配置后，Claude 客户端会通过 Anthropic
        兼容接口发起请求，并使用你的 API Key。
      </p>
      <p>该功能需要较新的 Claude Desktop 客户端，旧版本可能看不到 Developer 菜单或第三方推理配置入口。</p>
      <h2>前置条件</h2>
      <ul>
        <li>最新版 Claude Desktop 客户端。</li>
        <li><InfinityAccountLink />。</li>
        <li><InfinityApiKeyLink />。</li>
      </ul>
      <h2>配置步骤</h2>
      <p>建议在登录 Claude Desktop 之前完成以下配置。</p>
      <ol>
        <li>打开最新版 Claude Desktop 客户端。</li>
        <li>先不要登录。</li>
        <li>进入 Help → Troubleshooting → Enable Developer Mode，启用开发者模式。
          <img src='/doc/claude-desktop-set-1.png' alt='启用开发者模式' className='mt-3 mb-1 w-full rounded-lg border border-border shadow-sm' />
        </li>
        <li>菜单栏出现 Developer 后，进入 Developer → Configure third-party inference。
          <img src='/doc/claude-desktop-set-2.png' alt='配置第三方推理' className='mt-3 mb-1 w-full rounded-lg border border-border shadow-sm' />
        </li>
        <li>在第三方推理配置中填写下表。
          <img src='/doc/claude-desktop-set-3.png' alt='填写推理配置' className='mt-3 mb-1 w-full rounded-lg border border-border shadow-sm' />
        </li>
        <li>选择 <strong>Apply locally</strong>，将配置保存到当前电脑。</li>
        <li>按客户端提示继续登录或启动 Claude Desktop。</li>
      </ol>
      <DocsTable
        headers={['字段', '填写内容']}
        rows={[
          ['Base URL', <InlineCode>{BASE_URL}</InlineCode>],
          ['API Key', '你的 API Key，例如 sk-...'],
          ['Authentication method', <InlineCode>x-api-key</InlineCode>],
          ['Provider / API format', '如界面出现该选项，选择 Anthropic-compatible、custom gateway 或类似选项。'],
        ]}
      />
      <h2>验证配置</h2>
      <ul>
        <li>如果客户端提示重启，先完全退出并重新打开 Claude Desktop。</li>
        <li>新建一个对话。</li>
        <li>发送一个简单测试问题。</li>
      </ul>
      <CodeBlock code='如果当前请求正在使用 infillm，请用一句话回复。' showLineNumbers={false} />
      <p>如果可以正常返回结果，说明 Claude Desktop 已经通过当前 API 进行请求。</p>
      <p>接入成功后，可以在 Claude Desktop 中切换账号当前可见的不同 Claude 模型。当前模型列表可参考<Link to={docsPath('models')}>获取模型列表</Link>。</p>
      <img src='/doc/claude-desktop-set-4.png' alt='切换 Claude 模型' className='my-4 w-full rounded-lg border border-border shadow-sm' />
      <h2>常见问题</h2>
      <h3>看不到 Developer 菜单</h3>
      <ul>
        <li>确认已安装最新版 Claude Desktop。</li>
        <li>从 Help → Troubleshooting → Enable Developer Mode 启用开发者模式。</li>
        <li>启用后完全退出并重新打开 Claude Desktop。</li>
      </ul>
      <h3>找不到 Configure third-party inference</h3>
      <ul>
        <li>确认使用的是 Claude Desktop 客户端，而不是网页端。</li>
        <li>尝试在登录前打开客户端并启用开发者模式。</li>
        <li>更新 Claude Desktop 后重新操作。</li>
      </ul>
      <h3>API Key 无效</h3>
      <ul>
        <li>复制完整 API Key。</li>
        <li>检查 API Key 前后是否有多余空格。</li>
        <li>确认 API Key 以 <InlineCode>sk-</InlineCode> 开头。</li>
        <li>确认认证方式选择的是 <InlineCode>x-api-key</InlineCode>。</li>
      </ul>
      <h3>连接失败或模型错误</h3>
      <ul>
        <li>确认 Base URL 严格填写为 <InlineCode>{BASE_URL}</InlineCode>。</li>
        <li>确认当前网络可以访问 <InlineCode>{BASE_URL}</InlineCode>。</li>
        <li>如果客户端提供模型选择，可以切换到其他可用模型再测试。</li>
      </ul>
      <h2>官方参考</h2>
      <p>可参考 Anthropic Help Center 关于 Claude Desktop / Claude Cowork 第三方平台配置的说明。</p>
    </>
  )
}

function CodexPage() {
  return (
    <>
      <p>学习如何配置 Codex CLI 使用当前 API。本指南涵盖 Windows、macOS 和 Linux 的安装和配置。</p>
      <h2>什么是 Codex CLI？</h2>
      <p>Codex CLI 是 OpenAI 的命令行界面，专为代码相关的终端任务设计。它强调工程就绪的输出，适合在终端中生成、修改和解释代码。</p>
      <h2>前置条件</h2>
      <ul>
        <li><InfinityAccountLink />。</li>
        <li><InfinityApiKeyLink />。</li>
        <li>Node.js v20 或更高版本及 npm。</li>
      </ul>
      <h2>安装</h2>
      <p>使用 npm 全局安装 Codex CLI：</p>
      <CodeBlock code='npm install -g @openai/codex' />
      <p>验证安装：</p>
      <CodeBlock code='codex --version' />
      <h2>配置</h2>
      <p>Codex CLI 使用 <InlineCode>config.toml</InlineCode>，配置目录位置如下：</p>
      <ul>
        <li>Windows：<InlineCode>%userprofile%\.codex</InlineCode></li>
        <li>macOS / Linux：<InlineCode>~/.codex</InlineCode></li>
      </ul>
      <h3>方法 1：手动配置</h3>
      <p>导航到配置目录并创建或编辑 <InlineCode>config.toml</InlineCode>。</p>
      <CodeBlock
        code={`mkdir -p ~/.codex
nano ~/.codex/config.toml`}
      />
      <CodeBlock
        code={`mkdir $env:USERPROFILE\\.codex -Force
notepad $env:USERPROFILE\\.codex\\config.toml`}
      />
      <p>添加以下配置：</p>
      <CodeBlock
        code={`model = "gpt-5.4"
model_reasoning_effort = "medium"
model_provider = "infillm"

[model_providers.infillm]
name = "api.infillm.com"
base_url = "${API_BASE_URL}"
env_key = "OPENAI_API_KEY"  # 这是指环境变量的名称
wire_api = "responses"`}
      />
      <p><InlineCode>env_key</InlineCode> 表示 Codex CLI 读取哪个环境变量，下一步会把 API 密钥设置到这个变量中。</p>
      <h3>方法 2：一键配置</h3>
      <p>macOS / Linux：</p>
      <CodeBlock
        code={`mkdir -p ~/.codex && cat > ~/.codex/config.toml << 'EOF'
model = "gpt-5.4"
model_reasoning_effort = "medium"
model_provider = "infillm"

[model_providers.infillm]
name = "api.infillm.com"
base_url = "${API_BASE_URL}"
env_key = "OPENAI_API_KEY"
wire_api = "responses"
EOF`}
      />
      <p>Windows PowerShell：</p>
      <CodeBlock
        code={`$configPath = "$env:USERPROFILE\\.codex"
New-Item -ItemType Directory -Force -Path $configPath | Out-Null
@"
model = "gpt-5.4"
model_reasoning_effort = "medium"
model_provider = "infillm"

[model_providers.infillm]
name = "api.infillm.com"
base_url = "${API_BASE_URL}"
env_key = "OPENAI_API_KEY"
wire_api = "responses"
"@ | Out-File -FilePath "$configPath\\config.toml" -Encoding utf8`}
      />
      <h2>设置 API 密钥</h2>
      <p>尽管变量名为 <InlineCode>OPENAI_API_KEY</InlineCode>，这里应填写当前平台的 API 密钥。Codex CLI 使用该标准变量名保持兼容性。</p>
      <h3>临时（仅当前会话）</h3>
      <CodeBlock code='export OPENAI_API_KEY="sk-your-api-key"' />
      <CodeBlock code='$env:OPENAI_API_KEY="sk-your-api-key"' />
      <CodeBlock code='set OPENAI_API_KEY=sk-your-api-key' />
      <h3>永久配置</h3>
      <p>macOS / Linux (Bash)：添加到 <InlineCode>~/.bashrc</InlineCode> 或 <InlineCode>~/.bash_profile</InlineCode>：</p>
      <CodeBlock code='export OPENAI_API_KEY="sk-your-api-key"' />
      <CodeBlock code='source ~/.bashrc  # 或 source ~/.bash_profile' />
      <p>macOS / Linux (Zsh)：添加到 <InlineCode>~/.zshrc</InlineCode>：</p>
      <CodeBlock code='export OPENAI_API_KEY="sk-your-api-key"' />
      <CodeBlock code='source ~/.zshrc' />
      <p>Windows PowerShell：</p>
      <CodeBlock code="[System.Environment]::SetEnvironmentVariable('OPENAI_API_KEY', 'sk-your-api-key', 'User')" />
      <p>Windows 命令提示符：</p>
      <CodeBlock code='setx OPENAI_API_KEY "sk-your-api-key"' />
      <h2>验证配置</h2>
      <p>检查 Node.js 安装：</p>
      <CodeBlock code={`node -v
npm -v`} />
      <p>验证 Codex CLI 安装：</p>
      <CodeBlock code='codex --version' />
      <p>测试 API 连接：</p>
      <CodeBlock code='codex "Hi"' />
      <p>检查环境变量：</p>
      <CodeBlock code='echo $OPENAI_API_KEY' />
      <CodeBlock code='echo $env:OPENAI_API_KEY' />
      <h2>故障排除</h2>
      <h3>401 未授权错误</h3>
      <ul>
        <li>验证 API 密钥是否正确。</li>
        <li>确保 <InlineCode>OPENAI_API_KEY</InlineCode> 环境变量设置正确。</li>
        <li>设置环境变量后重启终端。</li>
      </ul>
      <h3>403 禁止访问错误</h3>
      <ul>
        <li>检查 API 密钥的有效性。</li>
        <li>确认账户余额和令牌权限。</li>
        <li>确保 API 密钥可以访问所请求的模型。</li>
      </ul>
      <h3>网络错误</h3>
      <ul>
        <li>验证互联网连接。</li>
        <li>确认 <InlineCode>config.toml</InlineCode> 中的 <InlineCode>base_url</InlineCode> 为 <InlineCode>{API_BASE_URL}</InlineCode>。</li>
        <li>防火墙需允许出站 HTTPS 连接。</li>
      </ul>
      <h3>配置未生效</h3>
      <ul>
        <li>编辑 <InlineCode>config.toml</InlineCode> 后重启终端。</li>
        <li>验证 TOML 语法格式。</li>
        <li>检查配置文件位置是否正确。</li>
        <li>确保文件保存为 <InlineCode>config.toml</InlineCode>。</li>
      </ul>
      <h3>找不到 Codex 命令</h3>
      <p>macOS / Linux：</p>
      <CodeBlock
        code={`npm config get prefix
export PATH="$(npm config get prefix)/bin:$PATH"`}
      />
      <p>Windows：确认 npm 全局路径在系统 PATH 中，npm 安装后重启终端。</p>
    </>
  )
}

function OpenCodePage() {
  return (
    <>
      <p>学习如何配置 OpenCode CLI 使用当前 API。本指南涵盖 Windows、macOS 和 Linux 的安装和配置。</p>
      <h2>什么是 OpenCode？</h2>
      <p>OpenCode 是一个开源命令行编程工具，提供终端用户界面，支持 OpenAI、Anthropic、Gemini 等多种 LLM 提供商。</p>
      <p>通过接入 OpenAI 兼容地址，可以用一个密钥和基础 URL 访问 Claude、GPT、Gemini 等模型。</p>
      <h2>前置条件</h2>
      <ul>
        <li><InfinityAccountLink />。</li>
        <li><InfinityApiKeyLink />。</li>
        <li>计算机上的终端或命令提示符访问权限。</li>
      </ul>
      <h3>终端模拟器</h3>
      <p>OpenCode 需要现代终端模拟器。推荐 WezTerm、Alacritty、Ghostty、Kitty、Windows Terminal、iTerm2 等。</p>
      <h2>安装</h2>
      <h3>macOS 和 Linux</h3>
      <CodeBlock code='curl -fsSL https://opencode.ai/install | bash' />
      <p>也可以使用 Homebrew：</p>
      <CodeBlock code='brew install anomalyco/tap/opencode' />
      <h3>Windows</h3>
      <p>Windows 用户可先安装 Node.js，然后通过 npm 安装：</p>
      <CodeBlock code='npm i -g opencode-ai@latest' />
      <p>也可以使用 Chocolatey 或 Scoop：</p>
      <CodeBlock
        code={`choco install opencode
scoop bucket add extras
scoop install extras/opencode`}
      />
      <p>验证安装：</p>
      <CodeBlock code='opencode --version' />
      <h2>配置</h2>
      <h3>步骤 1：初始化提供商</h3>
      <p>安装后，在启动 OpenCode 前运行：</p>
      <CodeBlock code='opencode auth login' />
      <ul>
        <li>在提供商列表中选择 <InlineCode>other</InlineCode>。</li>
        <li>Provider ID 输入 <InlineCode>infillm</InlineCode>。</li>
        <li>API Key token 可以输入任意占位值，实际密钥通过配置文件引用。</li>
      </ul>
      <h3>步骤 2：编辑配置文件</h3>
      <p>配置目录：</p>
      <ul>
        <li>Windows：<InlineCode>%userprofile%\.config\opencode</InlineCode></li>
        <li>macOS / Linux：<InlineCode>~/.config/opencode</InlineCode></li>
      </ul>
      <p>在目录中创建或编辑 <InlineCode>opencode.json</InlineCode>。Claude 模型示例：</p>
      <CodeBlock
        language='json'
        code={`{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "infillm": {
      "npm": "@ai-sdk/anthropic",
      "name": "api.infillm.com",
      "options": {
        "baseURL": "${API_BASE_URL}",
        "apiKey": "sk-your-api-key"
      },
      "models": {
        "claude-opus-4-5-20251101": { "name": "Claude-4.5-Opus" },
        "claude-sonnet-4-5-20250929": { "name": "Claude-4.5-Sonnet" },
        "claude-haiku-4-5-20251001": { "name": "Claude-4.5-Haiku" }
      }
    }
  }
}`}
      />
      <p>OpenAI GPT 模型示例：</p>
      <CodeBlock
        language='json'
        code={`{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "infillm": {
      "npm": "@ai-sdk/openai",
      "name": "api.infillm.com",
      "options": {
        "baseURL": "${API_BASE_URL}",
        "apiKey": "sk-your-api-key"
      },
      "models": {
        "openai/gpt-4.1": { "name": "GPT-4.1" },
        "openai/gpt-4o": { "name": "GPT-4o" },
        "openai/gpt-4o-mini": { "name": "GPT-4o Mini" }
      }
    }
  }
}`}
      />
      <InfoBlock>将示例中的 API Key 替换为控制台中的真实密钥，JSON 配置对逗号和引号非常敏感。</InfoBlock>
      <h2>验证配置</h2>
      <CodeBlock
        code={`cd your-working-directory
opencode`}
      />
      <p>在聊天界面输入：</p>
      <CodeBlock code='/models' showLineNumbers={false} />
      <p>如果能看到已配置的 provider 和模型，选择一个即可开始使用。</p>
      <h2>切换模型</h2>
      <p>在 OpenCode 界面中输入 <InlineCode>/models</InlineCode>，从列表中选择想使用的模型。</p>
      <ul>
        <li><InlineCode>anthropic/claude-sonnet-4-5-20250514</InlineCode>：Claude Sonnet。</li>
        <li><InlineCode>anthropic/claude-opus-4-20250514</InlineCode>：Claude Opus。</li>
        <li><InlineCode>openai/gpt-4.1</InlineCode>：GPT-4.1。</li>
        <li><InlineCode>openai/gpt-4o-mini</InlineCode>：GPT-4o Mini。</li>
        <li><InlineCode>google/gemini-3-pro</InlineCode>：Gemini 3 Pro。</li>
      </ul>
      <h2>故障排除</h2>
      <h3>配置更改不生效</h3>
      <ul>
        <li>重启 OpenCode。</li>
        <li>检查 <InlineCode>opencode.json</InlineCode> 语法。</li>
        <li>验证配置文件路径是否正确。</li>
      </ul>
      <h3>401/403 错误</h3>
      <ul>
        <li>401：API 密钥未设置或无效。</li>
        <li>403：权限不足或密钥已过期。</li>
        <li>检查配置文件中的 <InlineCode>apiKey</InlineCode>。</li>
      </ul>
      <h3>找不到 OpenCode</h3>
      <CodeBlock
        code={`which opencode
npm i -g opencode-ai@latest`}
      />
      <h3>配置文件位置</h3>
      <p><InlineCode>opencode.json</InlineCode> 应放在 Windows 的 <InlineCode>C:\Users\{'{username}'}\.config\opencode\opencode.json</InlineCode> 或 macOS / Linux 的 <InlineCode>~/.config/opencode/opencode.json</InlineCode>。</p>
      <h2>注意事项</h2>
      <ul>
        <li>在专用项目文件夹中运行 OpenCode，避免在敏感目录中运行。</li>
        <li>确保 JSON 配置语法正确。</li>
        <li>OpenCode 仅在授权时读取文件内容。</li>
        <li>支持中文输入和输出。</li>
      </ul>
    </>
  )
}

function HermesPage() {
  return (
    <>
      <p>
        本指南介绍如何在 Hermes Agent 中使用当前 API 作为模型提供商。Hermes Agent
        可运行于终端，并支持对接 Telegram、Discord、Slack、WhatsApp、Signal 等消息平台。
      </p>
      <p>
        当前服务提供 OpenAI 兼容的 <InlineCode>/v1</InlineCode> 接口，因此可以作为自定义 provider
        直接接入 Hermes Agent，无需安装插件或修改源码。
      </p>
      <h2>前置条件</h2>
      <ul>
        <li>已安装 Hermes Agent。</li>
        <li>已创建可用 API Key，并确认令牌分组包含目标模型。</li>
      </ul>
      <p>一键安装命令（Linux / macOS / WSL2）：</p>
      <CodeBlock code='curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash' />
      <h2>配置 Provider</h2>
      <p>Hermes Agent 的配置文件位于 <InlineCode>~/.hermes/config.yaml</InlineCode>。在 <InlineCode>providers:</InlineCode> 段下新增 provider 条目。</p>
      <CodeBlock
        language='yaml'
        code={`model:
  default: claude-sonnet-4-6
  provider: infillm

providers:
  infillm:
    base_url: ${API_BASE_URL}
    api_key: sk-your-api-key
    type: openai
    default_model: claude-sonnet-4-6
    models:
      # Claude
      - claude-opus-4-7
      - claude-opus-4-6
      - claude-opus-4-6-thinking
      - claude-sonnet-4-6
      - claude-sonnet-4-6-thinking
      - claude-haiku-4-5-20251001
      # Claude（anthropic/ 前缀）
      - anthropic/claude-opus-4.7
      - anthropic/claude-sonnet-4.6
      - anthropic/claude-sonnet-4.6:thinking
      - anthropic/claude-haiku-4.5
      # GPT / OpenAI
      - gpt-5.4
      - gpt-5.4-xhigh
      - gpt-5.4-mini
      - gpt-5.3-codex
      - gpt-5.2
      - gpt-5.2-codex
      - gpt-4.1
      - gpt-4o
      # GPT / OpenAI（openai/ 前缀）
      - openai/gpt-5.4
      - openai/gpt-5.2
      - openai/gpt-5.2-codex
      - openai/gpt-4.1
      - openai/gpt-4o
      - gpt-5.4
      - google/gemini-2.5-flash
      - deepseek/deepseek-v3.2`}
      />
      <h3>字段说明</h3>
      <p>顶层 <InlineCode>model:</InlineCode> 段用于指定当前活跃 provider 与默认模型。若此前使用其他 provider，将 <InlineCode>provider</InlineCode> 改为新 provider，并将 <InlineCode>default</InlineCode> 设置为模型列表中存在的模型即可。</p>
      <h2>使用方式</h2>
      <p>修改配置后请重启 Hermes。CLI 退出后重新运行 <InlineCode>hermes</InlineCode>，Gateway 可使用 <InlineCode>hermes gateway restart</InlineCode>。</p>
      <p>在终端中：</p>
      <CodeBlock code={`/model
/model claude-sonnet-4-6
/model gpt-5.4 --global`} />
      <p>
        <InlineCode>/model</InlineCode> 会打开模型选择器；添加 <InlineCode>--global</InlineCode>{' '}
        会将变更写入配置并持久化，不添加则仅作用于当前会话。
      </p>
      <p>在 Telegram、Discord、Slack 或 WhatsApp 中向机器人发送 <InlineCode>/model</InlineCode>，机器人会返回内联键盘，点击 provider 后进入分页模型列表。</p>
      <h2>获取完整模型列表</h2>
      <p>上方 models 列表为精选子集。如需查看当前支持的全部模型，可直接调用接口：</p>
      <CodeBlock
        code={`curl -H "Authorization: Bearer sk-your-api-key" \\
  ${API_BASE_URL}/models | jq -r '.data[].id'`}
      />
      <p>将所需 model ID 添加到 <InlineCode>models:</InlineCode> 段后重启 Hermes，即可在 <InlineCode>/model</InlineCode> 选择器中看到对应模型。</p>
      <h2>使用环境变量</h2>
      <p>如不希望将 API Key 直接写入 <InlineCode>config.yaml</InlineCode>，可使用环境变量：</p>
      <CodeBlock code='export INFILLM_API_KEY=sk-your-api-key' />
      <p>然后在配置中通过 <InlineCode>key_env</InlineCode> 引用：</p>
      <CodeBlock
        language='yaml'
        code={`providers:
  infillm:
    base_url: ${API_BASE_URL}
    key_env: INFILLM_API_KEY
    type: openai
    default_model: claude-sonnet-4-6`}
      />
      <h2>故障排查</h2>
      <h3>/model 中当前 Provider 只显示一个按钮</h3>
      <p>通常是 provider 下未配置 <InlineCode>models:</InlineCode> 列表。补全列表后重启 Hermes 即可。</p>
      <h3>401 Unauthorized</h3>
      <p>确认 key 有效，并且写在对应 provider 配置下；如果使用环境变量，确认变量名与 <InlineCode>key_env</InlineCode> 一致。</p>
      <h3>Model not found</h3>
      <p>模型目录会持续更新，原列表中的模型可能已重命名或下线。重新调用模型列表接口并更新 <InlineCode>models:</InlineCode> 即可。</p>
      <h3>如何确认配置已生效？</h3>
      <CodeBlock code='hermes doctor' />
      <p>该命令会输出诊断报告，包括当前激活 provider 和模型。</p>
      <h2>相关链接</h2>
      <ul>
        <li><a
            href='https://github.com/NousResearch/hermes-agent'
            target='_blank'
            rel='noreferrer'
        >Hermes Agent Github</a></li>
      </ul>
    </>
  )
}

function TraePage() {
  return (
    <>
      <p>Trae 是 AI 原生 IDE，可将智能编程辅助集成到开发工作流中。通过配置自定义 OpenAI 兼容服务商，可以调用平台模型进行代码补全、对话、重构和生成。</p>
      <InfoBlock>使用 Trae 前请先准备有效 API Key，并确认账号有足够额度。</InfoBlock>
      <h2>什么是 Trae？</h2>
      <ul>
        <li>中国首个 AI 原生集成开发环境，基于 Visual Studio Code 构建。</li>
        <li>提供聊天、代码生成、重构、解释和补全等能力。</li>
        <li>支持添加自定义模型服务商。</li>
      </ul>
      <h2>配置步骤</h2>
      <p>按照以下步骤配置 Trae 使用 API：</p>
      <h3>步骤 1：打开模型设置</h3>
      <p>有两种方式访问模型配置：</p>
      <p>方法 A：通过对话输入框，点击模型列表或设置入口。</p>
      <p>方法 B：通过设置菜单进入 AI 功能管理或模型设置。</p>
      <ol>
        <li>打开 Trae。</li>
        <li>在对话输入框右下角打开模型列表，或进入 AI 功能管理。</li>
        <li>点击添加模型。</li>
      </ol>
      <h3>步骤 2：配置自定义模型</h3>
      <ConfigTable
        rows={[
          { name: '供应商', value: <InlineCode>OpenAI</InlineCode> },
          { name: 'Base URL', value: <InlineCode>{API_BASE_URL}</InlineCode> },
          { name: 'API Key', value: <InlineCode>sk-xxxxx</InlineCode> },
          { name: 'Model ID', value: <InlineCode>google/gemini-2.5-flash</InlineCode> },
        ]}
      />
      <h3>步骤 3：保存配置</h3>
      <p>保存后选择刚添加的模型，发送一个简单编程问题进行验证。</p>
      <h2>验证配置</h2>
      <p>确保 Trae 已正确配置：选择自定义模型，发送测试消息，并确认返回内容来自该模型。</p>
      <CodeBlock code='用 Python 写一个递归计算斐波那契数列的函数' showLineNumbers={false} />
      <h2>在 Trae 中使用自定义模型</h2>
      <p>配置完成后，可以通过多种方式使用模型：</p>
      <h3>1. 对话模式 (Chat Mode)</h3>
      <p>在聊天面板选择模型，询问架构设计、代码解释、测试生成或错误排查。</p>
      <h3>2. 行内补全 (Inline Completion)</h3>
      <p>在编辑器中触发行内补全，让模型基于当前文件和上下文生成代码。</p>
      <h3>3. 代码操作 (Code Actions)</h3>
      <p>选择代码片段后执行解释、重构、生成注释、补测试等操作。</p>
      <h2>故障排除</h2>
      <h3>❌ 连接失败</h3>
      <p>症状：“无法连接到 API” 或 “网络错误”。</p>
      <ul>
        <li>检查 Base URL 是否为 <InlineCode>{API_BASE_URL}</InlineCode>。</li>
        <li>确认网络可以访问该地址。</li>
        <li>检查防火墙或代理设置。</li>
      </ul>
      <h3>❌ API 密钥无效</h3>
      <p>症状：“401 未授权” 或 “无效的 API 密钥”。</p>
      <ul>
        <li>确认密钥完整、没有多余空格。</li>
        <li>确认账户可用，令牌未被删除或过期。</li>
      </ul>
      <h3>❌ 模型未找到</h3>
      <p>症状：“模型不可用” 或 “未知的模型 ID”。</p>
      <ul>
        <li>通过模型列表页面确认模型 ID。</li>
        <li>检查 API 令牌分组是否包含该模型。</li>
      </ul>
      <h3>❌ 速率限制超限</h3>
      <p>症状：“请求过多” 或 “达到速率限制”。</p>
      <ul>
        <li>等待后重试。</li>
        <li>降低并发或切换模型。</li>
        <li>检查账户限制。</li>
      </ul>
      <h2>高级配置</h2>
      <h3>使用多个模型</h3>
      <p>可以添加多个不同配置的模型，例如快速模型用于日常问答，强推理模型用于复杂重构，长上下文模型用于大型仓库分析。</p>
      <h3>模型上下文协议 (MCP)</h3>
      <p>Trae 支持 Model Context Protocol，允许 AI 模型访问外部工具和数据源。使用自定义模型时，也可以利用 MCP 读取项目、数据库、浏览器或其他工具上下文。</p>
      <p>详细 MCP 配置请参考 Trae 官方文档。</p>
      <h2>最佳实践</h2>
      <ul>
        <li>日常任务使用快速模型，复杂重构使用更强推理模型。</li>
        <li>用文件引用提供上下文，减少无关历史。</li>
        <li>提交前人工审查和测试生成代码。</li>
      </ul>
      <h2>下一步</h2>
      <p>现在已经完成 Trae 配置，可以继续查看模型列表、聊天完成接口和错误处理页面，按实际项目选择模型与重试策略。</p>
    </>
  )
}

function ErrorCodeCard(props: {
  code: string
  title: string
  description: string
}) {
  return (
    <div className='my-4 rounded-lg border border-red-100 bg-red-50/45 px-5 py-7 dark:border-red-900/35 dark:bg-red-950/10'>
      <div className='flex items-baseline gap-2 text-lg font-bold text-foreground'>
        <span className='font-mono text-red-500 dark:text-red-300'>
          {props.code}
        </span>
        <span>{props.title}</span>
      </div>
      <p className='mt-7 mb-0 text-sm leading-7 text-muted-foreground'>
        {props.description}
      </p>
    </div>
  )
}

function ErrorHandlingPage() {
  return (
    <>
      <p>了解 API 错误代码和处理方法，确保您的应用程序能够正确处理各种异常情况。</p>
      <h2>常见错误代码</h2>
      <div className='my-6'>
        <ErrorCodeCard
          code='401'
          title='未授权'
          description='API 密钥无效或已过期'
        />
        <ErrorCodeCard
          code='403'
          title='禁止访问'
          description='权限不足或账户被限制'
        />
        <ErrorCodeCard
          code='429'
          title='请求过多'
          description='请求频率超过限制'
        />
        <ErrorCodeCard
          code='500'
          title='服务器错误'
          description='服务器内部错误'
        />
      </div>
    </>
  )
}

function ExamplesPage() {
  return (
    <>
      <p>下面是常用语言的最小调用示例，可作为后端服务、脚本或调试请求的起点。</p>
      <CodeExample
        samples={[
          {
            label: 'Python',
            language: 'python',
            code: `import requests

url = "${API_BASE_URL}/chat/completions"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json",
}
data = {
    "model": "google/gemini-2.5-flash",
    "messages": [{"role": "user", "content": "Hello!"}],
}

response = requests.post(url, headers=headers, json=data)
print(response.json())`,
          },
          {
            label: 'JavaScript',
            language: 'javascript',
            code: `const response = await fetch("${API_BASE_URL}/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "google/gemini-2.5-flash",
    messages: [{ role: "user", content: "Hello!" }],
  }),
});

console.log(await response.json());`,
          },
          {
            label: 'cURL',
            language: 'bash',
            code: `curl ${API_BASE_URL}/chat/completions \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"model":"google/gemini-2.5-flash","messages":[{"role":"user","content":"Hello!"}]}'`,
          },
        ]}
      />
    </>
  )
}

const pageContent: Record<DocsSlug, { title: string; content: React.ReactNode }> = {
  'getting-started': { title: '快速开始', content: <GettingStartedPage /> },
  faq: { title: '常见问题', content: <FaqPage /> },
  authentication: { title: '身份认证', content: <AuthenticationPage /> },
  models: { title: '获取模型列表', content: <ModelsPage /> },
  chat: { title: '聊天完成', content: <ChatPage /> },
  embeddings: { title: '文本嵌入', content: <EmbeddingsPage /> },
  images: { title: '图像', content: <ImagesPage /> },
  'gpt-image-2': { title: 'GPT Image 2', content: <GptImagePage /> },
  'nano-banana-pro': { title: 'NanoBanana Pro', content: <NanoBananaPage /> },
  'nano-banana-pro-edit': {
    title: 'NanoBananaPro Edit',
    content: <NanoBananaEditPage />,
  },
  'claude-code': { title: 'Claude Code CLI 设置', content: <ClaudeCodePage /> },
  'claude-desktop': {
    title: 'Claude Desktop 设置',
    content: <ClaudeDesktopPage />,
  },
  codex: { title: 'Codex CLI 设置', content: <CodexPage /> },
  opencode: { title: 'OpenCode CLI 设置', content: <OpenCodePage /> },
  hermes: { title: 'Hermes Agent 设置', content: <HermesPage /> },
  trae: { title: 'Trae 配置', content: <TraePage /> },
  'error-handling': { title: '错误处理', content: <ErrorHandlingPage /> },
  examples: { title: '代码示例', content: <ExamplesPage /> },
}

function DocsArticle(props: { slug: DocsSlug }) {
  const page = pageContent[props.slug]
  const pageUrl =
    typeof window === 'undefined' ? docsPath(props.slug) : window.location.href

  return (
    <article className='docs-article mx-auto max-w-[820px] px-6 py-10 md:px-10 lg:py-14'>
      <header className='mb-12'>
        <div className='mb-10 flex items-center justify-end'>
          <CopyButton
            value={pageUrl}
            tooltip='复制页面链接'
            successTooltip='页面链接已复制'
            variant='outline'
            size='sm'
            className='h-8 rounded-md px-3 text-xs'
          >
            复制页面
          </CopyButton>
        </div>
        <h1 className='text-center text-[2.35rem] leading-tight font-bold tracking-normal text-foreground md:text-[2.85rem]'>
          {page.title}
        </h1>
      </header>
      <section className='docs-section'>{page.content}</section>
    </article>
  )
}

export function Docs(props: { slug?: string }) {
  const activeSlug = normalizeDocsSlug(props.slug)

  return (
    <PublicLayout showMainContainer={false}>
      <main className='relative min-h-svh overflow-hidden bg-background pt-16 text-foreground'>
        <div
          aria-hidden
          className='pointer-events-none absolute inset-x-0 top-0 h-[600px] opacity-20 dark:opacity-[0.10]'
          style={{
            background: [
              'radial-gradient(ellipse 60% 50% at 20% 20%, oklch(0.72 0.18 250 / 80%) 0%, transparent 70%)',
              'radial-gradient(ellipse 50% 40% at 80% 15%, oklch(0.65 0.15 200 / 60%) 0%, transparent 70%)',
              'radial-gradient(ellipse 40% 35% at 50% 70%, oklch(0.70 0.12 280 / 40%) 0%, transparent 70%)',
            ].join(', '),
            maskImage:
              'linear-gradient(to bottom, black 40%, transparent 100%)',
            WebkitMaskImage:
              'linear-gradient(to bottom, black 40%, transparent 100%)',
          }}
        />
        <div className='relative lg:pl-[292px]'>
          <Sidebar activeSlug={activeSlug} />
          <DocsArticle slug={activeSlug} />
        </div>

        <style>{`
          .docs-article {
            color: hsl(var(--muted-foreground));
          }

          .docs-section > h2 {
            margin-top: 2rem;
            margin-bottom: 1rem;
            color: hsl(var(--foreground));
            font-size: 1.45rem;
            line-height: 1.35;
            font-weight: 700;
            letter-spacing: 0;
          }

          .docs-section > h3 {
            margin-top: 1.75rem;
            margin-bottom: 0.75rem;
            color: hsl(var(--foreground));
            font-size: 1.12rem;
            line-height: 1.45;
            font-weight: 700;
            letter-spacing: 0;
          }

          .docs-section > p {
            margin: 0.85rem 0;
            font-size: 1rem;
            line-height: 1.9;
          }

          .docs-section ul,
          .docs-section ol {
            margin: 0.9rem 0 1.4rem;
            padding-left: 1.35rem;
            line-height: 1.85;
          }

          .docs-section ul {
            list-style: disc;
          }

          .docs-section ol {
            list-style: decimal;
          }

          .docs-section li + li {
            margin-top: 0.35rem;
          }

          .docs-section a {
            color: #2563eb;
            text-decoration: none;
            font-weight: 600;
          }

          .docs-section a:hover {
            color: #1d4ed8;
            text-decoration: underline;
          }

          .docs-code .shiki {
            margin: 0;
            min-width: max-content;
            overflow-x: auto;
            background: #1e1e1e !important;
            padding: 1rem 1.25rem;
            font-size: 0.875rem;
            line-height: 1.75;
          }

          .docs-code code {
            font-family: Consolas, Monaco, 'Courier New', monospace;
          }
        `}</style>
      </main>
    </PublicLayout>
  )
}
