export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '商城'
    })
  : {
      navigationBarTitleText: '商城'
    }
