/**
 * 深色模式样式类
 * 用于与 Tailwind CSS 配合使用
 */

export const darkModeClasses = {
  // 背景色
  background: {
    primary: 'dark:bg-gray-900',
    secondary: 'dark:bg-gray-800',
    tertiary: 'dark:bg-gray-700',
    card: 'dark:bg-gray-800',
  },
  
  // 文字颜色
  text: {
    primary: 'dark:text-gray-100',
    secondary: 'dark:text-gray-300',
    tertiary: 'dark:text-gray-400',
    muted: 'dark:text-gray-500',
  },
  
  // 边框
  border: {
    primary: 'dark:border-gray-700',
    secondary: 'dark:border-gray-600',
  },
  
  // 按钮背景
  button: {
    primary: 'dark:bg-rose-500',
    secondary: 'dark:bg-gray-700',
    ghost: 'dark:bg-gray-700',
  },
  
  // 输入框
  input: {
    background: 'dark:bg-gray-800',
    placeholder: 'dark:text-gray-400',
  },
  
  // 阴影
  shadow: {
    sm: 'dark:shadow-none',
    md: 'dark:shadow-none',
  },
}

/**
 * 获取深色模式类名
 * @param isDark 是否深色模式
 * @param classes 样式类对象
 */
export function getDarkClass(
  isDark: boolean,
  classes: { [key: string]: string }
): string {
  return isDark ? (classes.dark || '') : (classes.light || '')
}
