@echo off
setlocal
set PATH=C:\Program Files\nodejs;C:\Windows\System32
cd /d C:\Users\ikuma\OneDrive\Documents\Playground\THADI2
call node_modules\.bin\expo.cmd start --go --offline --max-workers 1
