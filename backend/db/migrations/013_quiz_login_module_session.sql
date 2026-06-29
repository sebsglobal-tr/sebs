-- QuizAttempt, UserLoginLog, UserModuleSession tabloları
-- Kullanıcı test sonuçları, günlük giriş ve modül süresi takibi

-- quiz_attempts: Test/Değerlendirme sonuçları
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  module_id UUID REFERENCES modules(id) ON DELETE SET NULL,
  quiz_section_id TEXT NOT NULL,
  total_questions INT NOT NULL,
  correct_count INT NOT NULL,
  wrong_count INT NOT NULL,
  score_percent INT,
  attempted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_module ON quiz_attempts(module_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_attempted ON quiz_attempts(attempted_at);

-- user_login_logs: Günlük giriş takibi
CREATE TABLE IF NOT EXISTS user_login_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  logged_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_login_logs_user ON user_login_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_login_logs_logged ON user_login_logs(logged_at);

-- user_module_sessions: Günlük modül süresi
CREATE TABLE IF NOT EXISTS user_module_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  module_id UUID REFERENCES modules(id) ON DELETE SET NULL,
  session_date DATE NOT NULL,
  minutes_spent INT DEFAULT 0,
  last_updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, module_id, session_date)
);

CREATE INDEX IF NOT EXISTS idx_user_module_sessions_user ON user_module_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_module_sessions_date ON user_module_sessions(session_date);
