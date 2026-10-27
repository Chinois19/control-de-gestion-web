@echo off
cd /d "%~dp0"
echo ===================================================
echo   ACTUALIZACION DE PRODUCCION QUIRURGICA (DISCOVERER)
echo ===================================================
echo.
echo Obteniendo Produccion Quirurgica desde ODBC (DSN=dwh.dssasur.cl)...
node fetch-produccion-quirurgica.cjs
if %errorlevel% neq 0 (
  echo.
  echo [ERROR] No se pudo obtener la informacion. Verifica conexion a la VPN.
) else (
  echo.
  echo [OK] Libro de Pabellon actualizado con exito.
)
pause
