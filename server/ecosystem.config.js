module.exports = {
  apps: [{
    name: 'skin-detection-server',
    script: 'dist/main.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    // 日志配置
    error_file: '/var/log/skin-detection-server/error.log',
    out_file: '/var/log/skin-detection-server/out.log',
    log_file: '/var/log/skin-detection-server/combined.log',
    time: true,
    merge_logs: true,
    // 重启策略
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    min_uptime: '10s',
    max_restarts: 10,
    // 性能优化
    node_args: '--max-old-space-size=512',
    // 进程管理
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 10000,
    shutdown_with_message: true
  }]
};
