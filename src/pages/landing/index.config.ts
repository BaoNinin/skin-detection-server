export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '智能皮肤检测',
      navigationBarBackgroundColor: '#1E40AF',
      navigationBarTextStyle: 'white'
    })
  : {
      navigationBarTitleText: '智能皮肤检测',
      navigationBarBackgroundColor: '#1E40AF',
      navigationBarTextStyle: 'white'
    }
