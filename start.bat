@echo off
cd /d %~dp0

echo Запуск сервера...
start "" cmd /c "node server/app.js"

echo Подожди 5 секунд, сервер запускается...
timeout /t 5

echo Открываем сайт...
start http://localhost:5000

echo.
echo Готово! Если браузер не открылся — введи в адресной строке: http://localhost:5000
echo Чтобы остановить сервер — закрой чёрное окно с надписью "node server/app.js"
pause