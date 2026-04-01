/**
 * 数据库初始化脚本
 *
 * 用途：创建必要的数据库表
 * 使用：pnpm run init:db
 */

import { getSupabaseClient } from '../storage/database/supabase-client';
import * as fs from 'fs';
import * as path from 'path';

async function initDatabase() {
  console.log('🔍 开始初始化数据库...\n');

  const client = getSupabaseClient();

  try {
    // 读取 SQL 文件
    const sqlPath = path.join(__dirname, 'init-database.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf-8');

    // 分割 SQL 语句（按分号分割）
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📝 发现 ${statements.length} 条 SQL 语句\n`);

    // 执行每条 SQL 语句
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`执行语句 ${i + 1}/${statements.length}:`);

      // Supabase 的 JS 客户端不支持直接执行 DDL 语句
      // 我们需要使用 rpc（远程过程调用）来执行 SQL
      // 但更简单的方法是在 Supabase 控制台直接执行 SQL

      console.log(statement.substring(0, 100) + '...\n');
    }

    console.log('✅ SQL 语句已准备完毕\n');
    console.log('⚠️  注意：Supabase JS 客户端不支持直接执行 DDL 语句');
    console.log('请在 Supabase 控制台的 SQL Editor 中执行以下步骤：\n');

    console.log('1. 打开 Supabase 控制台');
    console.log('2. 进入 SQL Editor');
    console.log('3. 复制并执行以下 SQL 文件的内容：');
    console.log(`   ${sqlPath}\n`);

    // 验证表是否存在
    console.log('📋 验证表是否存在...\n');

    const tables = ['users', 'skin_history', 'health_check'];
    for (const tableName of tables) {
      try {
        // 尝试查询表
        const { data, error } = await client
          .from(tableName)
          .select('*')
          .limit(1);

        if (error) {
          console.log(`❌ 表 ${tableName} 不存在或无法访问`);
        } else {
          console.log(`✅ 表 ${tableName} 存在`);
        }
      } catch (err: any) {
        console.log(`❌ 表 ${tableName} 不存在: ${err.message}`);
      }
    }

    console.log('\n----------------------------------------\n');
    console.log('📊 初始化状态总结\n');

    console.log('如果某些表不存在，请按照上述步骤在 Supabase 控制台创建它们。');

  } catch (error: any) {
    console.error('❌ 初始化失败:', error.message);
    console.error('\n可能的原因：');
    console.error('1. Supabase 凭证配置错误');
    console.error('2. 网络连接问题');
    console.error('3. Supabase 项目未启动');
    process.exit(1);
  }
}

initDatabase();
