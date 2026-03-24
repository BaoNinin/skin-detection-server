// API 配置验证脚本 - 通过实际 API 调用验证配置是否正确
const http = require('http');

const PORT = process.env.PORT || 3000;

console.log('\n=== 通过 API 验证豆包视觉模型配置 ===\n');

const options = {
  hostname: 'localhost',
  port: PORT,
  path: '/api/config-check',
  method: 'GET'
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const result = JSON.parse(data);

      if (result.status === 'success') {
        const config = result.data;

        console.log('=== 服务器实际配置 ===\n');
        console.log('1. 豆包模型名称:');
        console.log(`   ${config.cozeModel || '未配置'}`);

        console.log('\n2. API 地址:');
        console.log(`   ${config.cozeApiBase || '未配置'}`);

        console.log('\n3. API Key (前10位):');
        console.log(`   ${config.cozeApiKey || '未配置'}`);

        console.log('\n4. 使用模拟数据:');
        console.log(`   ${config.useMock === 'true' ? '是' : '否'}`);

        console.log('\n5. 运行环境:');
        console.log(`   ${config.nodeEnv}`);

        console.log('\n6. 微信 AppID:');
        console.log(`   ${config.wechatAppId}`);

        console.log('\n=== 验证结果 ===');

        let allCorrect = true;

        if (config.cozeApiKey && (config.cozeApiKey.startsWith('ea77474e-4') || config.cozeApiKey.startsWith('ea77474e-'))) {
          console.log('✅ API Key 正确');
        } else {
          console.log(`❌ API Key 不正确: ${config.cozeApiKey}`);
          allCorrect = false;
        }

        if (config.cozeModel === 'doubao-seed-1-6-vision-250815') {
          console.log('✅ 模型名称正确');
        } else {
          console.log(`❌ 模型名称不正确: ${config.cozeModel}`);
          allCorrect = false;
        }

        if (config.cozeApiBase === 'https://ark.cn-beijing.volces.com/api/v3/responses') {
          console.log('✅ API 地址正确');
        } else {
          console.log(`❌ API 地址不正确: ${config.cozeApiBase}`);
          allCorrect = false;
        }

        if (config.useMock === 'false') {
          console.log('✅ 使用真实 API（非模拟数据）');
        } else {
          console.log('❌ 当前使用模拟数据模式');
          allCorrect = false;
        }

        console.log('\n');
        if (allCorrect) {
          console.log('🎉 所有配置验证通过！');
          console.log('您的豆包视觉模型配置完全正确。\n');
        } else {
          console.log('⚠️  存在配置问题，请检查 .env.local 文件\n');
        }
      } else {
        console.error('❌ API 返回错误:', result);
      }
    } catch (error) {
      console.error('❌ 解析响应失败:', error.message);
      console.error('响应内容:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ API 调用失败:', error.message);
  console.log('\n请确保开发服务器正在运行: pnpm dev');
});

req.end();
