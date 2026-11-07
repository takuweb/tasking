'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Sparkles, Sword, Lock, User, AlertCircle, ArrowRight, KeyRound } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [adventurerId, setAdventurerId] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 冒険者IDから内部認証用のアドレスを自動生成（ユーザーには完全非公開）
  const toInternalEmail = (id: string) => {
    // 英数字とアンダースコアのみに正規化
    const safeId = id.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    return `${safeId || 'hero'}@taskquest.local`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const safeId = adventurerId.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (safeId.length < 3) {
      setError('冒険者IDは半角英数字3文字以上で入力してください。');
      return;
    }
    if (password.length < 6) {
      setError('合言葉（パスワード）は6文字以上で入力してください。');
      return;
    }

    setLoading(true);
    const internalEmail = toInternalEmail(safeId);

    try {
      const supabase = createClient();

      if (isSignUp) {
        const heroName = displayName.trim() || adventurerId.trim();
        const { error: signUpError } = await supabase.auth.signUp({
          email: internalEmail,
          password: password,
          options: {
            data: {
              username: heroName,
              adventurer_id: safeId,
            },
          },
        });

        if (signUpError) {
          if (signUpError.message.includes('already registered')) {
            throw new Error('その冒険者IDはすでに他の勇者に使用されています。別のIDをお試しください。');
          }
          throw signUpError;
        }

        router.push('/');
        router.refresh();
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: internalEmail,
          password: password,
        });

        if (signInError) {
          if (signInError.message.includes('Invalid login credentials')) {
            throw new Error('冒険者IDまたは合言葉（パスワード）が正しくありません。');
          }
          throw signInError;
        }

        router.push('/');
        router.refresh();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '認証中にエラーが発生しました。';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoGuestLogin = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('task_rpg_guest_mode', 'true');
    }
    router.push('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#070b14]">
      {/* 背景の魔方陣・グリッド演出 */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293d15_1px,transparent_1px),linear-gradient(to_bottom,#1f293d15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* アプリロゴ・ヘッダー */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-amber-500/20 to-blue-600/20 border border-amber-500/30 shadow-[0_0_25px_rgba(245,158,11,0.2)] mb-4">
            <Sword className="w-10 h-10 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
          </div>
          <h1 className="text-3xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-orange-400">
            TASK QUEST
          </h1>
          <p className="text-xs text-amber-300/90 font-bold mt-1 tracking-wide">
            ★ メールアドレス不要！IDと合言葉だけで簡単ログイン
          </p>
        </div>

        {/* 認証カード */}
        <div className="rpg-panel border border-slate-700/60 p-6 md:p-8 shadow-2xl relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-900 px-4 py-0.5 rounded-full border border-amber-500/40 text-[11px] font-semibold text-amber-300 tracking-wider uppercase">
            冒険者ギルド登録所
          </div>

          {/* タブ切り替え */}
          <div className="flex bg-slate-900/80 p-1 rounded-xl border border-slate-800 mb-6">
            <button
              type="button"
              onClick={() => { setIsSignUp(false); setError(null); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                !isSignUp
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              冒険を再開 (ログイン)
            </button>
            <button
              type="button"
              onClick={() => { setIsSignUp(true); setError(null); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                isSignUp
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              新規冒険の書を作成
            </button>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 冒険者ID */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  冒険者ID (ログイン用)
                </span>
                <span className="text-[10px] text-slate-500">半角英数字3文字以上</span>
              </label>
              <input
                type="text"
                required
                value={adventurerId}
                onChange={(e) => setAdventurerId(e.target.value)}
                placeholder="例: arusu77"
                pattern="^[a-zA-Z0-9_]{3,}$"
                title="半角英数字3文字以上"
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
              />
            </div>

            {/* 新規登録時の表示名（日本語可） */}
            {isSignUp && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  勇者ネーム（画面に表示する名前・日本語可）
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="例: 勇者アルス（省略時はIDと同じ）"
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
                />
              </div>
            )}

            {/* 合言葉（パスワード） */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  合言葉 (パスワード)
                </span>
                <span className="text-[10px] text-slate-500">6文字以上</span>
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-[0_4px_20px_rgba(245,158,11,0.3)] transition transform active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none mt-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>{isSignUp ? '冒険の書を作成して旅立つ' : '冒険の書を開いて再開'}</span>
                </>
              )}
            </button>
          </form>

          {/* 区切り線 */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-900/90 px-3 text-slate-500 font-semibold">または</span>
            </div>
          </div>

          {/* お試しゲストログイン */}
          <button
            type="button"
            onClick={handleDemoGuestLogin}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 transition flex items-center justify-center gap-2 group"
          >
            <Sparkles className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform" />
            <span>ID作成すら不要・ゲストとして今すぐ遊ぶ</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* フッター補足 */}
        <p className="text-center text-[11px] text-slate-500 mt-6">
          登録した「冒険者ID」と「合言葉」を使えば、スマホや別のPCからでも続きをプレイできます。
        </p>
      </div>
    </div>
  );
}
