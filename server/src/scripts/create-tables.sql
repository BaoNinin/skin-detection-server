-- 创建 skin_history 表
CREATE TABLE IF NOT EXISTS skin_history (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  skin_type VARCHAR(50),
  concerns TEXT[], -- 数组类型，存储皮肤问题列表
  moisture INTEGER,
  oiliness INTEGER,
  sensitivity INTEGER,
  acne INTEGER DEFAULT 0,
  wrinkles INTEGER DEFAULT 0,
  spots INTEGER DEFAULT 0,
  pores INTEGER DEFAULT 0,
  blackheads INTEGER DEFAULT 0,
  recommendations TEXT[], -- 数组类型，存储建议列表
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建 health_check 表（用于健康检查）
CREATE TABLE IF NOT EXISTS health_check (
  id BIGSERIAL PRIMARY KEY,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_skin_history_user_id ON skin_history(user_id);
CREATE INDEX IF NOT EXISTS idx_skin_history_created_at ON skin_history(created_at DESC);

-- 插入一条健康检查记录
INSERT INTO health_check (updated_at) VALUES (NOW());
