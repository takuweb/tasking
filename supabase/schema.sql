-- ==============================================================================
-- タスク育成RPG (Task RPG) データベーススキーマ
-- Supabase (PostgreSQL) 向け定義
-- ==============================================================================

-- 拡張機能の有効化
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ユーザープロファイル & キャラクターステータステーブル
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT NOT NULL DEFAULT '勇者',
    title TEXT NOT NULL DEFAULT '見習い冒険者',
    avatar_url TEXT DEFAULT '',
    
    -- ステータス情報
    level INT NOT NULL DEFAULT 1,
    exp INT NOT NULL DEFAULT 0,
    max_exp INT NOT NULL DEFAULT 100,
    hp INT NOT NULL DEFAULT 100,
    max_hp INT NOT NULL DEFAULT 100,
    attack INT NOT NULL DEFAULT 15,
    defense INT NOT NULL DEFAULT 5,
    gold INT NOT NULL DEFAULT 50,
    
    -- ゲーム進行実績
    monsters_defeated INT NOT NULL DEFAULT 0,
    bosses_defeated INT NOT NULL DEFAULT 0,
    current_streak INT NOT NULL DEFAULT 0,
    longest_streak INT NOT NULL DEFAULT 0,
    last_active_date DATE DEFAULT CURRENT_DATE,
    stage_level INT NOT NULL DEFAULT 1,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. タスク管理テーブル
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    
    -- タスクの種類: routine (ルーティン・習慣) / adhoc (突発・ToDo)
    task_type TEXT NOT NULL CHECK (task_type IN ('routine', 'adhoc')) DEFAULT 'adhoc',
    
    -- ルーティンの頻度: daily (毎日) / weekly (毎週) / none
    frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'none')) DEFAULT 'none',
    
    -- 難易度: easy (スライム級) / medium (ゴブリン級) / hard (ゴーレム級) / boss (ドラゴン級)
    difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard', 'boss')) DEFAULT 'medium',
    
    -- 報酬値
    exp_reward INT NOT NULL DEFAULT 20,
    gold_reward INT NOT NULL DEFAULT 10,
    
    -- 完了フラグ
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    due_date TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. 戦闘状態テーブル (ユーザーごとに現在戦っている敵を管理)
CREATE TABLE IF NOT EXISTS public.battle_states (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    monster_name TEXT NOT NULL DEFAULT '野生のスライム',
    monster_type TEXT NOT NULL DEFAULT 'slime', -- 'slime', 'goblin', 'skeleton', 'golem', 'dragon'
    monster_level INT NOT NULL DEFAULT 1,
    is_boss BOOLEAN NOT NULL DEFAULT FALSE,
    max_hp INT NOT NULL DEFAULT 50,
    current_hp INT NOT NULL DEFAULT 50,
    attack INT NOT NULL DEFAULT 8,
    exp_reward INT NOT NULL DEFAULT 40,
    gold_reward INT NOT NULL DEFAULT 25,
    sprite_type TEXT NOT NULL DEFAULT 'slime',
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. ショップアイテム・装備マスタテーブル
CREATE TABLE IF NOT EXISTS public.shop_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    item_type TEXT NOT NULL CHECK (item_type IN ('weapon', 'armor', 'accessory', 'potion')),
    attack_bonus INT NOT NULL DEFAULT 0,
    defense_bonus INT NOT NULL DEFAULT 0,
    hp_bonus INT NOT NULL DEFAULT 0,
    price INT NOT NULL DEFAULT 100,
    icon_name TEXT NOT NULL DEFAULT 'Sword',
    required_level INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. ユーザー所持アイテム・装備テーブル
CREATE TABLE IF NOT EXISTS public.user_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES public.shop_items(id) ON DELETE CASCADE,
    is_equipped BOOLEAN NOT NULL DEFAULT FALSE,
    quantity INT NOT NULL DEFAULT 1,
    acquired_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, item_id)
);

