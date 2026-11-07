'use client';

import { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { TaskDifficulty, TaskType, RoutineFrequency } from '@/types/database';
import { DIFFICULTY_CONFIG } from '@/types/game';
import {
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Calendar,
  Sparkles,
  Flame,
  Check,
  Tag,
  Clock,
  Filter,
} from 'lucide-react';

export default function TaskManager() {
  const { tasks, addTask, completeTask, uncompleteTask, deleteTask } = useGame();

  const [activeTab, setActiveTab] = useState<'all' | 'routine' | 'adhoc'>('all');
  const [filterCompleted, setFilterCompleted] = useState<'all' | 'pending' | 'completed'>('all');

  // 新規タスクフォーム状態
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [taskType, setTaskType] = useState<TaskType>('adhoc');
  const [frequency, setFrequency] = useState<RoutineFrequency>('none');
  const [difficulty, setDifficulty] = useState<TaskDifficulty>('medium');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await addTask(
      title.trim(),
      description.trim(),
      taskType,
      taskType === 'routine' ? frequency : 'none',
      difficulty
    );

    // リセット
    setTitle('');
    setDescription('');
    setIsFormOpen(false);
  };

  // フィルタリング処理
  const filteredTasks = tasks.filter((t) => {
    if (activeTab === 'routine' && t.task_type !== 'routine') return false;
    if (activeTab === 'adhoc' && t.task_type !== 'adhoc') return false;
    if (filterCompleted === 'pending' && t.is_completed) return false;
    if (filterCompleted === 'completed' && !t.is_completed) return false;
    return true;
  });

  const pendingCount = tasks.filter((t) => !t.is_completed).length;
  const completedCount = tasks.filter((t) => t.is_completed).length;

  return (
    <div className="space-y-6">
      {/* 上部コントロールバー */}
      <div className="rpg-panel p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-800">
        {/* タイプタブ */}
        <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              activeTab === 'all'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            全クエスト ({tasks.length})
          </button>
          <button
            onClick={() => setActiveTab('routine')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 ${
              activeTab === 'routine'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            日課・ルーティン
          </button>
          <button
            onClick={() => setActiveTab('adhoc')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 ${
              activeTab === 'adhoc'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            突発ToDo
          </button>
        </div>

        {/* 状態フィルタ & 追加ボタン */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-900/90 px-2.5 py-1 rounded-xl border border-slate-800 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
            <select
              value={filterCompleted}
              onChange={(e) => setFilterCompleted(e.target.value as 'all' | 'pending' | 'completed')}
              className="bg-transparent text-slate-300 font-medium focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900">すべて表示</option>
              <option value="pending" className="bg-slate-900">未達成のみ ({pendingCount})</option>
              <option value="completed" className="bg-slate-900">討伐済み ({completedCount})</option>
            </select>
          </div>

          <button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-[0_2px_12px_rgba(245,158,11,0.3)] transition transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>クエストを受注</span>
          </button>
        </div>
      </div>

      {/* 新規クエスト作成モーダル */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-slate-900 border border-amber-500/40 rounded-2xl p-6 shadow-2xl relative">
            <h3 className="text-lg font-black text-amber-400 mb-1 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              新規クエストの受注書を作成
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              難易度が高いクエストほど、敵へ与えるダメージと獲得EXP・ゴールドが増加します。
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  クエスト名（タスクのタイトル） *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="例: プログラミングの基礎演習を30分行う"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  詳細メモ（任意）
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="例: 第3章の課題を解ききる。"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    タスク種別
                  </label>
                  <select
                    value={taskType}
                    onChange={(e) => setTaskType(e.target.value as TaskType)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                  >
                    <option value="adhoc">突発ToDo（単発）</option>
                    <option value="routine">日課・習慣（ルーティン）</option>
                  </select>
                </div>

                {taskType === 'routine' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      リセット頻度
                    </label>
                    <select
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value as RoutineFrequency)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                    >
                      <option value="daily">毎日（デイリー）</option>
                      <option value="weekly">毎週（ウィークリー）</option>
                    </select>
                  </div>
                )}
              </div>

              {/* 難易度選択 */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  難易度選択（報酬と攻撃力に直結）
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['easy', 'medium', 'hard', 'boss'] as TaskDifficulty[]).map((diff) => {
                    const cfg = DIFFICULTY_CONFIG[diff];
                    const isSelected = difficulty === diff;
                    return (
                      <button
                        key={diff}
                        type="button"
                        onClick={() => setDifficulty(diff)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? `${cfg.badgeColor} border-amber-400 ring-2 ring-amber-400/30 scale-[1.02]`
                            : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="font-extrabold text-xs mb-1 flex items-center justify-between">
                          <span>{cfg.label.split('（')[0]}</span>
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <div className="text-[10px] space-y-0.5 opacity-90">
                          <div>EXP: +{cfg.exp}</div>
                          <div>Gold: +{cfg.gold}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow transition transform active:scale-95"
                >
                  クエストを受注する
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* タスクリスト */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="rpg-panel p-8 text-center border border-slate-800 text-slate-400">
            <Calendar className="w-10 h-10 mx-auto mb-2 text-slate-600" />
            <p className="font-bold text-sm">該当するクエストがありません</p>
            <p className="text-xs text-slate-500 mt-1">
              「クエストを受注」ボタンから新しいタスクを登録してください。
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const config = DIFFICULTY_CONFIG[task.difficulty];
            return (
              <div
                key={task.id}
                className={`rpg-panel p-4 flex items-start justify-between gap-3 border transition-all ${
                  task.is_completed
                    ? 'opacity-60 bg-slate-950/40 border-slate-900'
                    : `border-slate-800 hover:border-slate-700 ${config.bgGlow}`
                }`}
              >
                {/* 完了チェッカーボタン (攻撃トリガー) */}
                <button
                  type="button"
                  onClick={() =>
                    task.is_completed ? uncompleteTask(task.id) : completeTask(task.id)
                  }
                  className="mt-0.5 shrink-0 transition-transform active:scale-90 group"
                  title={task.is_completed ? '未完了に戻す' : 'クエスト完了！敵を攻撃する'}
                >
                  {task.is_completed ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 drop-shadow-[0_0_6px_rgba(16,185,129,0.7)]" />
                  ) : (
                    <Circle className="w-6 h-6 text-slate-500 group-hover:text-amber-400 group-hover:scale-110 transition" />
                  )}
                </button>

                {/* タスク内容 */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h4
                      className={`text-sm font-bold truncate ${
                        task.is_completed
                          ? 'line-through text-slate-500'
                          : 'text-slate-100'
                      }`}
                    >
                      {task.title}
                    </h4>

                    {/* 難易度バッジ */}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${config.badgeColor}`}
                    >
                      {config.label}
                    </span>

                    {/* ルーティン種別バッジ */}
                    {task.task_type === 'routine' && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-950/70 text-blue-400 border border-blue-500/30">
                        {task.frequency === 'daily' ? '毎日' : '毎週'}
                      </span>
                    )}
                  </div>

                  {task.description && (
                    <p className="text-xs text-slate-400 line-clamp-2 mb-2">
                      {task.description}
                    </p>
                  )}

                  {/* 報酬プレビュー */}
                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-400" />
                      +{task.exp_reward} EXP
                    </span>
                    <span className="flex items-center gap-1">
                      <Flame className="w-3 h-3 text-amber-400" />
                      +{task.gold_reward} G
                    </span>
                    {task.completed_at && (
                      <span className="text-slate-500 text-[10px]">
                        達成日時: {new Date(task.completed_at).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                </div>

                {/* アクション */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                    title="タスクを破棄"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
