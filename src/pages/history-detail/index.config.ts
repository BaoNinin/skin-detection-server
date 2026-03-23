export default typeof definePageConfig === 'function'
  ? definePageConfig({
    navigationBarTitleText: '记录详情',
    navigationStyle: 'custom'
  })
  : {
    navigationBarTitleText: '记录详情',
    navigationStyle: 'custom'
  }
