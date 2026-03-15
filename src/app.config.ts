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
    'pages/profile/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#E8B4BC',
    navigationBarTitleText: '智能皮肤检测',
    navigationBarTextStyle: 'white'
  },
  tabBar: {
    color: '#9CA3AF',
    selectedColor: '#E8B4BC',
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
  }
}

export default typeof defineAppConfig === 'function'
  ? defineAppConfig(appConfig)
  : appConfig
