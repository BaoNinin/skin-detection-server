const cloud = require('wx-server-sdk');

// 初始化云开发环境
cloud.init({
  env: process.env.CLOUDBASE_ENV_ID || '',
  traceUser: true,
});

// 获取数据库引用
export const db = cloud.database();

// 获取云存储引用
export const storage = cloud.uploadFile;

// 数据库集合名称
export const COLLECTIONS = {
  HISTORY: 'skin_history', // 皮肤检测历史记录
  USERS: 'users', // 用户信息
} as const;
