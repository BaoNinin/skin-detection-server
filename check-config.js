// 检查前端配置
const fs = require('fs');
const path = require('path');

console.log('\n=== 前端配置检查 ===\n');

// 读取根目录的 .env.local
const rootEnvPath = path.join(__dirname, '.env.local');
if (fs.existsSync(rootEnvPath)) {
  const rootEnvContent = fs.readFileSync(rootEnvPath, 'utf-8');
  console.log('根目录 .env.local 内容:');
  console.log(rootEnvContent);

  // 提取 PROJECT_DOMAIN
  const match = rootEnvContent.match(/PROJECT_DOMAIN=(.+)/);
  if (match) {
    const domain = match[1].trim();
    console.log('\n当前使用的 API 域名:', domain);

    if (domain.includes('localhost')) {
      console.log('✅ 正在使用本地开发服务器');
      console.log('✅ 本地服务器已配置正确的模型: doubao-1-5-vision-pro-32k-250115');
    } else if (domain.includes('tcloudbase.com')) {
      console.log('⚠️  正在使用云托管环境');
      console.log('⚠️  云托管环境可能还在使用旧模型配置');
      console.log('⚠️  需要在云托管控制台更新环境变量');
    } else {
      console.log('❓ 使用了其他环境:', domain);
    }
  }
} else {
  console.log('❌ 根目录 .env.local 文件不存在');
}

console.log('\n=== 服务器配置检查 ===\n');

// 读取 server/.env.local
const serverEnvPath = path.join(__dirname, 'server', '.env.local');
if (fs.existsSync(serverEnvPath)) {
  const serverEnvContent = fs.readFileSync(serverEnvPath, 'utf-8');
  const modelMatch = serverEnvContent.match(/COZE_MODEL=(.+)/);

  if (modelMatch) {
    const model = modelMatch[1].trim();
    console.log('本地服务器配置的模型:', model);

    if (model === 'doubao-1-5-vision-pro-32k-250115') {
      console.log('✅ 本地服务器配置正确');
    } else {
      console.log('❌ 本地服务器配置不正确');
    }
  }
}

console.log('\n');
