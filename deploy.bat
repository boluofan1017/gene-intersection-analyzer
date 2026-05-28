@echo off
chcp 65001 >nul

echo === 基因交集分析工具 - GitHub Pages 部署脚本 ===
echo.

REM 检查git是否安装
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo 错误: 未找到git命令，请先安装git
    pause
    exit /b 1
)

REM 初始化git仓库（如果尚未初始化）
if not exist ".git" (
    echo 初始化git仓库...
    git init
)

REM 添加所有文件
echo 添加文件到git...
git add .

REM 提交更改
echo 提交更改...
git commit -m "Initial commit: Gene Intersection Analyzer"

REM 提示用户输入远程仓库地址
echo.
set /p repo_url="请输入你的GitHub仓库地址 (例如: https://github.com/username/repo.git): "

if "%repo_url%"=="" (
    echo 未输入仓库地址，跳过远程推送
    echo.
    echo 本地部署完成！请在浏览器中打开 index.html 文件
    pause
    exit /b 0
)

REM 添加远程仓库
echo 添加远程仓库...
git remote add origin "%repo_url%" 2>nul || git remote set-url origin "%repo_url%"

REM 推送到远程仓库
echo 推送到远程仓库...
git push -u origin main || git push -u origin master

echo.
echo === 部署完成 ===
echo.
echo 请按照以下步骤启用GitHub Pages:
echo 1. 访问你的GitHub仓库页面
echo 2. 点击 'Settings' 选项卡
echo 3. 在左侧菜单中找到 'Pages'
echo 4. 在 'Source' 部分选择 'main' 或 'master' 分支
echo 5. 点击 'Save'
echo.
echo 几分钟后，你的网站将在以下地址可用:
echo https://yourusername.github.io/your-repo-name/
echo.
pause
