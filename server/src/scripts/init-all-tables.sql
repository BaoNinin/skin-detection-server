-- =====================================================
-- 皮肤检测小程序 - 完整数据库初始化脚本
-- =====================================================
-- 执行顺序：
-- 1. users 表
-- 2. skin_history 表
-- 3. health_check 表
-- 4. 索引
-- =====================================================

-- 1. 创建 users 表
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  openid VARCHAR(255) UNIQUE,
  phone_number VARCHAR(20) UNIQUE,
  nickname VARCHAR(100),
  avatar_url TEXT,
  detection_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 创建 skin_history 表
CREATE TABLE IF NOT EXISTS skin_history (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  skin_type VARCHAR(50),
  concerns TEXT[], -- 数组类型，存储皮肤问题列表
  moisture INTEGER CHECK (moisture >= 0 AND moisture <= 100),
  oiliness INTEGER CHECK (oiliness >= 0 AND oiliness <= 100),
  sensitivity INTEGER CHECK (sensitivity >= 0 AND sensitivity <= 100),
  acne INTEGER DEFAULT 0 CHECK (acne >= 0 AND acne <= 100),
  wrinkles INTEGER DEFAULT 0 CHECK (wrinkles >= 0 AND wrinkles <= 100),
  spots INTEGER DEFAULT 0 CHECK (spots >= 0 AND spots <= 100),
  pores INTEGER DEFAULT 0 CHECK (pores >= 0 AND pores <= 100),
  blackheads INTEGER DEFAULT 0 CHECK (blackheads >= 0 AND blackheads <= 100),
  recommendations TEXT[], -- 数组类型，存储建议列表
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 创建 health_check 表（用于健康检查）
CREATE TABLE IF NOT EXISTS health_check (
  id BIGSERIAL PRIMARY KEY,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_users_openid ON users(openid);
CREATE INDEX IF NOT EXISTS idx_users_phone_number ON users(phone_number);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_skin_history_user_id ON skin_history(user_id);
CREATE INDEX IF NOT EXISTS idx_skin_history_created_at ON skin_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_skin_history_skin_type ON skin_history(skin_type);

-- 5. 插入一条健康检查记录
INSERT INTO health_check (updated_at) VALUES (NOW())
ON CONFLICT DO NOTHING;

-- =====================================================
-- 验证表是否创建成功
-- =====================================================

-- 查看 users 表
SELECT 'users' as table_name, COUNT(*) as record_count FROM users
UNION ALL
SELECT 'skin_history' as table_name, COUNT(*) as record_count FROM skin_history
UNION ALL
SELECT 'health_check' as table_name, COUNT(*) as record_count FROM health_check;

-- =====================================================
-- 完成！
-- =====================================================
