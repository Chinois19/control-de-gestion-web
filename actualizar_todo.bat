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

echo [5/7] Compilando Metas Sanitarias (Ley 18.834, Ley 19.664, Ley 20.707) y COMGES 2026...
node parse_ley18834.js
if %errorlevel% neq 0 echo Error en parse_ley18834.js
node scripts/update_comges.js
if %errorlevel% neq 0 echo Error en update_comges.js
node scripts/update_ley18834.js
if %errorlevel% neq 0 echo Error en update_ley18834.js
node scripts/update_ley19664.js
if %errorlevel% neq 0 echo Error en update_ley19664.js
node scripts/update_ley20707.js
if %errorlevel% neq 0 echo Error en update_ley20707.js

echo [6/7] Obteniendo Produccion Quirurgica desde ODBC (Discoverer)...
node fetch-produccion-quirurgica.cjs
if %errorlevel% neq 0 echo Error en fetch-produccion-quirurgica.cjs

echo [7/8] Procesando datos de Laboratorio...
node scripts/process_lab_excel.cjs
if %errorlevel% neq 0 echo Error en process_lab_excel.cjs

echo [8/10] Obteniendo Actividades Medicina de Especialidad desde ODBC...
node fetch-actividades-medicina.cjs
if %errorlevel% neq 0 echo Error en fetch-actividades-medicina.cjs

echo [9/10] Obteniendo Consultas de Urgencia desde ODBC...
node fetch-urgencia.cjs
if %errorlevel% neq 0 echo Error en fetch-urgencia.cjs

echo [9b/11] Obteniendo Tiempos de Espera C2 de Urgencia desde ODBC...
node extract_urgencia_tiempos.cjs
if %errorlevel% neq 0 echo Error en extract_urgencia_tiempos.cjs

echo [9c/11] Obteniendo Insumos y Costeo Quirurgico...
node fetch-insumos.cjs
if %errorlevel% neq 0 echo Error en fetch-insumos.cjs

echo [10/11] Obteniendo Lista de Espera desde ODBC...
node fetch-lista-espera.cjs
if %errorlevel% neq 0 echo Error en fetch-lista-espera.cjs

echo [11/11] Obteniendo Consultas Profesionales No Medicos (RUP APS) desde ODBC...
node fetch-profesionales-aps.cjs
if %errorlevel% neq 0 echo Error en fetch-profesionales-aps.cjs

echo.
echo ===================================================
echo   SUBIENDO CAMBIOS A REPOSITORIO GIT...
echo ===================================================
git add .
git commit -m "chore: actualizacion completa de paneles desde VPN"
git push

echo.
echo ===================================================
echo   COMPILANDO Y DESPLEGANDO A CLOUDFLARE...
echo ===================================================
call npm run build
echo Desplegando en Cloudflare Workers...
call npx wrangler deploy

echo ===================================================
echo   ACTUALIZACION FINALIZADA CON EXITO
echo ===================================================
pause
