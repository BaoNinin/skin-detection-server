// 批量更新配置脚本 - 替换所有文档中的旧配置为新配置
const fs = require('fs');
const path = require('path');

const CONFIG_MAP = {
  'ea77474e-46bb-4f4e-a42f-99dedce29678': '8f60880a-1ac3-40a7-bd60-1b68dbc549e6', // API Key
  'doubao-seed-1-6-vision-250815': 'ep-20260324135258-7shrd', // 模型名称
  'https://ark.cn-beijing.volces.com/api/v3/responses': 'https://ark.cn-beijing.volces.com/api/v3/chat/completions' // API 地址
};

const DOCS_TO_UPDATE = [
  'QUICK_REFERENCE.md',
  'CLOUD_HOSTING_QUICK_START.md',
  'SIMPLE_DEPLOY_GUIDE.md',
  'UPDATED_CLI_COMMANDS_GUIDE.md',
  'GIT_DEPLOYMENT_GUIDE.md',
  'WECHAT_CLOUD_HOSTING_DETAILED_GUIDE.md',
  'DEPLOYMENT_FIX_SUMMARY.md',
  'GITHUB_DEPLOYMENT_CHECKLIST.md',
  'CLOUD_HOSTING_CLI_GUIDE.md',
  'DEPLOYMENT_GUIDE.md',
  'WECHAT_CLOUD_HOSTING_DEPLOYMENT_GUIDE.md',
  'UPDATED_CLOUD_HOSTING_GUIDE.md',
  'DETAILED_CONFIG_GUIDE.md',
  'PROJECT_BINDING_INFO.md',
  'CLOUD_BASE_DEPLOYMENT_GUIDE.md',
  'AI_FEATURE_COMPARISON.md',
  'CONFIG_SUMMARY.md'
];

const SERVER_DOCS_TO_UPDATE = [
  'server/CLOUD_HOSTING_ENV_SETUP.md',
  'server/deploy-cloud-hosting.sh',
  'server/CLOUD_HOSTING_DEPLOYMENT_GUIDE.md',
  'server/CLOUD_HOSTING_ENV_CONFIG.txt',
  'server/DEPLOYMENT_QUICK_REFERENCE.md'
];

function updateFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  文件不存在: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // 替换所有配置
    for (const [oldValue, newValue] of Object.entries(CONFIG_MAP)) {
      if (content.includes(oldValue)) {
        content = content.replace(new RegExp(oldValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newValue);
        modified = true;
        console.log(`✅ 已更新 ${filePath} 中的 ${oldValue.substring(0, 30)}...`);
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`📝 已保存: ${filePath}\n`);
    } else {
      console.log(`ℹ️  无需更新: ${filePath}\n`);
    }
  } catch (error) {
    console.error(`❌ 更新文件失败 ${filePath}:`, error.message);
  }
}

console.log('=== 开始批量更新配置 ===\n');
console.log('替换内容:');
console.log('1. API Key: ea77474e-... → 8f60880a-...');
console.log('2. 模型名称: doubao-seed-1-6-vision-250815 → ep-20260324135258-7shrd');
console.log('3. API 地址: /api/v3/responses → /api/v3/chat/completions');
console.log('\n');

// 更新根目录文档
console.log('--- 更新根目录文档 ---\n');
DOCS_TO_UPDATE.forEach(doc => {
  const filePath = path.join(__dirname, '..', doc);
  updateFile(filePath);
});

// 更新 server 目录文档
console.log('--- 更新 server 目录文档 ---\n');
SERVER_DOCS_TO_UPDATE.forEach(doc => {
  const filePath = path.join(__dirname, '..', doc);
  updateFile(filePath);
});

console.log('=== 批量更新完成 ===\n');
console.log('提示：请检查 Git 状态，确认所有更改正确');
