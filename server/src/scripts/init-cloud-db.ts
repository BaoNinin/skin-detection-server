/**
 * 云开发数据库初始化脚本
 *
 * 用途：初始化云数据库集合，添加测试数据
 * 使用：pnpm run init:cloud-db
 */

const cloud = require('wx-server-sdk');

// 初始化云开发
cloud.init({
  env: process.env.CLOUDBASE_ENV_ID || 'cloud1-6gzezzskad9fed0b',
  traceUser: true,
});

const db = cloud.database();

// 集合名称
const COLLECTIONS = {
  USERS: 'users',
  HISTORY: 'skin_history',
  HEALTH_CHECK: 'health_check',
};

/**
 * 创建测试用户
 */
async function createTestUser() {
  try {
    const result = await db.collection(COLLECTIONS.USERS).add({
      data: {
        openid: 'test_openid_001',
        phone_number: null,
        nickname: '测试用户',
        avatar_url: null,
        detection_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    });
    console.log('✅ 测试用户创建成功:', result._id);
    return result._id;
  } catch (error) {
    console.error('❌ 创建测试用户失败:', error.message);
    return null;
  }
}

/**
 * 创建测试历史记录
 */
async function createTestHistory(userId: string) {
  try {
    const result = await db.collection(COLLECTIONS.HISTORY).add({
      data: {
        user_id: userId,
        skin_type: '混合性皮肤',
        concerns: ['T区偏油', '脸颊偏干', '毛孔粗大'],
        moisture: 45,
        oiliness: 60,
        sensitivity: 30,
        acne: 20,
        wrinkles: 10,
        spots: 15,
        pores: 35,
        blackheads: 25,
        recommendations: [
          {
            product: '控油洁面乳',
            reason: 'T区油性分泌较多',
          },
          {
            product: '保湿精华',
            reason: '脸颊偏干需要补充水分',
          },
          {
            product: '收缩毛孔爽肤水',
            reason: '毛孔较为粗大',
          },
        ],
        image_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    });
    console.log('✅ 测试历史记录创建成功:', result._id);
    return result._id;
  } catch (error) {
    console.error('❌ 创建测试历史记录失败:', error.message);
    return null;
  }
}

/**
 * 创建健康检查记录
 */
async function createHealthCheck() {
  try {
    const result = await db.collection(COLLECTIONS.HEALTH_CHECK).add({
      data: {
        updated_at: new Date().toISOString(),
      },
    });
    console.log('✅ 健康检查记录创建成功:', result._id);
    return result._id;
  } catch (error) {
    console.error('❌ 创建健康检查记录失败:', error.message);
    return null;
  }
}

/**
 * 检查集合是否存在
 */
async function checkCollectionExists(collectionName: string) {
  try {
    const result = await db.collection(collectionName).limit(1).get();
    console.log(`✅ 集合 ${collectionName} 存在，当前数据量:`, result.data.length);
    return true;
  } catch (error) {
    if (error.errCode === -1) {
      console.log(`❌ 集合 ${collectionName} 不存在`);
    } else {
      console.error(`❌ 检查集合 ${collectionName} 失败:`, error.message);
    }
    return false;
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始初始化云开发数据库...\n');
  console.log('环境ID:', process.env.CLOUDBASE_ENV_ID || 'cloud1-6gzezzskad9fed0b');
  console.log('----------------------------------------\n');

  // 1. 检查集合是否存在
  console.log('📋 步骤 1：检查集合是否存在');
  const usersExists = await checkCollectionExists(COLLECTIONS.USERS);
  const historyExists = await checkCollectionExists(COLLECTIONS.HISTORY);
  const healthCheckExists = await checkCollectionExists(COLLECTIONS.HEALTH_CHECK);
  console.log('----------------------------------------\n');

  // 2. 提示手动创建不存在的集合
  if (!usersExists || !historyExists || !healthCheckExists) {
    console.log('⚠️  检测到部分集合不存在，请按以下步骤手动创建：\n');

    if (!usersExists) {
      console.log('1️⃣  创建 users 集合');
      console.log('   - 集合名称：users');
      console.log('   - 权限：所有用户可读，仅创建者可写');
      console.log('');
    }

    if (!historyExists) {
      console.log('2️⃣  创建 skin_history 集合');
      console.log('   - 集合名称：skin_history');
      console.log('   - 权限：所有用户可读，仅创建者可写');
      console.log('');
    }

    if (!healthCheckExists) {
      console.log('3️⃣  创建 health_check 集合');
      console.log('   - 集合名称：health_check');
      console.log('   - 权限：所有用户可读，仅管理员可写');
      console.log('');
    }

    console.log('创建完成后，重新运行此脚本。\n');
    console.log('----------------------------------------\n');
    process.exit(0);
  }

  // 3. 添加测试数据
  console.log('📝 步骤 2：添加测试数据');

  const testUser = await createTestUser();

  if (testUser) {
    await createTestHistory(testUser);
  }

  await createHealthCheck();

  console.log('----------------------------------------\n');

  // 4. 验证数据
  console.log('✅ 步骤 3：验证数据');

  try {
    const usersResult = await db.collection(COLLECTIONS.USERS).count();
    console.log(`📊 users 集合数据量: ${usersResult.total}`);

    const historyResult = await db.collection(COLLECTIONS.HISTORY).count();
    console.log(`📊 skin_history 集合数据量: ${historyResult.total}`);

    const healthResult = await db.collection(COLLECTIONS.HEALTH_CHECK).count();
    console.log(`📊 health_check 集合数据量: ${healthResult.total}`);
  } catch (error) {
    console.error('❌ 验证数据失败:', error.message);
  }

  console.log('----------------------------------------\n');
  console.log('🎉 数据库初始化完成！');
}

// 运行主函数
main().catch((error) => {
  console.error('❌ 初始化失败:', error);
  process.exit(1);
});
