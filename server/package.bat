@echo off
REM 微信云托管 - 代码打包脚本 (Windows)

echo ========================================
echo   微信云托管 - 代码打包工具
echo ========================================
echo.

REM 检查是否在 server 目录
if not exist "package.json" (
    echo ❌ 错误：请在 server 目录下运行此脚本
    echo    当前目录：%cd%
    pause
    exit /b 1
)

if not exist "Dockerfile" (
    echo ❌ 错误：请在 server 目录下运行此脚本
    echo    当前目录：%cd%
    pause
    exit /b 1
)

REM 定义输出文件名
set OUTPUT_FILE=skin-analysis-api.zip

REM 检查是否已存在旧文件
if exist "%OUTPUT_FILE%" (
    echo ⚠️  发现已存在的打包文件：%OUTPUT_FILE%
    set /p DELETE="是否删除并重新打包？(y/n) "
    if /i "%DELETE%"=="y" (
        del "%OUTPUT_FILE%"
        echo ✅ 已删除旧文件
    ) else (
        echo ❌ 打包已取消
        pause
        exit /b 0
    )
)

echo 📦 开始打包...
echo.

REM 检查是否安装了 PowerShell
where powershell >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ 错误：未找到 PowerShell
    echo    请使用 PowerShell 或安装 7-Zip 工具
    pause
    exit /b 1
)

echo 正在打包以下文件和文件夹：
echo   ✅ Dockerfile
echo   ✅ cloudbaserc.json
echo   ✅ package.json
echo   ✅ pnpm-lock.yaml
echo   ✅ tsconfig.json
echo   ✅ nest-cli.json
echo   ✅ src\
echo   ✅ .dockerignore
echo.

REM 使用 PowerShell 压缩文件
powershell -Command "Compress-Archive -Path Dockerfile,cloudbaserc.json,package.json,pnpm-lock.yaml,tsconfig.json,nest-cli.json,src,.dockerignore -DestinationPath %OUTPUT_FILE% -Force"

REM 检查打包结果
if %errorlevel% equ 0 (
    for %%A in ("%OUTPUT_FILE%") do set FILE_SIZE=%%~zA
    set /p FILE_SIZE_H=<nul
    echo.
    echo ========================================
    echo   ✅ 打包成功！
    echo ========================================
    echo.
    echo 📄 文件名：%OUTPUT_FILE%
    echo 📦 文件位置：%cd%\%OUTPUT_FILE%
    echo.
    echo ========================================
    echo   下一步操作
    echo ========================================
    echo.
    echo 1. 登录腾讯云云托管控制台：
    echo    https://console.cloud.tencent.com/tcb
    echo.
    echo 2. 创建或进入你的环境
    echo.
    echo 3. 新建服务 -^> 从代码包上传
    echo.
    echo 4. 上传文件：%OUTPUT_FILE%
    echo.
    echo 5. 配置环境变量（参考 QUICK_DEPLOY.md）
    echo.
    echo 6. 部署服务
    echo.
    echo 详细部署指南，请查看：QUICK_DEPLOY.md
    echo.
) else (
    echo.
    echo ❌ 打包失败！
    echo 请检查：
    echo   1. 是否安装了 PowerShell
    echo   2. 是否有足够的磁盘空间
    echo   3. 所有必需文件是否存在
)

pause
