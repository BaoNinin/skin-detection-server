// 用模块级变量在页面间共享图片数据（不走 setData/Storage，无大小限制）
export const cameraState = {
  previewImageSrc: '' // base64 data URI 或 fallback 的 tempFilePath
}
