-- Migration: Create Admin Panel Tables
-- Adds behavior_data, skill_scores, ai_analysis, security_logs tables
-- Also updates simulation_runs with new fields

-- Update simulation_runs table
ALTER TABLE simulation_runs 
ADD COLUMN IF NOT EXISTS completion_time INT,
ADD COLUMN IF NOT EXISTS decision_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS error_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS success_rate FLOAT;

-- Create behavior_data table
CREATE TABLE IF NOT EXISTS behavior_data (
    id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    simulation_run_id TEXT,
    decision_latency INT,
    retry_rate FLOAT,
    error_pattern TEXT,
    stress_indicator FLOAT,
    deviation_score FLOAT,
    time_pressure_response FLOAT,
    sequence_deviation FLOAT,
    metadata TEXT,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT behavior_data_pkey PRIMARY KEY (id),
    CONSTRAINT behavior_data_user_id_fkey FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS behavior_data_user_id_idx ON behavior_data(user_id);
CREATE INDEX IF NOT EXISTS behavior_data_created_at_idx ON behavior_data(created_at);

-- Create skill_scores table
CREATE TABLE IF NOT EXISTS skill_scores (
    id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    skill_name TEXT NOT NULL,
    score FLOAT NOT NULL,
    confidence TEXT NOT NULL DEFAULT 'medium',
    stability TEXT NOT NULL DEFAULT 'stable',
    trend FLOAT,
    last_updated TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL,
    
    CONSTRAINT skill_scores_pkey PRIMARY KEY (id),
    CONSTRAINT skill_scores_user_id_fkey FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT skill_scores_user_skill_unique UNIQUE (user_id, skill_name)
);

CREATE INDEX IF NOT EXISTS skill_scores_user_id_idx ON skill_scores(user_id);
CREATE INDEX IF NOT EXISTS skill_scores_skill_name_idx ON skill_scores(skill_name);

-- Create ai_analysis table
CREATE TABLE IF NOT EXISTS ai_analysis (
    id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    insight_text TEXT NOT NULL,
    recommendation TEXT,
    risk_level TEXT NOT NULL DEFAULT 'low',
    category TEXT,
    metadata TEXT,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT ai_analysis_pkey PRIMARY KEY (id),
    CONSTRAINT ai_analysis_user_id_fkey FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS ai_analysis_user_id_idx ON ai_analysis(user_id);
CREATE INDEX IF NOT EXISTS ai_analysis_risk_level_idx ON ai_analysis(risk_level);
CREATE INDEX IF NOT EXISTS ai_analysis_created_at_idx ON ai_analysis(created_at);

-- Create security_logs table
CREATE TABLE IF NOT EXISTS security_logs (
    id TEXT NOT NULL,
    admin_id TEXT,
    user_id TEXT,
    action TEXT NOT NULL,
    resource TEXT,
    resource_id TEXT,
    ip_address TEXT,
    user_agent TEXT,
    success BOOLEAN NOT NULL DEFAULT true,
    details TEXT,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT security_logs_pkey PRIMARY KEY (id),
    CONSTRAINT security_logs_admin_id_fkey FOREIGN KEY (admin_id) 
        REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS security_logs_admin_id_idx ON security_logs(admin_id);
CREATE INDEX IF NOT EXISTS security_logs_user_id_idx ON security_logs(user_id);
CREATE INDEX IF NOT EXISTS security_logs_action_idx ON security_logs(action);
CREATE INDEX IF NOT EXISTS security_logs_created_at_idx ON security_logs(created_at);
