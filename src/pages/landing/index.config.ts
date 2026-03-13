export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '智能皮肤检测',
      navigationBarBackgroundColor: '#E8B4BC',
      navigationBarTextStyle: 'white'
    })
  : {
      navigationBarTitleText: '智能皮肤检测',
      navigationBarBackgroundColor: '#E8B4BC',
      navigationBarTextStyle: 'white'
    }
