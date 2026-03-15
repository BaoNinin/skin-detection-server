export default typeof definePageConfig === 'function'
  ? definePageConfig({
    navigationBarTitleText: '详细报告',
    navigationBarBackgroundColor: '#F43F5E',
    navigationBarTextStyle: 'white'
  })
  : {
    navigationBarTitleText: '详细报告',
    navigationBarBackgroundColor: '#F43F5E',
    navigationBarTextStyle: 'white'
  }
