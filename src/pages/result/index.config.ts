export default typeof definePageConfig === 'function'
  ? definePageConfig({
    navigationBarTitleText: '检测结果',
    navigationStyle: 'custom'
  })
  : {
    navigationBarTitleText: '检测结果',
    navigationStyle: 'custom'
  }
