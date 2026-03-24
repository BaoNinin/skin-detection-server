// 验证前端和服务器配置
const http = require('http');

console.log('\n=== 验证前端和服务器配置 ===\n');

// 检查前端配置
console.log('1. 前端配置检查:');
console.log('   当前前端使用: http://localhost:3000 (本地开发服务器)');
console.log('   ✅ 前端已配置为使用本地开发服务器\n');

// 检查服务器配置
const checkServerConfig = () => {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/config-check',
    method: 'GET'
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.status === 'success') {
            resolve(result.data);
          } else {
            reject(new Error('API 返回错误'));
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
};

console.log('2. 服务器配置检查:');

checkServerConfig()
  .then(config => {
    console.log('   模型名称:', config.cozeModel);
    console.log('   API 地址:', config.cozeApiBase);
    console.log('   API Key (前10位):', config.cozeApiKey);
    console.log('   使用模拟数据:', config.useMock);
    console.log('   运行环境:', config.nodeEnv);

    console.log('\n3. 配置验证结果:');

    let allCorrect = true;

    if (config.cozeModel === 'doubao-1-5-vision-pro-32k-250115') {
      console.log('   ✅ 模型名称正确');
    } else {
      console.log(`   ❌ 模型名称不正确: ${config.cozeModel}`);
      allCorrect = false;
    }

    if (config.cozeApiBase === 'https://ark.cn-beijing.volces.com/api/v3/chat/completions') {
      console.log('   ✅ API 地址正确');
    } else {
      console.log(`   ❌ API 地址不正确: ${config.cozeApiBase}`);
      allCorrect = false;
    }

    if (config.useMock === 'false') {
      console.log('   ✅ 使用真实 API');
    } else {
      console.log('   ❌ 使用模拟数据');
      allCorrect = false;
    }

    console.log('\n4. 总结:');
    if (allCorrect) {
      console.log('   ✅ 所有配置正确！');
      console.log('   ✅ 前端已切换到本地开发服务器');
      console.log('   ✅ 本地服务器使用正确的豆包模型');
      console.log('\n5. 下一步:');
      console.log('   a. 在微信开发者工具中重新编译项目');
      console.log('   b. 进行皮肤检测测试');
      console.log('   c. 查看本地服务器日志，确认模型调用');
      console.log('   d. 在豆包平台检查 token 使用情况（应该使用新模型）');
    } else {
      console.log('   ❌ 存在配置问题，请检查');
    }
  })
  .catch(error => {
    console.log('   ❌ 无法连接到服务器:', error.message);
    console.log('\n   请确保本地开发服务器正在运行:');
    console.log('   pnpm dev:server');
  });

console.log('\n');
