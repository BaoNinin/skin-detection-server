export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '检测结果' })
  : { navigationBarTitleText: '检测结果' }
