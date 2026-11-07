'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Profile, Task, BattleState, ShopItem, UserInventoryItem, BattleLog, TaskDifficulty } from '@/types/database';
import { calculateLevelUpStats, calculateDamageToMonster, generateNextMonster } from '@/lib/game/calculator';
import { DIFFICULTY_CONFIG } from '@/types/game';
import {
  getGameDataAction,
  addTaskNeonAction,
  completeTaskNeonAction,
  deleteTaskNeonAction,
} from '@/app/actions/game-actions';
import confetti from 'canvas-confetti';

interface GameContextType {
  profile: Profile | null;
  tasks: Task[];
  battleState: BattleState | null;
  shopItems: ShopItem[];
  inventory: UserInventoryItem[];
  logs: BattleLog[];
  loading: boolean;
  isGuest: boolean;
  lastAttackResult: { damage: number; isCritical: boolean; monsterDefeated: boolean } | null;
  levelUpModalData: { newLevel: number; levelsGained: number } | null;
  
  // Actions
  addTask: (title: string, description: string, taskType: 'routine' | 'adhoc', frequency: 'daily' | 'weekly' | 'none', difficulty: TaskDifficulty) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  completeTask: (id: string) => Promise<void>;
  uncompleteTask: (id: string) => Promise<void>;
  buyItem: (item: ShopItem) => Promise<boolean>;
  equipItem: (userInventoryId: string) => Promise<void>;
  dismissLevelUpModal: () => void;
  resetGameData: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

// 初期モックデータ（ゲスト時用）
const DEFAULT_INITIAL_PROFILE: Profile = {
  id: 'guest-hero-id',
  username: '冒険者アルス',
  title: '駆け出しの勇者',
  avatar_url: null,
  level: 1,
  exp: 0,
  max_exp: 100,
  hp: 100,
  max_hp: 100,
  attack: 15,
  defense: 5,
  gold: 60,
  monsters_defeated: 0,
  bosses_defeated: 0,
  current_streak: 1,
  longest_streak: 1,
  last_active_date: new Date().toISOString().split('T')[0],
  stage_level: 1,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const DEFAULT_INITIAL_MONSTER: BattleState = {
  id: 'guest-monster-id',
  user_id: 'guest-hero-id',
  monster_name: '怠惰のスライム',
  monster_type: 'slime',
  monster_level: 1,
  is_boss: false,
  max_hp: 60,
  current_hp: 60,
  attack: 6,
  exp_reward: 35,
  gold_reward: 20,
  sprite_type: 'slime',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const DEFAULT_SHOP_ITEMS: ShopItem[] = [
  {
    id: 'item-1',
    name: '銅の剣',
    description: '冒険者が最初に手にする標準的な剣。攻撃力が+5される。',
    item_type: 'weapon',
    attack_bonus: 5,
    defense_bonus: 0,
    hp_bonus: 0,
    price: 50,
    icon_name: 'Sword',
    required_level: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: 'item-2',
    name: '鋼鉄のブロードソード',
    description: 'ずっしりとした重みのある頑丈な鉄剣。攻撃力が+15される。',
    item_type: 'weapon',
    attack_bonus: 15,
    defense_bonus: 0,
    hp_bonus: 0,
    price: 150,
    icon_name: 'Sword',
    required_level: 3,
    created_at: new Date().toISOString(),
  },
  {
    id: 'item-3',
    name: '革の冒険服',
    description: '軽くて動きやすい革製の鎧。防御力が+5、最大HPが+20される。',
    item_type: 'armor',
    attack_bonus: 0,
    defense_bonus: 5,
    hp_bonus: 20,
    price: 60,
    icon_name: 'Shield',
    required_level: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: 'item-4',
    name: '騎士のフルプレート',
    description: '重厚な金属の甲冑。防御力が+18、最大HPが+80される。',
    item_type: 'armor',
    attack_bonus: 0,
    defense_bonus: 18,
    hp_bonus: 80,
    price: 250,
    icon_name: 'Shield',
    required_level: 5,
    created_at: new Date().toISOString(),
  },
  {
    id: 'item-5',
    name: '疾風のタリスマン',
    description: '集中力と行動力を高めるお守り。攻撃力+10、防御力+8。',
    item_type: 'accessory',
    attack_bonus: 10,
    defense_bonus: 8,
    hp_bonus: 15,
    price: 220,
    icon_name: 'Sparkles',
    required_level: 3,
    created_at: new Date().toISOString(),
  },
  {
    id: 'item-6',
    name: '全快の秘薬',
    description: '飲んだ瞬間にHPが満タンまで回復する神秘のポーション。',
    item_type: 'potion',
    attack_bonus: 0,
    defense_bonus: 0,
    hp_bonus: 0,
    price: 40,
    icon_name: 'FlaskRound',
    required_level: 1,
    created_at: new Date().toISOString(),
  },
];

const DEFAULT_INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    user_id: 'guest-hero-id',
    title: 'チュートリアル: このタスクにチェックを入れてスライムを攻撃！',
    description: 'タスクを完了すると敵にダメージが入り、EXPとゴールドを獲得します。',
    task_type: 'adhoc',
    frequency: 'none',
    difficulty: 'easy',
    exp_reward: 25,
    gold_reward: 15,
    is_completed: false,
    completed_at: null,
    due_date: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'task-2',
    user_id: 'guest-hero-id',
    title: '朝の水分補給と軽いストレッチ',
    description: '毎朝の体調を整えるためのルーティンクエストです。',
    task_type: 'routine',
    frequency: 'daily',
    difficulty: 'easy',
    exp_reward: 20,
    gold_reward: 10,
    is_completed: false,
    completed_at: null,
    due_date: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [battleState, setBattleState] = useState<BattleState | null>(null);
  const [shopItems] = useState<ShopItem[]>(DEFAULT_SHOP_ITEMS);
  const [inventory, setInventory] = useState<UserInventoryItem[]>([]);
  const [logs, setLogs] = useState<BattleLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [lastAttackResult, setLastAttackResult] = useState<{ damage: number; isCritical: boolean; monsterDefeated: boolean } | null>(null);
  const [levelUpModalData, setLevelUpModalData] = useState<{ newLevel: number; levelsGained: number } | null>(null);

  // ローカルストレージへの永続化ヘルパー (ゲスト用)
  const saveToLocalStorage = useCallback((newProfile: Profile, newTasks: Task[], newBattle: BattleState, newInv: UserInventoryItem[], newLogs: BattleLog[]) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('task_rpg_profile', JSON.stringify(newProfile));
      localStorage.setItem('task_rpg_tasks', JSON.stringify(newTasks));
      localStorage.setItem('task_rpg_battle', JSON.stringify(newBattle));
      localStorage.setItem('task_rpg_inventory', JSON.stringify(newInv));
      localStorage.setItem('task_rpg_logs', JSON.stringify(newLogs));
    } catch (e) {
      console.error('LocalStorage save error:', e);
    }
  }, []);

