const appConfig = {
  pages: [
    'pages/index/index',           // 首页（必须有，且必须在第一位）
    'pages/landing/index',         // 落地页
    'pages/camera/index',          // 相机页面
    'pages/analyzing/index',       // 分析中页面
    'pages/result/index',          // 结果页面
    'pages/result-detail/index',   // 结果详情页面
    'pages/recommend/index',       // 推荐页面
    'pages/history/index',         // 历史记录页面
    'pages/history-detail/index',  // 历史记录详情页面
    'pages/mall/index',            // 商城页面
    'pages/profile/index'          // 个人中心
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#1E40AF',
    navigationBarTitleText: '智能皮肤检测',
    navigationBarTextStyle: 'white',
    animationType: 'slide-in-right'
  },
  tabBar: {
    color: '#94A3B8',
    selectedColor: '#1E40AF',
    backgroundColor: '#ffffff',
    borderStyle: 'black' as const,
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页',
        iconPath: './assets/tabbar/camera.png',
        selectedIconPath: './assets/tabbar/camera-active.png'
      },
      {
        pagePath: 'pages/history/index',
        text: '历史',
        iconPath: './assets/tabbar/clock.png',
        selectedIconPath: './assets/tabbar/clock-active.png'
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的',
        iconPath: './assets/tabbar/user.png',
        selectedIconPath: './assets/tabbar/user-active.png'
      }
    ]
  },
  // 页面预加载配置
  preloadRule: {
    'pages/index/index': {
      network: 'all' as const,
      packages: ['pages/camera/index']
    },
    'pages/camera/index': {
      network: 'all' as const,
      packages: ['pages/analyzing/index']
    },
    'pages/analyzing/index': {
      network: 'all' as const,
      packages: ['pages/result/index']
    },
    'pages/history/index': {
      network: 'all' as const,
      packages: ['pages/history-detail/index']
    },
    'pages/result/index': {
      network: 'all' as const,
      packages: ['pages/recommend/index', 'pages/result-detail/index']
    }
  }
}

export default typeof defineAppConfig === 'function'
  ? defineAppConfig(appConfig)
  : appConfig
