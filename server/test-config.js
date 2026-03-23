// 测试豆包视觉模型配置
require('dotenv').config({ path: '.env.local' });

console.log('=== 豆包视觉模型配置检查 ===\n');

console.log('1. API Key:');
console.log(`   ${process.env.COZE_API_KEY}\n`);

console.log('2. 模型名称:');
console.log(`   ${process.env.COZE_MODEL}\n`);

console.log('3. API 地址:');
console.log(`   ${process.env.COZE_API_BASE}\n`);

console.log('4. 使用模拟数据:');
console.log(`   ${process.env.COZE_USE_MOCK}\n`);

console.log('=== 预期的正确配置 ===');
console.log('API Key: 8f38a8d0-b6d4-481c-8e15-b93bb30c7444');
console.log('模型名称: doubao-1-5-vision-pro-32k-250115');
console.log('API 地址: https://ark.cn-beijing.volces.com/api/v3/chat/completions');
console.log('使用模拟数据: false\n');

console.log('=== 配置检查结果 ===');
if (process.env.COZE_API_KEY === '8f38a8d0-b6d4-481c-8e15-b93bb30c7444') {
  console.log('✅ API Key 正确');
} else {
  console.log('❌ API Key 不正确');
}

if (process.env.COZE_MODEL === 'doubao-1-5-vision-pro-32k-250115') {
  console.log('✅ 模型名称正确');
} else {
  console.log('❌ 模型名称不正确');
}

if (process.env.COZE_API_BASE === 'https://ark.cn-beijing.volces.com/api/v3/chat/completions') {
  console.log('✅ API 地址正确');
} else {
  console.log('❌ API 地址不正确');
}

if (process.env.COZE_USE_MOCK === 'false') {
  console.log('✅ 使用真实 API（非模拟数据）');
} else {
  console.log('❌ 使用模拟数据');
}