  // 初期ロード
  useEffect(() => {
    async function initGameData() {
      setLoading(true);
      try {
        // Neon経由のセッションチェック
        const data = await getGameDataAction();

        if (data.user && data.profile) {
          // Neon ログイン中
          setIsGuest(false);
          setProfile(data.profile);
          setTasks(data.tasks);
          setBattleState(data.battleState);
          setInventory(data.inventory);
          setLogs(data.logs);
        } else {
          // ゲストモード (LocalStorage)
          setIsGuest(true);
          const localProfile = typeof window !== 'undefined' ? localStorage.getItem('task_rpg_profile') : null;
          const localTasks = typeof window !== 'undefined' ? localStorage.getItem('task_rpg_tasks') : null;
          const localBattle = typeof window !== 'undefined' ? localStorage.getItem('task_rpg_battle') : null;
          const localInv = typeof window !== 'undefined' ? localStorage.getItem('task_rpg_inventory') : null;
          const localLogs = typeof window !== 'undefined' ? localStorage.getItem('task_rpg_logs') : null;

          setProfile(localProfile ? JSON.parse(localProfile) : DEFAULT_INITIAL_PROFILE);
          setTasks(localTasks ? JSON.parse(localTasks) : DEFAULT_INITIAL_TASKS);
          setBattleState(localBattle ? JSON.parse(localBattle) : DEFAULT_INITIAL_MONSTER);
          setInventory(localInv ? JSON.parse(localInv) : []);
          setLogs(localLogs ? JSON.parse(localLogs) : [
            {
              id: 'init-log',
              user_id: 'guest-hero-id',
              message: '冒険の旅が始まりました！タスクを完了して敵を攻撃しましょう！',
              log_type: 'item',
              created_at: new Date().toISOString(),
            }
          ]);
        }
      } catch (err) {
        console.warn('Neon接続なしまたは未ログイン、ゲストモードに切り替えます:', err);
        setIsGuest(true);
        setProfile(DEFAULT_INITIAL_PROFILE);
        setTasks(DEFAULT_INITIAL_TASKS);
        setBattleState(DEFAULT_INITIAL_MONSTER);
      } finally {
        setLoading(false);
      }
    }

    initGameData();
  }, []);

