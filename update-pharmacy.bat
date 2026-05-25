@echo off
:: Navigates to the workspace directory
cd /d "C:\Users\gonza\OneDrive\Aplicaciones Antigravity\Control de Gestion Web"

echo ===================================================
echo   ACTUALIZANDO DATOS DE FARMACIA...
echo ===================================================
echo Fecha y hora actual: %date% %time%
echo.

:: Run the pharmacy parser
node parse-pharmacy.js

echo.
echo ===================================================
echo   SUBIENDO ACTUALIZACION A PRODUCCION...
echo ===================================================

:: Git operations to push the newly generated JSON
git add public/data/pharmacy_cached.json
git commit -m "chore(farmacia): actualización automática programada de producción"
git push

echo.
echo ===================================================
echo   PROCESO COMPLETADO
echo ===================================================
