export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '记录详情' })
  : { navigationBarTitleText: '记录详情' }
