export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '分析中' })
  : { navigationBarTitleText: '分析中' }