  // タスク追加
  const addTask = async (
    title: string,
    description: string,
    taskType: 'routine' | 'adhoc',
    frequency: 'daily' | 'weekly' | 'none',
    difficulty: TaskDifficulty
  ) => {
    if (!profile) return;
    const config = DIFFICULTY_CONFIG[difficulty];

    if (!isGuest) {
      try {
        const createdTask = await addTaskNeonAction(title, description, taskType, frequency, difficulty);
        if (createdTask) {
          setTasks([createdTask, ...tasks]);
          return;
        }
      } catch (e) {
        console.error('Neon addTask error:', e);
      }
    }

    // ゲストまたはフォールバック
    const newTask: Task = {
      id: crypto.randomUUID(),
      user_id: profile.id,
      title,
      description,
      task_type: taskType,
      frequency,
      difficulty,
      exp_reward: config.exp,
      gold_reward: config.gold,
      is_completed: false,
      completed_at: null,
      due_date: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const nextTasks = [newTask, ...tasks];
    setTasks(nextTasks);
    if (battleState) {
      saveToLocalStorage(profile, nextTasks, battleState, inventory, logs);
    }
  };

  // タスク更新
  const updateTask = async (id: string, updates: Partial<Task>) => {
    const nextTasks = tasks.map((t) => (t.id === id ? { ...t, ...updates, updated_at: new Date().toISOString() } : t));
    setTasks(nextTasks);
    if (profile && battleState) {
      saveToLocalStorage(profile, nextTasks, battleState, inventory, logs);
    }
  };

  // タスク削除
  const deleteTask = async (id: string) => {
    const nextTasks = tasks.filter((t) => t.id !== id);
    setTasks(nextTasks);

    if (!isGuest) {
      try {
        await deleteTaskNeonAction(id);
      } catch (e) {
        console.error('Neon deleteTask error:', e);
      }
    } else if (profile && battleState) {
      saveToLocalStorage(profile, nextTasks, battleState, inventory, logs);
    }
  };

  // タスク完了処理（バトル・EXP・ゴールド連動）
  const completeTask = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task || task.is_completed || !profile || !battleState) return;

    if (!isGuest) {
      try {
        const result = await completeTaskNeonAction(id);
        if (result) {
          // 紙吹雪
          if (result.monsterDefeated) {
            try {
              confetti({
                particleCount: battleState.is_boss ? 120 : 60,
                spread: battleState.is_boss ? 100 : 70,
                origin: { y: 0.6 },
                colors: battleState.is_boss ? ['#ef4444', '#f59e0b', '#8b5cf6'] : ['#10b981', '#3b82f6', '#f59e0b'],
              });
            } catch {}
          }
          if (result.levelUpData) {
            setLevelUpModalData(result.levelUpData);
          }
          setLastAttackResult({
            damage: result.damage,
            isCritical: result.isCritical,
            monsterDefeated: result.monsterDefeated,
          });

          // 最新データを再取得
          const refreshed = await getGameDataAction();
          if (refreshed.profile) {
            setProfile(refreshed.profile);
            setTasks(refreshed.tasks);
            setBattleState(refreshed.battleState);
            setLogs(refreshed.logs);
          }
          return;
        }
      } catch (e) {
        console.error('Neon completeTask error:', e);
      }
    }

    // ゲスト用ローカル計算
    const { damage, isCritical } = calculateDamageToMonster(profile.attack, task.difficulty);
    const newMonsterHp = Math.max(0, battleState.current_hp - damage);
    const monsterDefeated = newMonsterHp === 0;

