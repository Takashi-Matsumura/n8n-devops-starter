# n8n DevOps Starter - Security Dashboard

n8n ワークフローと連携して、セキュリティレポートを自動収集・一元管理するダッシュボードアプリケーションです。

## Overview

```
┌─────────────┐      Webhook (POST)      ┌──────────────────┐
│             │  ───────────────────────> │                  │
│    n8n      │   x-api-key 認証          │  Next.js App     │
│  Workflows  │                          │  (Dashboard)     │
│             │  - GitHub Advisory Check  │                  │
│             │  - SSL Certificate Check  │  Prisma + SQLite │
│             │  - npm Audit             │                  │
└─────────────┘                          └──────────────────┘
   :5678                                      :3000
```

**主な機能:**

- n8n ワークフローからの Webhook 受信 (API Key 認証)
- セキュリティレポートの一覧・詳細表示
- 深刻度別の集計カード (Critical / High / Moderate / Low / Info)
- 深刻度・ステータスによるフィルタリング
- ステータス管理 (`new` → `reviewed` → `resolved`)
- Docker Compose によるワンコマンド起動

## Tech Stack

| カテゴリ | 技術 |
|---------|------|
| Frontend | Next.js 16 (App Router / Turbopack) |
| UI | Tailwind CSS v4 + shadcn/ui |
| Database | Prisma 7 + SQLite |
| Automation | n8n |
| Infrastructure | Docker Compose |

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### 1. クローン & インストール

```bash
git clone https://github.com/Takashi-Matsumura/n8n-devops-starter-.git
cd n8n-devops-starter-
npm install
```

### 2. 環境変数の設定

```bash
cp .env.example .env
```

`.env` を編集して `WEBHOOK_API_KEY` を任意の値に設定してください。

### 3. データベースの初期化

```bash
npx prisma generate
npx prisma db push
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) でダッシュボードにアクセスできます。

### 5. テストデータの投入

```bash
curl -X POST http://localhost:3000/api/webhook/security-report \
  -H "Content-Type: application/json" \
  -H "x-api-key: dev-secret-key-change-me" \
  -d '{
    "source": "github-advisory",
    "severity": "critical",
    "title": "CVE-2024-1234: Remote Code Execution in example-lib",
    "summary": "A critical vulnerability allows remote code execution.",
    "rawData": {"cve": "CVE-2024-1234", "package": "example-lib"}
  }'
```

## Docker Compose

アプリケーションと n8n をまとめて起動できます。

```bash
docker compose up --build
```

| サービス | URL | 説明 |
|---------|-----|------|
| Dashboard | http://localhost:3000 | セキュリティダッシュボード |
| n8n | http://localhost:5678 | ワークフロー管理画面 |

## API Reference

### `POST /api/webhook/security-report`

n8n からセキュリティレポートを受信します。

**Headers:**
- `x-api-key` - `WEBHOOK_API_KEY` と一致する値 (必須)

**Body:**

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `source` | string | Yes | `github-advisory` / `ssl-check` / `npm-audit` |
| `severity` | string | Yes | `critical` / `high` / `moderate` / `low` / `info` |
| `title` | string | Yes | レポートのタイトル |
| `summary` | string | Yes | レポートの概要 |
| `rawData` | object | No | 任意の JSON データ |

**Response:** `201 Created`
```json
{ "success": true, "id": "clxxxxxxxxx" }
```

### `GET /api/reports`

レポート一覧を取得します。クエリパラメータでフィルタ可能です。

```
GET /api/reports?severity=critical&status=new
```

### `GET /api/reports/:id`

レポート詳細を取得します。

### `PATCH /api/reports/:id`

ステータスを更新します。

```json
{ "status": "reviewed" }
```

## n8n Workflows

`n8n-workflows/` ディレクトリにワークフローテンプレートが含まれています。n8n の管理画面からインポートして使用してください。

| ファイル | 説明 |
|---------|------|
| `github-advisory-check.json` | GitHub Advisory API を6時間ごとにチェック |
| `ssl-check.json` | 指定ドメインの SSL 証明書を24時間ごとにチェック |

## Project Structure

```
app/
├── page.tsx                            # ダッシュボード (一覧画面)
├── reports/[id]/page.tsx               # レポート詳細画面
└── api/
    ├── webhook/security-report/route.ts  # Webhook 受信 API
    ├── reports/route.ts                  # レポート一覧 API
    └── reports/[id]/route.ts             # レポート詳細・更新 API
components/ui/                          # shadcn/ui コンポーネント
lib/prisma.ts                           # Prisma クライアント (singleton)
prisma/schema.prisma                    # データベーススキーマ
prisma.config.ts                        # Prisma 7 設定
n8n-workflows/                          # n8n ワークフローテンプレート
Dockerfile                              # マルチステージビルド
docker-compose.yml                      # app + n8n
```

## License

MIT
