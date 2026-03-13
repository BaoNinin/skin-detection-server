export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '拍摄面部',
      navigationStyle: 'custom',
      disableScroll: true
    })
  : {
      navigationBarTitleText: '拍摄面部',
      navigationStyle: 'custom',
      disableScroll: true
    }
