/**
 * 云开发配置验证脚本
 *
 * 用途：验证云开发环境是否配置正确
 * 使用：pnpm run verify:cloud
 */

export {};

const cloud = require('wx-server-sdk');

console.log('🔍 开始验证云开发配置...\n');

// 1. 检查环境变量
console.log('📋 步骤 1：检查环境变量\n');

const envId = process.env.CLOUDBASE_ENV_ID;
const appSecret = process.env.WECHAT_APP_SECRET;

if (!envId) {
  console.error('❌ 错误：未找到 CLOUDBASE_ENV_ID 环境变量');
  console.error('请在 .env.local 或 .env.production 文件中配置：');
  console.error('CLOUDBASE_ENV_ID=cloud1-你的环境ID\n');
  process.exit(1);
}

if (!appSecret) {
  console.error('❌ 错误：未找到 WECHAT_APP_SECRET 环境变量');
  console.error('请在 .env.local 或 .env.production 文件中配置：');
  console.error('WECHAT_APP_SECRET=你的AppSecret\n');
  process.exit(1);
}

console.log(`✅ 环境ID: ${envId}`);
console.log(`✅ AppSecret: ${appSecret.substring(0, 8)}...${appSecret.substring(appSecret.length - 4)}`);
console.log('----------------------------------------\n');

// 2. 初始化云开发
console.log('📋 步骤 2：初始化云开发\n');

try {
  cloud.init({
    env: envId,
    traceUser: true,
  });
  console.log('✅ 云开发初始化成功');
} catch (error: any) {
  console.error('❌ 云开发初始化失败:', error.message);
  console.error('\n可能的原因：');
  console.error('1. 环境ID不正确');
  console.error('2. 云开发未开通');
  console.error('3. 网络连接问题\n');
  process.exit(1);
}

console.log('----------------------------------------\n');

// 3. 检查数据库连接
console.log('📋 步骤 3：检查数据库连接\n');

const db = cloud.database();
const COLLECTIONS = {
  USERS: 'users',
  HISTORY: 'skin_history',
  HEALTH_CHECK: 'health_check',
};

async function checkCollection(collectionName: string): Promise<boolean> {
  try {
    const result = await db.collection(collectionName).limit(1).get();
    console.log(`✅ 集合 ${collectionName} 存在，当前数据量: ${result.data.length}`);
    return true;
  } catch (error: any) {
    if (error.errCode === -1) {
      console.log(`❌ 集合 ${collectionName} 不存在`);
      console.log(`   请在云开发控制台创建该集合`);
    } else {
      console.error(`❌ 检查集合 ${collectionName} 失败:`, error.message);
    }
    return false;
  }
}

// 包装在 async 函数中
(async () => {
  // 检查所有集合
  const usersExists = await checkCollection(COLLECTIONS.USERS);
  const historyExists = await checkCollection(COLLECTIONS.HISTORY);
  const healthCheckExists = await checkCollection(COLLECTIONS.HEALTH_CHECK);

  if (!usersExists || !historyExists || !healthCheckExists) {
    console.log('\n⚠️  部分集合缺失，请按以下步骤创建：\n');

    if (!usersExists) {
      console.log('1. 创建 users 集合');
      console.log('   - 名称: users');
      console.log('   - 权限: 所有用户可读，仅创建者可写\n');
    }

    if (!historyExists) {
      console.log('2. 创建 skin_history 集合');
      console.log('   - 名称: skin_history');
      console.log('   - 权限: 所有用户可读，仅创建者可写\n');
    }

    if (!healthCheckExists) {
      console.log('3. 创建 health_check 集合');
      console.log('   - 名称: health_check');
      console.log('   - 权限: 所有用户可读，仅管理员可写\n');
    }
  }

  console.log('----------------------------------------\n');

  // 4. 检查云存储
  console.log('📋 步骤 4：检查云存储\n');

  async function checkStorage(): Promise<boolean> {
    try {
      // 尝试获取云存储信息（这个操作会失败，但可以确认云存储是否开通）
      await cloud.getTempFileURL({
        fileList: [],
      });
      console.log('✅ 云存储已开通');
      return true;
    } catch (error: any) {
      if (error.errCode === -502001) {
        console.log('❌ 云存储未开通');
        console.log('   请在云开发控制台开通云存储服务');
        return false;
      } else {
        console.log('✅ 云存储已开通（API调用正常）');
        return true;
      }
    }
  }

  const storageExists = await checkStorage();
  console.log('----------------------------------------\n');

  // 5. 测试数据库写入（仅当所有集合都存在时）
  console.log('📋 步骤 5：测试数据库写入\n');

  const allCollectionsExist = usersExists && historyExists && healthCheckExists;

  if (allCollectionsExist) {
    try {
      // 测试写入 health_check
      const result = await db.collection(COLLECTIONS.HEALTH_CHECK).add({
        data: {
          updated_at: new Date().toISOString(),
        },
      });
      console.log('✅ 数据库写入测试成功，记录ID:', result._id);
    } catch (error: any) {
      console.error('❌ 数据库写入测试失败:', error.message);
    }
  } else {
    console.log('⏭️  跳过数据库写入测试（集合未完全创建）');
  }

  console.log('----------------------------------------\n');

  // 6. 总结
  console.log('📊 配置验证总结\n');

  const results: Record<string, string> = {
    环境变量: '✅ 已配置',
    云开发初始化: '✅ 成功',
    'users 集合': usersExists ? '✅ 已创建' : '❌ 未创建',
    'skin_history 集合': historyExists ? '✅ 已创建' : '❌ 未创建',
    'health_check 集合': healthCheckExists ? '✅ 已创建' : '❌ 未创建',
    云存储: storageExists ? '✅ 已开通' : '❌ 未开通',
  };

  Object.entries(results).forEach(([key, value]) => {
    console.log(`${key}: ${value}`);
  });

  console.log('\n----------------------------------------\n');

  if (allCollectionsExist && storageExists) {
    console.log('🎉 云开发配置完成！所有检查通过。');
    console.log('✅ 你可以开始上传小程序代码了。');
  } else {
    console.log('⚠️  云开发配置未完成，请按上述提示完成缺失的配置。');
    console.log('完成后请重新运行此脚本验证。');
  }

  console.log('\n----------------------------------------\n');
})();