    const attackLog: BattleLog = {
      id: crypto.randomUUID(),
      user_id: profile.id,
      message: `${isCritical ? '⚡会心の一撃！ ' : ''}「${task.title}」を完了し、${battleState.monster_name}に ${damage} のダメージを与えた！`,
      log_type: 'attack',
      created_at: new Date().toISOString(),
    };

    let nextLogs = [attackLog, ...logs.slice(0, 15)];
    let earnedExp = task.exp_reward;
    let earnedGold = task.gold_reward;
    let nextBattleState: BattleState = { ...battleState, current_hp: newMonsterHp };
    let newMonstersDefeated = profile.monsters_defeated;
    let newBossesDefeated = profile.bosses_defeated;
    let nextStageLevel = profile.stage_level;

    if (monsterDefeated) {
      try {
        confetti({
          particleCount: battleState.is_boss ? 120 : 60,
          spread: battleState.is_boss ? 100 : 70,
          origin: { y: 0.6 },
          colors: battleState.is_boss ? ['#ef4444', '#f59e0b', '#8b5cf6'] : ['#10b981', '#3b82f6', '#f59e0b'],
        });
      } catch {}

      earnedExp += battleState.exp_reward;
      earnedGold += battleState.gold_reward;
      newMonstersDefeated += 1;
      if (battleState.is_boss) {
        newBossesDefeated += 1;
        nextStageLevel += 1;
      }

      const killLog: BattleLog = {
        id: crypto.randomUUID(),
        user_id: profile.id,
        message: `🎉 見事 ${battleState.monster_name} を討伐！ +${battleState.exp_reward} EXP / +${battleState.gold_reward} G を獲得！`,
        log_type: 'kill',
        created_at: new Date().toISOString(),
      };
      nextLogs = [killLog, ...nextLogs];

      const nextMonsterData = generateNextMonster(newMonstersDefeated, nextStageLevel);
      nextBattleState = {
        ...nextBattleState,
        ...nextMonsterData,
        current_hp: nextMonsterData.max_hp,
      };
    }

    const levelResult = calculateLevelUpStats(profile, earnedExp);
    if (levelResult.leveledUp) {
      setLevelUpModalData({
        newLevel: levelResult.newLevel,
        levelsGained: levelResult.levelsGained,
      });

      const levelLog: BattleLog = {
        id: crypto.randomUUID(),
        user_id: profile.id,
        message: `✨ レベルアップ！ Lv.${levelResult.newLevel} に到達！ HP全快 & ステータス上昇！`,
        log_type: 'level_up',
        created_at: new Date().toISOString(),
      };
      nextLogs = [levelLog, ...nextLogs];
    }

    const nextProfile: Profile = {
      ...profile,
      level: levelResult.newLevel,
      exp: levelResult.newExp,
      max_exp: levelResult.newMaxExp,
      hp: levelResult.newHp,
      max_hp: levelResult.newMaxHp,
      attack: levelResult.newAttack,
      defense: levelResult.newDefense,
      gold: profile.gold + earnedGold,
      monsters_defeated: newMonstersDefeated,
      bosses_defeated: newBossesDefeated,
      stage_level: nextStageLevel,
      updated_at: new Date().toISOString(),
    };

    const nextTasks = tasks.map((t) =>
      t.id === id ? { ...t, is_completed: true, completed_at: new Date().toISOString() } : t
    );

    setProfile(nextProfile);
    setTasks(nextTasks);
    setBattleState(nextBattleState);
    setLogs(nextLogs);
    setLastAttackResult({ damage, isCritical, monsterDefeated });

