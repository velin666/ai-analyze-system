@echo off
echo 正在部署项目到GitHub...

echo 1. 添加所有更改到Git...
git add .

echo 2. 提交更改...
set /p commitMsg="请输入提交信息（按Enter使用默认消息）: "
if "%commitMsg%"=="" set commitMsg=Update project for deployment

git commit -m "%commitMsg%"

echo 3. 推送到GitHub...
git push origin main

echo 部署完成！
echo GitHub Actions将自动构建并部署到GitHub Pages
echo 请访问: https://velin666.github.io/ai-analyze-system/

pause
