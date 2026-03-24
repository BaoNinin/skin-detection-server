// 测试配置文件 - 用于验证豆包视觉模型配置是否正确
require('dotenv').config({ path: '.env.local' });

console.log('\n=== 豆包视觉模型配置检查 ===\n');

// 1. 检查 API Key
const apiKey = process.env.COZE_API_KEY;
console.log('1. API Key:');
console.log(`   ${apiKey || '未配置'}`);

// 2. 检查模型名称
const model = process.env.COZE_MODEL;
console.log('\n2. 模型名称:');
console.log(`   ${model || '未配置'}`);

// 3. 检查 API 地址
const apiBase = process.env.COZE_API_BASE;
console.log('\n3. API 地址:');
console.log(`   ${apiBase || '未配置'}`);

// 4. 检查是否使用模拟数据
const useMock = process.env.COZE_USE_MOCK;
console.log('\n4. 使用模拟数据:');
console.log(`   ${useMock === 'true' ? '是' : '否'}`);

console.log('\n=== 预期的正确配置 ===');
console.log('API Key: 8f60880a-1ac3-40a7-bd60-1b68dbc549e6');
console.log('模型名称: ep-20260324135258-7shrd');
console.log('API 地址: https://ark.cn-beijing.volces.com/api/v3/chat/completions');
console.log('使用真实 API（非模拟数据）');

console.log('\n=== 配置检查结果 ===');

// 验证各项配置
let allPassed = true;

// 检查 API Key
if (apiKey === '8f60880a-1ac3-40a7-bd60-1b68dbc549e6') {
  console.log('✅ API Key 正确');
} else {
  console.log('❌ API Key 不正确');
  allPassed = false;
}

// 检查模型名称
if (model === 'ep-20260324135258-7shrd') {
  console.log('✅ 模型名称正确');
} else {
  console.log('❌ 模型名称不正确');
  allPassed = false;
}

// 检查 API 地址
if (apiBase === 'https://ark.cn-beijing.volces.com/api/v3/chat/completions') {
  console.log('✅ API 地址正确');
} else {
  console.log('❌ API 地址不正确');
  allPassed = false;
}

// 检查模拟数据模式
if (useMock === 'false') {
  console.log('✅ 使用真实 API（非模拟数据）');
} else {
  console.log('❌ 当前使用模拟数据模式');
  allPassed = false;
}

console.log('\n');
if (allPassed) {
  console.log('🎉 所有配置检查通过！');
  console.log('您的豆包视觉模型配置完全正确。');
} else {
  console.log('⚠️  存在配置问题，请检查 .env.local 文件');
}

console.log('\n');