-- 6. バトルログテーブル (アクション履歴)
CREATE TABLE IF NOT EXISTS public.battle_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    log_type TEXT NOT NULL CHECK (log_type IN ('attack', 'kill', 'level_up', 'damage', 'heal', 'item')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- インデックスの作成
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_is_completed ON public.tasks(is_completed);
CREATE INDEX IF NOT EXISTS idx_inventory_user_id ON public.user_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_battle_logs_user_id ON public.battle_logs(user_id);

-- ==============================================================================
-- Row Level Security (RLS) ポリシー設定
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battle_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battle_logs ENABLE ROW LEVEL SECURITY;

-- profiles ポリシー
CREATE POLICY "Users can view their own profile" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

-- tasks ポリシー
CREATE POLICY "Users can view their own tasks" 
    ON public.tasks FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks" 
    ON public.tasks FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks" 
    ON public.tasks FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks" 
    ON public.tasks FOR DELETE 
    USING (auth.uid() = user_id);

-- battle_states ポリシー
CREATE POLICY "Users can view their battle state" 
    ON public.battle_states FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their battle state" 
    ON public.battle_states FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their battle state" 
    ON public.battle_states FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- shop_items ポリシー (全ユーザーが閲覧可能)
CREATE POLICY "Everyone can view shop items" 
    ON public.shop_items FOR SELECT 
    TO authenticated
    USING (true);

-- user_inventory ポリシー
CREATE POLICY "Users can view their own inventory" 
    ON public.user_inventory FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their inventory" 
    ON public.user_inventory FOR ALL 
    USING (auth.uid() = user_id);

-- battle_logs ポリシー
CREATE POLICY "Users can view their own logs" 
    ON public.battle_logs FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own logs" 
    ON public.battle_logs FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- ==============================================================================
-- トリガー関数: 新規ユーザー作成時に profile と 初回敵を自動生成
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- 1. profiles 作成
    INSERT INTO public.profiles (id, username)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1), '勇者')
    );

    -- 2. 初回 battle_state 作成
    INSERT INTO public.battle_states (
        user_id,
        monster_name,
        monster_type,
        monster_level,
        is_boss,
        max_hp,
        current_hp,
        attack,
        exp_reward,
        gold_reward,
        sprite_type
    ) VALUES (
        new.id,
        'はじまりのスライム',
        'slime',
        1,
        false,
        50,
        50,
        5,
        30,
        15,
        'slime'
    );

    -- 3. 初期タスクの投入 (チュートリアル)
    INSERT INTO public.tasks (user_id, title, description, task_type, difficulty, exp_reward, gold_reward)
    VALUES 
        (new.id, 'チュートリアル: このタスクを完了してスライムを攻撃しよう！', '完了チェックをクリックすると敵にダメージを与えられます。', 'adhoc', 'easy', 25, 10),
        (new.id, '朝のコップ1杯の水を飲む', '毎日の健康のためのルーティンタスクです。', 'routine', 'easy', 20, 10);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- auth.users に対するトリガーのバインド
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- デフォルトショップアイテムのシードデータ
-- ==============================================================================
INSERT INTO public.shop_items (name, description, item_type, attack_bonus, defense_bonus, hp_bonus, price, icon_name, required_level)
VALUES
    ('銅の剣', '冒険者が最初に手にする標準的な剣。攻撃力が5上昇。', 'weapon', 5, 0, 0, 50, 'Sword', 1),
    ('鉄の大剣', 'ずっしりとした重みのある頑丈な鉄剣。攻撃力が15上昇。', 'weapon', 15, 0, 0, 150, 'Sword', 3),
    ('炎の魔剣', '炎の魔力が宿る伝説の剣。攻撃力が30上昇。', 'weapon', 30, 0, 0, 450, 'Flame', 7),
    ('革の鎧', '軽くて動きやすい革製の鎧。防御力が5、最大HPが20上昇。', 'armor', 0, 5, 20, 60, 'Shield', 1),
    ('騎士の鉄甲冑', '鍛冶職人が丹精込めて鍛えた鎧。防御力が15、最大HPが60上昇。', 'armor', 0, 15, 60, 200, 'Shield', 4),
    ('疾風のタリスマン', '行動速度と気合を高めるお守り。攻撃力と防御力が共に8上昇。', 'accessory', 8, 8, 10, 250, 'Sparkles', 3),
    ('特製HPポーション', '瞬時に体力を50回復する秘薬。', 'potion', 0, 0, 50, 30, 'FlaskRound', 1)
ON CONFLICT DO NOTHING;
