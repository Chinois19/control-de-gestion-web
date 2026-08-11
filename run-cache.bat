@echo off
:: Navigates to the workspace directory
cd /d "%~dp0"

echo ===================================================
echo   INICIANDO MOTOR DE SINCRONIZACION DE CLINICA
echo ===================================================
echo Fecha y hora actual: %date% %time%
echo.

:: Runs the cache engine
node fetch-and-cache.js

echo.
echo ===================================================
echo   SUBIENDO ACTUALIZACION CLINICA A PRODUCCION...
echo ===================================================

:: Git operations to push the newly generated JSON caches
git add public/data/*_cached.json
git commit -m "chore(clinica): actualización automática programada de producción"
git push

echo.
echo ===================================================
echo   SINCRONIZACION COMPLETADA CON EXITO
echo ===================================================
echo El cache ha sido actualizado en public/data/ y subido a produccion.

