// Supabase Database Types
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type TaskType = 'routine' | 'adhoc';
export type RoutineFrequency = 'daily' | 'weekly' | 'none';
export type TaskDifficulty = 'easy' | 'medium' | 'hard' | 'boss';
export type MonsterType = 'slime' | 'goblin' | 'skeleton' | 'golem' | 'dragon';
export type ItemType = 'weapon' | 'armor' | 'accessory' | 'potion';
export type LogType = 'attack' | 'kill' | 'level_up' | 'damage' | 'heal' | 'item';

export interface Profile {
  id: string;
  username: string;
  title: string;
  avatar_url: string | null;
  level: number;
  exp: number;
  max_exp: number;
  hp: number;
  max_hp: number;
  attack: number;
  defense: number;
  gold: number;
  monsters_defeated: number;
  bosses_defeated: number;
  current_streak: number;
  longest_streak: number;
  last_active_date: string;
  stage_level: number;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string;
  task_type: TaskType;
  frequency: RoutineFrequency;
  difficulty: TaskDifficulty;
  exp_reward: number;
  gold_reward: number;
  is_completed: boolean;
  completed_at: string | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface BattleState {
  id: string;
  user_id: string;
  monster_name: string;
  monster_type: MonsterType;
  monster_level: number;
  is_boss: boolean;
  max_hp: number;
  current_hp: number;
  attack: number;
  exp_reward: number;
  gold_reward: number;
  sprite_type: string;
  created_at: string;
  updated_at: string;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  item_type: ItemType;
  attack_bonus: number;
  defense_bonus: number;
  hp_bonus: number;
  price: number;
  icon_name: string;
  required_level: number;
  created_at: string;
}

export interface UserInventoryItem {
  id: string;
  user_id: string;
  item_id: string;
  is_equipped: boolean;
  quantity: number;
  acquired_at: string;
  shop_item?: ShopItem;
}

export interface BattleLog {
  id: string;
  user_id: string;
  message: string;
  log_type: LogType;
  created_at: string;
}
