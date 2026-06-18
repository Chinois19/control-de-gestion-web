@echo off
cd /d "%~dp0"
echo ===================================================
echo   INICIANDO ACTUALIZACION COMPLETA DE PANELES (VPN)
echo ===================================================
echo.

echo [1/7] Obteniendo datos de REDCap y API externa (fetch-and-cache)...
node fetch-and-cache.js
if %errorlevel% neq 0 echo Error en fetch-and-cache.js

echo [2/7] Parseando datos de Farmacia...
node parse-pharmacy.js
if %errorlevel% neq 0 echo Error en parse-pharmacy.js

echo [3/7] Compilando datos de SIGCOM...
node compile-sigcom.js
if %errorlevel% neq 0 echo Error en compile-sigcom.js

echo [4/7] Compilando Acuerdo de Programacion...
node compile-acuerdo.js
if %errorlevel% neq 0 echo Error en compile-acuerdo.js

echo [5/7] Compilando Ley 18834...
node parse_ley18834.js
if %errorlevel% neq 0 echo Error en parse_ley18834.js

echo [6/7] Procesando Libro de Pabellon...
node procesar-libro.js
if %errorlevel% neq 0 echo Error en procesar-libro.js

echo [7/7] Procesando datos de Laboratorio...
node scripts/process_lab_excel.cjs
if %errorlevel% neq 0 echo Error en process_lab_excel.cjs

echo.
echo ===================================================
echo   SUBIENDO CAMBIOS A PRODUCCION...
echo ===================================================
git add public/ src/data/sigcom_data.json update-pharmacy.bat actualizar_todo.bat
git commit -m "chore: actualizacion completa de paneles desde VPN"
git push

echo ===================================================
echo   ACTUALIZACION FINALIZADA
echo ===================================================
pause
