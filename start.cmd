@echo off
rem Starts World Kitchen on http://localhost:5173 and opens it. Close this window to stop.
cd /d "%~dp0"
start "" http://localhost:5173
node tools\serve.js
