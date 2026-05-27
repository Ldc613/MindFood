@echo off
chcp 65001 >nul
cd /d "%~dp0"

if not exist "data\what_to_eat.db" (
    echo 正在初始化数据库...
    python database\init_db.py
)

echo.
echo 正在启动“吃什么”项目...
echo 浏览器地址：http://127.0.0.1:5000
echo 停止服务：在本窗口按 Ctrl + C
echo.

start "" cmd /c "timeout /t 2 >nul && start http://127.0.0.1:5000"
python app.py

pause
