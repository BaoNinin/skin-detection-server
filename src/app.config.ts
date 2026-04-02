const appConfig = {
  pages: [
    'pages/landing/index',
    'pages/camera/index',
    'pages/analyzing/index',
    'pages/result/index',
    'pages/result-detail/index',
    'pages/history/index',
    'pages/history-detail/index',
    'pages/mall/index',
    'pages/profile/index',
    'pages/nfc-writer/index',  // NFC 写入工具页面
    'pages/recommend/index',  // 产品推荐页面
    'pages/camera-preview/index' // 拍照确认页面
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#1E40AF',
    navigationBarTitleText: '智能皮肤检测',
    navigationBarTextStyle: 'white'
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
  }
}

export default typeof defineAppConfig === 'function'
  ? defineAppConfig(appConfig)
  : appConfig
