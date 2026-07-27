@echo off

cmd.exe
python foodscan.py

cmd.exe
ngrok http 5000

pause