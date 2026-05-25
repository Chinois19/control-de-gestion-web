@echo off
:: Navigates to the workspace directory
cd /d "C:\Users\gonza\OneDrive\Aplicaciones Antigravity\Control de Gestion Web"

echo ===================================================
echo   COMPILANDO DATOS MENSUALES DE SIGCOM...
echo ===================================================
echo Fecha y hora actual: %date% %time%
echo.

:: Run the SIGCOM compiler
node compile-sigcom.js

echo.
echo ===================================================
echo   SUBIENDO ACTUALIZACION A PRODUCCION...
echo ===================================================

:: Git operations to push the newly generated JSON
git add src/data/sigcom_data.json
git commit -m "chore(sigcom): actualización manual de base de datos mensual"
git push

echo.
echo ===================================================
echo   PROCESO COMPLETADO EXITOSAMENTE
echo ===================================================
pause
