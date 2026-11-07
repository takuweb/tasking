'use server';

import { getDb, ensureTablesExist } from '@/lib/db/neon';
import { createSessionCookie, clearSessionCookie } from '@/lib/auth/session';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';

export async function signupAction(formData: FormData) {
  const username = (formData.get('username') as string || '').trim().toLowerCase();
  const displayName = (formData.get('displayName') as string || '').trim() || username;
  const password = formData.get('password') as string || '';

  if (!username || username.length < 3) {
    return { error: '冒険者IDは半角英数字3文字以上で入力してください。' };
  }
  if (!password || password.length < 6) {
    return { error: '合言葉（パスワード）は6文字以上で入力してください。' };
  }

  try {
    // 1. テーブル自動作成
    await ensureTablesExist();
    const sql = getDb();

    // 2. 既存ユーザーチェック
    const existing = await sql`
      SELECT id FROM rpg_users WHERE username = ${username} LIMIT 1
    `;
    if (existing.length > 0) {
      return { error: 'その冒険者IDは既に使用されています。別のIDをお試しください。' };
    }

    // 3. パスワードハッシュ化
    const passwordHash = await bcrypt.hash(password, 10);

    // 4. ユーザー作成
    const [newUser] = await sql`
      INSERT INTO rpg_users (username, display_name, password_hash)
      VALUES (${username}, ${displayName}, ${passwordHash})
      RETURNING id, username, display_name
    `;

    const userId = newUser.id;

    // 5. 初期プロファイル作成
    await sql`
      INSERT INTO rpg_profiles (user_id, username, title, level, exp, max_exp, hp, max_hp, attack, defense, gold)
      VALUES (${userId}, ${displayName}, '見習い冒険者', 1, 0, 100, 100, 100, 15, 5, 60)
    `;

    // 6. 初期バトル状態作成
    await sql`
      INSERT INTO rpg_battle_states (user_id, monster_name, monster_type, monster_level, is_boss, max_hp, current_hp, attack, exp_reward, gold_reward, sprite_type)
      VALUES (${userId}, '怠惰のスライム', 'slime', 1, false, 60, 60, 6, 35, 20, 'slime')
    `;

    // 7. 初期タスク作成
    await sql`
      INSERT INTO rpg_tasks (user_id, title, description, task_type, difficulty, exp_reward, gold_reward)
      VALUES
        (${userId}, 'チュートリアル: このタスクにチェックを入れてスライムを攻撃！', 'タスク完了で敵にダメージを与えられます。', 'adhoc', 'easy', 25, 15),
        (${userId}, '朝の水分補給と軽いストレッチ', '毎朝の健康のためのデイリークエストです。', 'routine', 'easy', 20, 10)
    `;

    // 8. 初期ログ作成
    await sql`
      INSERT INTO rpg_battle_logs (user_id, message, log_type)
      VALUES (${userId}, '冒険の書が刻まれた！日々のタスクを力に変えて戦おう！', 'item')
    `;

    // 9. セッションCookie発行
    await createSessionCookie({
      userId,
      username: newUser.username,
      displayName: newUser.display_name,
    });

    return { success: true };
  } catch (err: unknown) {
    console.error('Neon Signup Error:', err);
    const message = err instanceof Error ? err.message : String(err);
    return { error: `登録エラー: ${message}` };
  }
}

export async function loginAction(formData: FormData) {
  const username = (formData.get('username') as string || '').trim().toLowerCase();
  const password = formData.get('password') as string || '';

  if (!username || !password) {
    return { error: '冒険者IDと合言葉を入力してください。' };
  }

  try {
    await ensureTablesExist();
    const sql = getDb();

    // ユーザー検索
    const users = await sql`
      SELECT id, username, display_name, password_hash
      FROM rpg_users
      WHERE username = ${username}
      LIMIT 1
    `;

    if (users.length === 0) {
      return { error: '冒険者IDまたは合言葉（パスワード）が正しくありません。' };
    }

    const user = users[0];

    // パスワード照合
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return { error: '冒険者IDまたは合言葉（パスワード）が正しくありません。' };
    }

    // セッションCookie発行
    await createSessionCookie({
      userId: user.id,
      username: user.username,
      displayName: user.display_name,
    });

    return { success: true };
  } catch (err: unknown) {
    console.error('Neon Login Error:', err);
    const message = err instanceof Error ? err.message : String(err);
    return { error: `ログインエラー: ${message}` };
  }
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect('/login');
}
