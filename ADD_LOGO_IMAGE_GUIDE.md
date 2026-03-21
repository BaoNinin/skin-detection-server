# 📸 添加 LOGO 图片到项目

## ✅ 代码已更新

我已经将首页的圆形 LOGO 区域修改为使用图片组件。

**修改内容：**
- 将 📸 emoji 替换为 Image 组件
- 引用路径：`@/assets/logo.png`

---

## 🔧 现在需要你做的

### 步骤 1：下载 LOGO 图片

**方法 A：从 Coze 下载**
1. 下载你提供的图片文件
2. 保存为 `logo.png`

**方法 B：直接使用你提供的图片链接**
```
https://code.coze.cn/api/sandbox/coze_coding/file/proxy?expire_time=-1&file_path=assets%2Floge.png&nonce=b4ebfe78-5499-44a3-883e-56fe075624df&project_id=7616586290808668211&sign=e8eba77e9ac4f3c2602369ad38e1f6aa4010675029906328430ab173d06c5c21
```

**注意：** Coze 的文件链接是临时的，建议下载后使用本地文件。

---

### 步骤 2：将图片放到项目中

**目标路径：**
```
src/assets/logo.png
```

**操作方法：**

**方法 A：使用文件管理器（推荐）**
1. 在项目目录中找到 `src/assets/` 文件夹
2. 将 `logo.png` 复制到这个文件夹

**方法 B：使用命令行**
```bash
# 假设图片在当前目录
cp logo.png src/assets/
```

**方法 C：使用 Git**
```bash
# 将图片添加到 Git
git add src/assets/logo.png
git commit -m "feat: 添加 LOGO 图片"
```

---

### 步骤 3：确认图片位置

**检查文件是否存在：**
```bash
ls -la src/assets/logo.png
```

**确认输出：**
```
-rw-r--r-- 1 user user xxxxx src/assets/logo.png
```

---

### 步骤 4：测试效果

**重启开发服务器：**
```bash
cd /workspace/projects
coze dev
```

**在微信开发者工具中：**
1. 打开首页
2. 查看圆形 LOGO 区域
3. 应该显示你的复古徽章风格 LOGO

---

## 📋 完成检查清单

- [ ] ✅ 代码已更新（index.tsx）
- [ ] ⬜ 下载了 LOGO 图片
- [ ] ⬜ 将图片放到 `src/assets/logo.png`
- [ ] ⬜ 重启开发服务器
- [ ] ⬜ 在开发者工具中查看效果

---

## 🎨 LOGO 样式说明

**当前配置：**
- 尺寸：`w-32 h-32`（128px × 128px）
- 形状：圆形（`rounded-full`）
- 背景：白色（`bg-white`）
- 阴影：轻微（`shadow-sm`）
- 图片显示：`aspectFit`（保持比例，完整显示）

**如果需要调整：**

### 调整尺寸
```tsx
<View className="w-40 h-40 bg-white rounded-full ..."> {/* 160px */}
```

### 调整圆角
```tsx
<View className="w-32 h-32 rounded-2xl ..."> {/* 方形圆角 */}
<View className="w-32 h-32 ..."> {/* 无圆角 */}
```

### 调整图片显示模式
```tsx
<Image mode="aspectFill" ... /> {/* 填充，可能裁剪 */}
<Image mode="aspectFit" ... /> {/* 完整显示，可能有留白 */}
<Image mode="scaleToFill" ... /> {/* 拉伸填充 */}
```

---

## 💡 提示

### 1. 图片格式
- 推荐格式：**PNG**（支持透明背景）
- 文件大小：建议 < 100KB
- 分辨率：建议 256x256 或 512x512

### 2. 图片名称
- 已配置的路径：`@/assets/logo.png`
- 如果文件名不同，需要修改代码中的导入路径

### 3. 如果图片不显示
**检查：**
1. 图片文件是否在正确的位置
2. 文件名是否正确（区分大小写）
3. 图片文件是否损坏
4. 开发服务器是否重启

---

## 🔧 故障排查

### 问题 1：图片显示空白

**可能原因：**
- 图片路径错误
- 文件名不匹配
- 图片文件损坏

**解决方法：**
1. 检查 `src/assets/` 目录中是否有 `logo.png`
2. 确认文件名拼写正确（包括大小写）
3. 重新下载图片

### 问题 2：图片变形

**可能原因：**
- 图片显示模式不正确

**解决方法：**
```tsx
<Image mode="aspectFit" ... /> {/* 保持比例 */}
```

### 问题 3：图片太大或太小

**解决方法：**
调整容器尺寸：
```tsx
<View className="w-40 h-40 ..."> {/* 更大 */}
<View className="w-24 h-24 ..."> {/* 更小 */}
```

---

## 📝 代码变更说明

**修改的文件：**
- `src/pages/index/index.tsx`

**变更内容：**
```tsx
// 添加导入
import logoImage from '@/assets/logo.png'

// 原来的代码（已删除）
<View className="w-32 h-32 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
  <Text className="text-6xl">📸</Text>
</View>

// 新的代码
<View className="w-32 h-32 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm overflow-hidden">
  <Image
    src={logoImage}
    mode="aspectFit"
    className="w-full h-full"
  />
</View>
```

---

## 🚀 下一步

1. **下载图片**
   - 保存为 `logo.png`

2. **放到项目**
   - 复制到 `src/assets/` 目录

3. **测试效果**
   - 重启开发服务器
   - 在开发者工具中查看

4. **调整样式**（可选）
   - 如果需要调整尺寸或显示效果

---

## ❓ 需要帮助？

如果遇到问题：
1. 告诉我具体的错误信息
2. 提供开发工具的控制台日志
3. 说明图片文件的位置和名称

我会帮你解决！

---

**现在就添加图片到项目中吧！** 🚀

完成后告诉我，效果如何！
