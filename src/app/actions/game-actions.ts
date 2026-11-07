'use server';

import { getDb } from '@/lib/db/neon';
import { getSessionUser } from '@/lib/auth/session';
import { Profile, Task, BattleState, UserInventoryItem, BattleLog, TaskDifficulty } from '@/types/database';
import { calculateLevelUpStats, calculateDamageToMonster, generateNextMonster } from '@/lib/game/calculator';
import { DIFFICULTY_CONFIG } from '@/types/game';

export async function getGameDataAction() {
  const session = await getSessionUser();
  if (!session) return { user: null };

  const sql = getDb();
  const userId = session.userId;

  const [profiles, tasks, battles, inventories, logs] = await Promise.all([
    sql`SELECT * FROM profiles WHERE user_id = ${userId} LIMIT 1`,
    sql`SELECT * FROM tasks WHERE user_id = ${userId} ORDER BY created_at DESC`,
    sql`SELECT * FROM battle_states WHERE user_id = ${userId} LIMIT 1`,
    sql`SELECT * FROM user_inventory WHERE user_id = ${userId}`,
    sql`SELECT * FROM battle_logs WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT 15`,
  ]);

  return {
    user: session,
    profile: (profiles[0] as unknown as Profile) || null,
    tasks: (tasks as unknown as Task[]) || [],
    battleState: (battles[0] as unknown as BattleState) || null,
    inventory: (inventories as unknown as UserInventoryItem[]) || [],
    logs: (logs as unknown as BattleLog[]) || [],
  };
}

export async function addTaskNeonAction(
  title: string,
  description: string,
  taskType: 'routine' | 'adhoc',
  frequency: 'daily' | 'weekly' | 'none',
  difficulty: TaskDifficulty
) {
  const session = await getSessionUser();
  if (!session) throw new Error('未認証です');

  const sql = getDb();
  const config = DIFFICULTY_CONFIG[difficulty];

  const [newTask] = await sql`
    INSERT INTO tasks (user_id, title, description, task_type, frequency, difficulty, exp_reward, gold_reward)
    VALUES (${session.userId}, ${title}, ${description}, ${taskType}, ${frequency}, ${difficulty}, ${config.exp}, ${config.gold})
    RETURNING *
  `;

  return newTask as unknown as Task;
}

export async function completeTaskNeonAction(taskId: string) {
  const session = await getSessionUser();
  if (!session) throw new Error('未認証です');

  const sql = getDb();
  const userId = session.userId;

  // 1. タスク、プロファイル、バトル状態を取得
  const [tasks, profiles, battles] = await Promise.all([
    sql`SELECT * FROM tasks WHERE id = ${taskId} AND user_id = ${userId} LIMIT 1`,
    sql`SELECT * FROM profiles WHERE user_id = ${userId} LIMIT 1`,
    sql`SELECT * FROM battle_states WHERE user_id = ${userId} LIMIT 1`,
  ]);

  const task = tasks[0] as unknown as Task;
  const profile = profiles[0] as unknown as Profile;
  const battle = battles[0] as unknown as BattleState;

  if (!task || task.is_completed || !profile || !battle) return null;

  // 2. ダメージ計算
  const { damage, isCritical } = calculateDamageToMonster(profile.attack, task.difficulty);
  const newHp = Math.max(0, battle.current_hp - damage);
  const monsterDefeated = newHp === 0;

  let earnedExp = task.exp_reward;
  let earnedGold = task.gold_reward;
  let newMonstersDefeated = profile.monsters_defeated;
  let newBossesDefeated = profile.bosses_defeated;
  let nextStageLevel = profile.stage_level;

  let nextMonsterData = {
    monster_name: battle.monster_name,
    monster_type: battle.monster_type,
    monster_level: battle.monster_level,
    is_boss: battle.is_boss,
    max_hp: battle.max_hp,
    current_hp: newHp,
    attack: battle.attack,
    exp_reward: battle.exp_reward,
    gold_reward: battle.gold_reward,
    sprite_type: battle.sprite_type,
  };

  const newLogs: { message: string; log_type: string }[] = [];

  // 攻撃ログ
  newLogs.push({
    message: `${isCritical ? '⚡会心の一撃！ ' : ''}「${task.title}」を達成し、${battle.monster_name}に ${damage} ダメージ！`,
    log_type: 'attack',
  });

  if (monsterDefeated) {
    earnedExp += battle.exp_reward;
    earnedGold += battle.gold_reward;
    newMonstersDefeated += 1;
    if (battle.is_boss) {
      newBossesDefeated += 1;
      nextStageLevel += 1;
    }

    newLogs.push({
      message: `🎉 ${battle.monster_name} を討伐！ +${battle.exp_reward} EXP / +${battle.gold_reward} G を獲得！`,
      log_type: 'kill',
    });

    const generated = generateNextMonster(newMonstersDefeated, nextStageLevel);
    nextMonsterData = {
      ...generated,
      current_hp: generated.max_hp,
    };
  }

  // 3. レベルアップ計算
  const levelStats = calculateLevelUpStats(profile, earnedExp);
  if (levelStats.leveledUp) {
    newLogs.push({
      message: `✨ レベルアップ！ Lv.${levelStats.newLevel} に到達！ HP全快 & ステータス上昇！`,
      log_type: 'level_up',
    });
  }

  // 4. DB更新
  await sql`
    UPDATE tasks
    SET is_completed = TRUE, completed_at = NOW(), updated_at = NOW()
    WHERE id = ${taskId}
  `;

  await sql`
    UPDATE profiles
    SET level = ${levelStats.newLevel},
        exp = ${levelStats.newExp},
        max_exp = ${levelStats.newMaxExp},
        hp = ${levelStats.newHp},
        max_hp = ${levelStats.newMaxHp},
        attack = ${levelStats.newAttack},
        defense = ${levelStats.newDefense},
        gold = ${profile.gold + earnedGold},
        monsters_defeated = ${newMonstersDefeated},
        bosses_defeated = ${newBossesDefeated},
        stage_level = ${nextStageLevel},
        updated_at = NOW()
    WHERE user_id = ${userId}
  `;

  await sql`
    UPDATE battle_states
    SET monster_name = ${nextMonsterData.monster_name},
        monster_type = ${nextMonsterData.monster_type},
        monster_level = ${nextMonsterData.monster_level},
        is_boss = ${nextMonsterData.is_boss},
        max_hp = ${nextMonsterData.max_hp},
        current_hp = ${nextMonsterData.current_hp},
        attack = ${nextMonsterData.attack},
        exp_reward = ${nextMonsterData.exp_reward},
        gold_reward = ${nextMonsterData.gold_reward},
        sprite_type = ${nextMonsterData.sprite_type},
        updated_at = NOW()
    WHERE user_id = ${userId}
  `;

  for (const log of newLogs) {
    await sql`
      INSERT INTO battle_logs (user_id, message, log_type)
      VALUES (${userId}, ${log.message}, ${log.log_type})
    `;
  }

  return {
    damage,
    isCritical,
    monsterDefeated,
    levelUpData: levelStats.leveledUp
      ? { newLevel: levelStats.newLevel, levelsGained: levelStats.levelsGained }
      : null,
  };
}

export async function deleteTaskNeonAction(taskId: string) {
  const session = await getSessionUser();
  if (!session) throw new Error('未認証です');
  const sql = getDb();
  await sql`DELETE FROM tasks WHERE id = ${taskId} AND user_id = ${session.userId}`;
}
