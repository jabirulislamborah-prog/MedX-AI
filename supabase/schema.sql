-- =====================================================
-- MedDrill Database Schema
-- Run this in Supabase SQL Editor
-- =====================================================

-- Enable pgvector for embeddings
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PROFILES
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  bio TEXT,
  medical_school TEXT,
  exam_target TEXT DEFAULT 'USMLE Step 1',
  avatar_url TEXT,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  streak_days INTEGER DEFAULT 0,
  last_active_date DATE,
  plan TEXT DEFAULT 'free', -- free | pro | annual
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Public profiles viewable for leaderboard" ON profiles FOR SELECT USING (true);

-- =====================================================
-- DOCUMENTS
-- =====================================================
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subject TEXT,
  file_path TEXT,
  file_size BIGINT,
  total_chunks INTEGER DEFAULT 0,
  status TEXT DEFAULT 'processing', -- processing | ready | error
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own their documents" ON documents FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- DOCUMENT CHUNKS (for RAG / embeddings)
-- =====================================================
CREATE TABLE IF NOT EXISTS document_chunks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  chunk_index INTEGER,
  embedding vector(768),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own their chunks" ON document_chunks FOR ALL USING (auth.uid() = user_id);

CREATE INDEX ON document_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- RAG semantic search function
CREATE OR REPLACE FUNCTION match_chunks(
  query_embedding vector(768),
  match_threshold FLOAT,
  match_count INT,
  filter_user_id UUID
)
RETURNS TABLE (id UUID, content TEXT, metadata JSONB, similarity FLOAT)
LANGUAGE SQL STABLE AS $$
  SELECT
    dc.id,
    dc.content,
    dc.metadata,
    1 - (dc.embedding <=> query_embedding) AS similarity
  FROM document_chunks dc
  WHERE dc.user_id = filter_user_id
    AND 1 - (dc.embedding <=> query_embedding) > match_threshold
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- =====================================================
-- LESSONS
-- =====================================================
CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT,
  lesson_order INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  total_questions INTEGER DEFAULT 0,
  xp_reward INTEGER DEFAULT 20,
  best_score INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own their lessons" ON lessons FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- LESSON QUESTIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS lesson_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  question_type TEXT NOT NULL, -- mcq | true_false | cloze
  question_text TEXT NOT NULL,
  options JSONB,
  correct_answer TEXT,
  explanation TEXT,
  difficulty INTEGER DEFAULT 1, -- 1=easy, 2=medium, 3=hard
  question_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE lesson_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lesson questions viewable by lesson owner" ON lesson_questions FOR SELECT USING (
  EXISTS (SELECT 1 FROM lessons WHERE lessons.id = lesson_id AND lessons.user_id = auth.uid())
);

-- =====================================================
-- LESSON PROGRESS
-- =====================================================
CREATE TABLE IF NOT EXISTS lesson_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  question_id UUID REFERENCES lesson_questions(id),
  is_correct BOOLEAN,
  selected_answer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own their progress" ON lesson_progress FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- FLASHCARDS
-- =====================================================
CREATE TABLE IF NOT EXISTS flashcards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  front_text TEXT NOT NULL,
  back_text TEXT NOT NULL,
  card_type TEXT DEFAULT 'basic',
  ease_factor FLOAT DEFAULT 2.5,
  interval_days FLOAT DEFAULT 0,
  repetitions INTEGER DEFAULT 0,
  next_review_at TIMESTAMPTZ DEFAULT NOW(),
  last_reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own their flashcards" ON flashcards FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- FLASHCARD REVIEWS
-- =====================================================
CREATE TABLE IF NOT EXISTS flashcard_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  flashcard_id UUID NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 4),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE flashcard_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own their reviews" ON flashcard_reviews FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- QBANK QUESTIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS qbank_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  subject TEXT,
  system TEXT,
  question_stem TEXT NOT NULL,
  lead_in TEXT,
  options JSONB NOT NULL,
  correct_option_id TEXT NOT NULL,
  explanation_brief TEXT,
  explanation_detailed TEXT,
  difficulty TEXT DEFAULT 'medium',
  high_yield BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE qbank_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own their qbank" ON qbank_questions FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- QBANK ATTEMPTS
-- =====================================================
CREATE TABLE IF NOT EXISTS qbank_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES qbank_questions(id) ON DELETE CASCADE,
  selected_option_id TEXT,
  is_correct BOOLEAN,
  time_taken_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE qbank_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own their attempts" ON qbank_attempts FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- CHAT CONVERSATIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  context_document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own their conversations" ON chat_conversations FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- CHAT MESSAGES
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user','assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own their messages" ON chat_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM chat_conversations WHERE chat_conversations.id = conversation_id AND chat_conversations.user_id = auth.uid())
);
CREATE POLICY "Users insert own messages" ON chat_messages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM chat_conversations WHERE chat_conversations.id = conversation_id AND chat_conversations.user_id = auth.uid())
);

-- =====================================================
-- BATTLES
-- =====================================================
CREATE TABLE IF NOT EXISTS battles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invite_code TEXT UNIQUE NOT NULL,
  creator_id UUID NOT NULL REFERENCES auth.users(id),
  opponent_id UUID REFERENCES auth.users(id),
  mode TEXT DEFAULT 'quick', -- quick (10q) | standard (30q)
  status TEXT DEFAULT 'waiting', -- waiting | active | completed
  winner_id UUID REFERENCES auth.users(id),
  creator_score INTEGER DEFAULT 0,
  opponent_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE battles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Battle participants can view" ON battles FOR SELECT USING (auth.uid() = creator_id OR auth.uid() = opponent_id);

-- =====================================================
-- DAILY STREAKS
-- =====================================================
CREATE TABLE IF NOT EXISTS daily_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
  xp_earned INTEGER DEFAULT 0,
  questions_answered INTEGER DEFAULT 0,
  UNIQUE(user_id, activity_date)
);

ALTER TABLE daily_activity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own their activity" ON daily_activity FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- STORAGE BUCKET
-- =====================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false) ON CONFLICT DO NOTHING;
CREATE POLICY "Users upload own docs" ON storage.objects FOR INSERT WITH CHECK (bucket_id='documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users view own docs" ON storage.objects FOR SELECT USING (bucket_id='documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- =====================================================
-- UTILITY FUNCTIONS
-- =====================================================

-- Increment XP and auto-level
CREATE OR REPLACE FUNCTION increment_xp(uid UUID, amount INTEGER)
RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE
  new_xp INTEGER;
  new_level INTEGER;
BEGIN
  UPDATE profiles SET xp = xp + amount WHERE id = uid RETURNING xp INTO new_xp;
  new_level := FLOOR(new_xp / 1000) + 1;
  UPDATE profiles SET level = new_level WHERE id = uid;
  -- Update daily activity
  INSERT INTO daily_activity (user_id, xp_earned) VALUES (uid, amount)
  ON CONFLICT (user_id, activity_date) DO UPDATE SET xp_earned = daily_activity.xp_earned + amount;
  -- Update streak
  UPDATE profiles SET
    streak_days = CASE
      WHEN last_active_date = CURRENT_DATE - 1 THEN streak_days + 1
      WHEN last_active_date = CURRENT_DATE THEN streak_days
      ELSE 1
    END,
    last_active_date = CURRENT_DATE
  WHERE id = uid;
END;
$$;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, full_name) VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name') ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();
