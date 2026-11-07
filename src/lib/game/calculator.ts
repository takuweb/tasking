import { Profile, BattleState } from '@/types/database';
import { MONSTER_TEMPLATES, DIFFICULTY_CONFIG } from '@/types/game';

/**
 * レベルごとの必要経験値を計算
 * Lv1: 100, Lv2: 130, Lv3: 170 ... 指数曲線で徐々に増加
 */
export function calculateMaxExp(level: number): number {
  return Math.floor(100 * Math.pow(1.28, level - 1));
}

/**
 * レベルアップ時のステータス成長を計算
 */
export function calculateLevelUpStats(currentProfile: Profile, addedExp: number): {
  newLevel: number;
  newExp: number;
  newMaxExp: number;
  newMaxHp: number;
  newHp: number;
  newAttack: number;
  newDefense: number;
  leveledUp: boolean;
  levelsGained: number;
} {
  let level = currentProfile.level;
  let exp = currentProfile.exp + addedExp;
  let maxExp = currentProfile.max_exp;
  let maxHp = currentProfile.max_hp;
  let hp = currentProfile.hp;
  let attack = currentProfile.attack;
  let defense = currentProfile.defense;
  let levelsGained = 0;

  while (exp >= maxExp) {
    exp -= maxExp;
    level += 1;
    levelsGained += 1;
    maxExp = calculateMaxExp(level);
    
    // ステータス上昇
    maxHp += 20;
    hp = maxHp; // レベルアップで全回復
    attack += 5;
    defense += 2;
  }

  return {
    newLevel: level,
    newExp: exp,
    newMaxExp: maxExp,
    newMaxHp: maxHp,
    newHp: hp,
    newAttack: attack,
    newDefense: defense,
    leveledUp: levelsGained > 0,
    levelsGained,
  };
}

/**
 * タスク難易度と主人公の攻撃力から敵に与えるダメージを計算
 */
export function calculateDamageToMonster(
  playerAttack: number,
  difficulty: keyof typeof DIFFICULTY_CONFIG
): { damage: number; isCritical: boolean } {
  const config = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.medium;
  // ランダム乱数 0.9 〜 1.15
  const variance = 0.9 + Math.random() * 0.25;
  // クリティカル率 20%
  const isCritical = Math.random() < 0.20;
  const criticalMultiplier = isCritical ? 1.5 : 1.0;

  // 基本攻撃力 + 難易度ボーナス
  const total = Math.round((playerAttack * 1.2 + config.baseDamage) * variance * criticalMultiplier);
  return {
    damage: Math.max(1, total),
    isCritical,
  };
}

/**
 * 討伐数やステージ進行度に応じた次の敵を生成
 */
export function generateNextMonster(userDefeatedCount: number, stageLevel: number): Omit<BattleState, 'id' | 'user_id' | 'created_at' | 'updated_at'> {
  // 5体ごとにボスが出現
  const isBoss = (userDefeatedCount + 1) % 5 === 0;
  
  if (isBoss) {
    const bossTemplate = MONSTER_TEMPLATES[MONSTER_TEMPLATES.length - 1]; // ドラゴン
    const scale = 1 + (stageLevel - 1) * 0.35;
    return {
      monster_name: `${stageLevel > 1 ? `第${stageLevel}階層の` : ''}${bossTemplate.name}`,
      monster_type: bossTemplate.type,
      monster_level: Math.max(1, Math.floor(userDefeatedCount / 3) + 2),
      is_boss: true,
      max_hp: Math.round(bossTemplate.baseHp * scale),
      current_hp: Math.round(bossTemplate.baseHp * scale),
      attack: Math.round(bossTemplate.baseAttack * scale),
      exp_reward: Math.round(bossTemplate.expReward * scale),
      gold_reward: Math.round(bossTemplate.goldReward * scale),
      sprite_type: bossTemplate.type,
    };
  }

  // 雑魚敵 (スライム、ゴブリン、スケルトン、ゴーレムの中からランダムまたは順次)
  const regularTemplates = MONSTER_TEMPLATES.slice(0, 4);
  const randomIndex = Math.min(
    Math.floor(Math.random() * regularTemplates.length),
    Math.floor((userDefeatedCount % 4))
  );
  const template = regularTemplates[randomIndex] || regularTemplates[0];
  const scale = 1 + (stageLevel - 1) * 0.25 + (userDefeatedCount % 5) * 0.1;

  return {
    monster_name: template.name,
    monster_type: template.type,
    monster_level: Math.max(1, Math.floor(userDefeatedCount / 3) + 1),
    is_boss: false,
    max_hp: Math.round(template.baseHp * scale),
    current_hp: Math.round(template.baseHp * scale),
    attack: Math.round(template.baseAttack * scale),
    exp_reward: Math.round(template.expReward * scale),
    gold_reward: Math.round(template.goldReward * scale),
    sprite_type: template.type,
  };
}
