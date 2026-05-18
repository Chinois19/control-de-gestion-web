@echo off
:: Navigates to the workspace directory
cd /d "C:\Users\Minsal\OneDrive\Aplicaciones Antigravity\Control de Gestion Web"

echo ===================================================
echo   INICIANDO MOTOR DE SINCRONIZACION DE CLINICA
echo ===================================================
echo Fecha y hora actual: %date% %time%
echo.

:: Runs the cache engine
node fetch-and-cache.js

echo.
echo ===================================================
echo   SINCRONIZACION COMPLETADA CON EXITO
echo ===================================================
echo El cache ha sido actualizado en public/data/
pause
