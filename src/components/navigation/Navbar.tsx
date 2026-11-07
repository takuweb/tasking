'use client';

import { useGame } from '@/context/GameContext';
import { useRouter } from 'next/navigation';
import { Sword, Shield, Scroll, LogOut, Flame, Heart, Sparkles, User, RefreshCw, KeyRound } from 'lucide-react';
import { logoutAction } from '@/app/auth/neon-actions';

interface NavbarProps {
  currentTab: 'battle' | 'tasks' | 'character';
  onTabChange: (tab: 'battle' | 'tasks' | 'character') => void;
}

export default function Navbar({ currentTab, onTabChange }: NavbarProps) {
  const { profile, isGuest, resetGameData } = useGame();
  const router = useRouter();

  if (!profile) return null;

  const handleSignOut = async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('task_rpg_logged_user');
    }
    await logoutAction();
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* ロゴ */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-blue-600/20 border border-amber-500/30">
            <Sword className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h1 className="text-base font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-400">
              TASK QUEST
            </h1>
            <p className="text-[10px] text-slate-400 font-medium">タスク育成RPG</p>
          </div>
        </div>

        {/* 勇者ステータス簡易インフォ (デスクトップ向け) */}
        <div className="hidden md:flex items-center gap-4 bg-slate-900/90 px-4 py-1.5 rounded-full border border-slate-800 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-amber-300">
            <span className="px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-[10px]">
              Lv.{profile.level}
            </span>
            <span className="text-slate-200 text-xs">{profile.username}</span>
          </div>

          <div className="h-3 w-px bg-slate-700" />

          <div className="flex items-center gap-1 text-rose-400 font-bold">
            <Heart className="w-3.5 h-3.5" />
            <span className="font-mono">{profile.hp}/{profile.max_hp}</span>
          </div>

          <div className="h-3 w-px bg-slate-700" />

          <div className="flex items-center gap-1 text-amber-400 font-bold">
            <Flame className="w-3.5 h-3.5" />
            <span className="font-mono">{profile.gold} G</span>
          </div>
        </div>

        {/* メインナビゲーションタブ */}
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-bold">
          <button
            onClick={() => onTabChange('battle')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              currentTab === 'battle'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sword className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">バトル</span>
          </button>
          <button
            onClick={() => onTabChange('tasks')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              currentTab === 'tasks'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Scroll className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">クエスト</span>
          </button>
          <button
            onClick={() => onTabChange('character')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              currentTab === 'character'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">ステータス</span>
          </button>
        </div>

        {/* 認証・ログアウト・リセットボタン */}
        <div className="flex items-center gap-2">
          {isGuest ? (
            <button
              onClick={() => router.push('/login')}
              className="text-xs px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600/40 to-indigo-600/40 border border-blue-500/50 text-blue-200 hover:text-white transition flex items-center gap-1.5 font-bold shadow-sm"
              title="IDとパスワードを決めてデータをクラウドに保存"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-300" />
              <span>冒険の書を保存</span>
            </button>
          ) : (
            <button
              onClick={handleSignOut}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
              title="ログアウト"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}

          {isGuest && (
            <button
              onClick={resetGameData}
              className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
              title="データを初期リセット"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
