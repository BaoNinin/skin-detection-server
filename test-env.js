// 测试环境变量加载
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env.local') });

console.log('\n=== 环境变量测试 ===\n');
console.log('PROJECT_DOMAIN:', process.env.PROJECT_DOMAIN);
console.log('TARO_ENV:', process.env.TARO_ENV);
console.log('TARO_APP_WEAPP_APPID:', process.env.TARO_APP_WEAPP_APPID);

console.log('\n=== 配置文件中的值 ===\n');
console.log('process.env.PROJECT_DOMAIN || 默认值:');
console.log('  ', process.env.PROJECT_DOMAIN || 'https://skin-detection-serve-235668-9-1411837125.sh.run.tcloudbase.com');

console.log('\n');
