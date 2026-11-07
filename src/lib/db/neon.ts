import { neon } from '@neondatabase/serverless';

export function getDb() {
  const connectionString =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL;

  if (!connectionString) {
    throw new Error(
      'DATABASE_URL（またはPOSTGRES_URL）が未設定です。NeonダッシュボードまたはVercel Storageより接続文字列を設定してください。'
    );
  }

  return neon(connectionString);
}

/**
 * データベーステーブルの自動初期化（初回のみ実行）
 * ユーザーがSQLを手動実行していなくても自動で全テーブルを作成します
 */
export async function ensureTablesExist() {
  const sql = getDb();

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      username VARCHAR(50) UNIQUE NOT NULL,
      display_name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS profiles (
      user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      username TEXT NOT NULL,
      title TEXT NOT NULL DEFAULT '見習い冒険者',
      level INT NOT NULL DEFAULT 1,
      exp INT NOT NULL DEFAULT 0,
      max_exp INT NOT NULL DEFAULT 100,
      hp INT NOT NULL DEFAULT 100,
      max_hp INT NOT NULL DEFAULT 100,
      attack INT NOT NULL DEFAULT 15,
      defense INT NOT NULL DEFAULT 5,
      gold INT NOT NULL DEFAULT 60,
      monsters_defeated INT NOT NULL DEFAULT 0,
      bosses_defeated INT NOT NULL DEFAULT 0,
      current_streak INT NOT NULL DEFAULT 1,
      longest_streak INT NOT NULL DEFAULT 1,
      last_active_date DATE DEFAULT CURRENT_DATE,
      stage_level INT NOT NULL DEFAULT 1,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS battle_states (
      user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      monster_name TEXT NOT NULL DEFAULT '怠惰のスライム',
      monster_type VARCHAR(30) NOT NULL DEFAULT 'slime',
      monster_level INT NOT NULL DEFAULT 1,
      is_boss BOOLEAN NOT NULL DEFAULT FALSE,
      max_hp INT NOT NULL DEFAULT 60,
      current_hp INT NOT NULL DEFAULT 60,
      attack INT NOT NULL DEFAULT 6,
      exp_reward INT NOT NULL DEFAULT 35,
      gold_reward INT NOT NULL DEFAULT 20,
      sprite_type VARCHAR(30) NOT NULL DEFAULT 'slime',
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS tasks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      task_type VARCHAR(20) NOT NULL DEFAULT 'adhoc',
      frequency VARCHAR(20) NOT NULL DEFAULT 'none',
      difficulty VARCHAR(20) NOT NULL DEFAULT 'medium',
      exp_reward INT NOT NULL DEFAULT 45,
      gold_reward INT NOT NULL DEFAULT 25,
      is_completed BOOLEAN NOT NULL DEFAULT FALSE,
      completed_at TIMESTAMP WITH TIME ZONE,
      due_date TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS user_inventory (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      item_id VARCHAR(50) NOT NULL,
      is_equipped BOOLEAN NOT NULL DEFAULT FALSE,
      quantity INT NOT NULL DEFAULT 1,
      acquired_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(user_id, item_id)
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS battle_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      message TEXT NOT NULL,
      log_type VARCHAR(20) NOT NULL DEFAULT 'attack',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;
}
