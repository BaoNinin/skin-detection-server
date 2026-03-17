const appConfig = {
  pages: [
    'pages/landing/index',
    'pages/camera/index',
    'pages/analyzing/index',
    'pages/result/index',
    'pages/result-detail/index',
    'pages/recommend/index',
    'pages/history/index',
    'pages/history-detail/index',
    'pages/mall/index',
    'pages/profile/index'
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
        pagePath: 'pages/landing/index',
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
    'pages/landing/index': {
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
