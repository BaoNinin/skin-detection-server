export default typeof definePageConfig === 'function'
  ? definePageConfig({
    navigationBarTitleText: '详细报告',
    navigationBarBackgroundColor: '#1E40AF',
    navigationBarTextStyle: 'white'
  })
  : {
    navigationBarTitleText: '详细报告',
    navigationBarBackgroundColor: '#1E40AF',
    navigationBarTextStyle: 'white'
  }