    saveToLocalStorage(nextProfile, nextTasks, nextBattleState, inventory, nextLogs);
  };

  const uncompleteTask = async (id: string) => {
    const nextTasks = tasks.map((t) =>
      t.id === id ? { ...t, is_completed: false, completed_at: null } : t
    );
    setTasks(nextTasks);
    if (profile && battleState) {
      saveToLocalStorage(profile, nextTasks, battleState, inventory, logs);
    }
  };

  const buyItem = async (item: ShopItem): Promise<boolean> => {
    if (!profile || profile.gold < item.price) return false;

    if (item.item_type === 'potion') {
      const nextProfile: Profile = {
        ...profile,
        gold: profile.gold - item.price,
        hp: profile.max_hp,
      };
      setProfile(nextProfile);
      const healLog: BattleLog = {
        id: crypto.randomUUID(),
        user_id: profile.id,
        message: `🧪「${item.name}」を使用し、HPが全回復した！`,
        log_type: 'heal',
        created_at: new Date().toISOString(),
      };
      const nextLogs = [healLog, ...logs];
      setLogs(nextLogs);
      if (battleState) {
        saveToLocalStorage(nextProfile, tasks, battleState, inventory, nextLogs);
      }
      return true;
    }

    const existing = inventory.find((i) => i.item_id === item.id);
    let nextInventory: UserInventoryItem[];

    if (existing) {
      nextInventory = inventory.map((i) =>
        i.item_id === item.id ? { ...i, quantity: i.quantity + 1 } : i
      );
    } else {
      const newInvItem: UserInventoryItem = {
        id: crypto.randomUUID(),
        user_id: profile.id,
        item_id: item.id,
        is_equipped: false,
        quantity: 1,
        acquired_at: new Date().toISOString(),
        shop_item: item,
      };
      nextInventory = [...inventory, newInvItem];
    }

    const nextProfile: Profile = {
      ...profile,
      gold: profile.gold - item.price,
    };

    const buyLog: BattleLog = {
      id: crypto.randomUUID(),
      user_id: profile.id,
      message: `💰「${item.name}」を ${item.price} G で購入した！`,
      log_type: 'item',
      created_at: new Date().toISOString(),
    };
    const nextLogs = [buyLog, ...logs];

    setProfile(nextProfile);
    setInventory(nextInventory);
    setLogs(nextLogs);

    if (battleState) {
      saveToLocalStorage(nextProfile, tasks, battleState, nextInventory, nextLogs);
    }
    return true;
  };

  const equipItem = async (userInventoryId: string) => {
    if (!profile) return;
    const targetItem = inventory.find((i) => i.id === userInventoryId);
    if (!targetItem || !targetItem.shop_item) return;

    const item = targetItem.shop_item;
    const isNowEquipped = !targetItem.is_equipped;

    const nextInventory = inventory.map((inv) => {
      if (inv.id === userInventoryId) {
        return { ...inv, is_equipped: isNowEquipped };
      }
      if (isNowEquipped && inv.shop_item?.item_type === item.item_type) {
        return { ...inv, is_equipped: false };
      }
      return inv;
    });

    const statMod = isNowEquipped ? 1 : -1;
    const nextProfile: Profile = {
      ...profile,
      attack: Math.max(10, profile.attack + item.attack_bonus * statMod),
      defense: Math.max(0, profile.defense + item.defense_bonus * statMod),
      max_hp: Math.max(50, profile.max_hp + item.hp_bonus * statMod),
      hp: Math.min(profile.max_hp + item.hp_bonus * statMod, profile.hp + (item.hp_bonus > 0 ? item.hp_bonus * statMod : 0)),
    };

    setProfile(nextProfile);
    setInventory(nextInventory);

    const equipLog: BattleLog = {
      id: crypto.randomUUID(),
      user_id: profile.id,
      message: isNowEquipped
        ? `🛡️「${item.name}」を装備した！`
        : `🛡️「${item.name}」を外した。`,
      log_type: 'item',
      created_at: new Date().toISOString(),
    };
    const nextLogs = [equipLog, ...logs];
    setLogs(nextLogs);

    if (battleState) {
      saveToLocalStorage(nextProfile, tasks, battleState, nextInventory, nextLogs);
    }
  };

  const dismissLevelUpModal = () => {
    setLevelUpModalData(null);
  };

  const resetGameData = () => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <GameContext.Provider
      value={{
        profile,
        tasks,
        battleState,
        shopItems,
        inventory,
        logs,
        loading,
        isGuest,
        lastAttackResult,
        levelUpModalData,
        addTask,
        updateTask,
        deleteTask,
        completeTask,
        uncompleteTask,
        buyItem,
        equipItem,
        dismissLevelUpModal,
        resetGameData,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
