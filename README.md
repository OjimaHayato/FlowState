# Flowstate

**Flowstate** は、ポモドーロ・テクニックによる集中管理と、データ分析を組み合わせたWebアプリケーション．いい感じの見た目のタイマーアプリがなかったので作ってみた．


## 特徴

### ポモドーロタイマー
ただ時間を計るだけでなく、作業内容を記録し、柔軟に管理できる．
- **カテゴリ管理**: 「Coding」「Study」「Reading」などのタグを作成し、作業内容を分類して記録。
- **BGM再生**: 作業用BGMを再生可能．

### 分析ダッシュボード
モチベーション維持の手助けとして，蓄積された行動データを視覚化．
- **Activity Heatmap**: GitHubのようなヒートマップで、過去365日の継続状況を把握できる。
- **Focus Distribution**: どのカテゴリにどれくらい時間を割いたかを円グラフで詳細に分析。
- **Weekly Trend**: 過去7日間の集中時間の推移を棒グラフで表示。
- **Session History**: 過去のセッション履歴を時系列で確認可能。

## 技術スタック


| Category | Technology |
| --- | --- |
| **Frontend** | [Next.js 14](https://nextjs.org/) (App Router), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/), [Lucide React](https://lucide.dev/), [Recharts](https://recharts.org/) |
| **Backend** | [Python](https://www.python.org/) 3.11+, [FastAPI](https://fastapi.tiangolo.com/), [SQLAlchemy](https://www.sqlalchemy.org/), [Pydantic](https://docs.pydantic.dev/) |
| **Database** | [PostgreSQL](https://www.postgresql.org/) |
| **Infrastructure** | [Docker](https://www.docker.com/), [Docker Compose](https://docs.docker.com/compose/) |


## ディレクトリ構成

```
flowstate/
├── frontend/          # Next.js フロントエンドアプリケーション
├── backend/           # FastAPI バックエンドアプリケーション
├── docker-compose.yml # Docker 構成ファイル
└── README.md          # プロジェクトドキュメント
```
