# ⚔️ TASK QUEST (タスク育成RPGアプリ)

日々のタスク（ToDo）を消化することで、主人公が経験値を獲得してレベルアップし、次々と現れる敵を討伐していく**タスク育成RPG Webアプリケーション**です。

---

## 🎮 主要機能

- **① ユーザー認証 & クラウドデータ保存**
  - Supabase Auth によるメール/パスワード認証
  - 端末・デバイスを問わず外出先のスマホやPCからタスクと育成データを同期
  - 登録不要で即座にお試し可能な「ゲスト冒険者モード」も完備
- **② タスク管理（クエスト）システム**
  - **日課・ルーティン**: 毎日・毎週繰り返すタスク（筋トレ、勉強、ストレッチなど）
  - **突発ToDo**: その日限りのアドホックタスク
  - **4段階の難易度設定**: Easy / Medium / Hard / Boss
  - 難易度に応じて敵へのダメージ、獲得EXP、獲得ゴールドが変動
- **③ バトル & 育成システム**
  - タスク完了と連動した敵へのリアルタイムダメージ & クリティカル演出
  - 敵討伐時のボーナス報酬 & 紙吹雪エフェクト
  - 5体討伐ごとに強力なボスモンスター（破滅のドラゴンなど）が襲来
  - レベルアップ時のステータス成長（HP全回復、攻撃力・防御力アップ）
  - 稼いだゴールドで武器・防具・秘薬を購入できる「ギルド購買部」
  - 連続達成日数（ストリーク）と通算討伐数のダッシュボード

---

## 🛠 技術スタック

- **フレームワーク**: Next.js 16 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS + Lucide React
- **データベース & 認証**: Supabase (PostgreSQL + RLS + Auth)
- **デプロイ環境**: Vercel

---

## 🚀 クイックスタート (ローカル起動)

### 1. 依存関係のインストール
```bash
npm install
```

### 2. 環境変数の設定 (Supabase接続時)
`.env.example` をコピーして `.env.local` を作成します。
```bash
cp .env.example .env.local
```
Supabase プロジェクトの `Settings` > `API` より取得した URL と Anon Key を入力してください。
※ Supabaseを設定しない場合でも、「ゲスト冒険者として体験」からローカルストレージを使って全機能を即座に遊ぶことができます。

### 3. Supabaseのテーブル作成
Supabase ダッシュボードの **SQL Editor** を開き、`supabase/schema.sql` の内容を貼り付けて実行（Run）してください。
テーブル、RLSポリシー、初期データ、新規ユーザー作成時の自動トリガーがすべて設定されます。

### 4. 開発サーバーの起動
```bash
npm run dev
```
ブラウザで [http://localhost:3000](http://localhost:3000) にアクセスしてください。

---

## 🌐 Vercel へのデプロイ手順

1. GitHub にリポジトリをプッシュします。
2. [Vercel](https://vercel.com/) にログインし、該当リポジトリをインポートします。
3. **Environment Variables** に以下の2つを設定します：
   - `NEXT_PUBLIC_SUPABASE_URL`: SupabaseのプロジェクトURL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: SupabaseのAnon API Key
4. 「Deploy」をクリックすると数分で世界中に公開されます。
