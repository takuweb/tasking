'use client';

import { useState } from 'react';
import { GameProvider, useGame } from '@/context/GameContext';
import Navbar from '@/components/navigation/Navbar';
import BattleArena from '@/components/battle/BattleArena';
import TaskManager from '@/components/tasks/TaskManager';
import CharacterEquipment from '@/components/character/CharacterEquipment';
import LevelUpModal from '@/components/battle/LevelUpModal';

function MainApp() {
  const { loading, profile } = useGame();
  const [currentTab, setCurrentTab] = useState<'battle' | 'tasks' | 'character'>('battle');

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#090d16] text-slate-300">
        <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-bold tracking-wider text-amber-300 animate-pulse">
          冒険の書を読み込み中...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b14] flex flex-col selection:bg-amber-500 selection:text-black">
      <Navbar currentTab={currentTab} onTabChange={setCurrentTab} />

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6">
        {/* デスクトップ表示 (md以上): 左にバトル画面、右にタスク/装備を並べて同時表示 */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-6">
          {/* 左カラム: バトルアリーナ (幅5) */}
          <div className="lg:col-span-5 sticky top-20 self-start">
            <BattleArena />
          </div>

          {/* 右カラム: タスク一覧またはキャラクター情報 (幅7) */}
          <div className="lg:col-span-7">
            {currentTab === 'character' ? (
              <CharacterEquipment />
            ) : (
              <TaskManager />
            )}
          </div>
        </div>

        {/* モバイル・タブレット表示 (lg未満): タブによる切り替え表示 */}
        <div className="lg:hidden">
          {currentTab === 'battle' && <BattleArena />}
          {currentTab === 'tasks' && <TaskManager />}
          {currentTab === 'character' && <CharacterEquipment />}
        </div>
      </main>

      <LevelUpModal />
    </div>
  );
}

export default function HomePage() {
  return (
    <GameProvider>
      <MainApp />
    </GameProvider>
  );
}
