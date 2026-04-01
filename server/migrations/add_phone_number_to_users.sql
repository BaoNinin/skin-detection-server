-- 添加手机号字段到 users 表
-- 执行时间: 2025-01-XX

-- 1. 添加 phone_number 字段（唯一索引）
ALTER TABLE users ADD COLUMN phone_number TEXT UNIQUE;

-- 2. 修改 openid 字段为非必需（允许为空）
ALTER TABLE users ALTER COLUMN openid DROP NOT NULL;

-- 3. 创建索引以优化查询
CREATE INDEX IF NOT EXISTS idx_users_phone_number ON users(phone_number);

-- 说明：
-- - phone_number: 存储用户手机号，用于手机号快速登录
-- - openid 改为可选字段，支持两种登录方式（openid登录和手机号登录）
-- - phone_number 设为唯一索引，确保一个手机号只能注册一个账号
