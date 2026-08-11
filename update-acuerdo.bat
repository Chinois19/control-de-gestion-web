@echo off
cd /d "%~dp0"
echo ===================================================
echo   COMPILANDO ACUERDO DE PROGRAMACION MINSAL 2026...
echo ===================================================
node compile-acuerdo.js
echo.
echo ===================================================
echo   SUBIENDO CAMBIOS A PRODUCCION...
echo ===================================================
git add public/data/acuerdo_minsal_hoja1.json
git commit -m "chore(acuerdo): actualizacion automatica de datos de programacion"
git push
echo Proceso finalizado.
pause
