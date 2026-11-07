import { TaskDifficulty, MonsterType } from './database';

export interface DifficultyConfig {
  label: string;
  badgeColor: string;
  borderColor: string;
  bgGlow: string;
  exp: number;
  gold: number;
  baseDamage: number; // 敵に与える基本ダメージ倍率
}

export const DIFFICULTY_CONFIG: Record<TaskDifficulty, DifficultyConfig> = {
  easy: {
    label: 'Easy（初級）',
    badgeColor: 'text-emerald-400 bg-emerald-950/70 border-emerald-500/40',
    borderColor: 'border-emerald-500/30',
    bgGlow: 'hover:shadow-[0_0_15px_rgba(16,185,129,0.15)]',
    exp: 20,
    gold: 10,
    baseDamage: 25,
  },
  medium: {
    label: 'Medium（中級）',
    badgeColor: 'text-amber-400 bg-amber-950/70 border-amber-500/40',
    borderColor: 'border-amber-500/30',
    bgGlow: 'hover:shadow-[0_0_15px_rgba(245,158,11,0.15)]',
    exp: 45,
    gold: 25,
    baseDamage: 50,
  },
  hard: {
    label: 'Hard（上級）',
    badgeColor: 'text-rose-400 bg-rose-950/70 border-rose-500/40',
    borderColor: 'border-rose-500/30',
    bgGlow: 'hover:shadow-[0_0_15px_rgba(244,63,94,0.15)]',
    exp: 90,
    gold: 60,
    baseDamage: 100,
  },
  boss: {
    label: 'Boss（ボス級）',
    badgeColor: 'text-purple-400 bg-purple-950/70 border-purple-500/40',
    borderColor: 'border-purple-500/30',
    bgGlow: 'hover:shadow-[0_0_20px_rgba(168,85,247,0.25)]',
    exp: 200,
    gold: 150,
    baseDamage: 250,
  },
};

export interface MonsterTemplate {
  name: string;
  type: MonsterType;
  baseHp: number;
  baseAttack: number;
  expReward: number;
  goldReward: number;
  isBoss: boolean;
  avatarColor: string;
  description: string;
}

export const MONSTER_TEMPLATES: MonsterTemplate[] = [
  {
    name: '怠惰のスライム',
    type: 'slime',
    baseHp: 60,
    baseAttack: 5,
    expReward: 35,
    goldReward: 20,
    isBoss: false,
    avatarColor: 'from-emerald-400 to-teal-600',
    description: 'やる気を吸い取ろうとするプルプルした魔物。',
  },
  {
    name: '先延ばしゴブリン',
    type: 'goblin',
    baseHp: 110,
    baseAttack: 10,
    expReward: 60,
    goldReward: 40,
    isBoss: false,
    avatarColor: 'from-amber-500 to-orange-700',
    description: '「明日やればいいや」と囁きかけてくる厄介な小鬼。',
  },
  {
    name: '誘惑のスケルトン',
    type: 'skeleton',
    baseHp: 180,
    baseAttack: 18,
    expReward: 100,
    goldReward: 70,
    isBoss: false,
    avatarColor: 'from-blue-400 to-indigo-600',
    description: 'スマホの通知やSNSで集中力を削いでくる骸骨戦士。',
  },
  {
    name: '重圧のゴーレム',
    type: 'golem',
    baseHp: 300,
    baseAttack: 25,
    expReward: 180,
    goldReward: 120,
    isBoss: false,
    avatarColor: 'from-purple-500 to-indigo-900',
    description: '積み重なった未完了タスクが具現化した巨大な岩石の魔人。',
  },
  {
    name: '破滅のドラゴン【BOSS】',
    type: 'dragon',
    baseHp: 600,
    baseAttack: 40,
    expReward: 400,
    goldReward: 300,
    isBoss: true,
    avatarColor: 'from-rose-500 to-red-900',
    description: 'すべてを投げ出したくなる圧倒的な絶望を纏う黒龍。',
  },
];
