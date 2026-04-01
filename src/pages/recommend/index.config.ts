export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '产品推荐' })
  : { navigationBarTitleText: '产品推荐' }
