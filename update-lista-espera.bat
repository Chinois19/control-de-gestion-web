@echo off
chcp 65001 > nul
title Actualizacion Lista de Espera de Consultas

echo ================================================
echo  Lista de Espera - Actualizacion de datos
echo  Hospital de Villarrica - Control de Gestion
echo  %date% %time%
echo ================================================
echo.

cd /d "%~dp0"

echo [1/2] Ejecutando extraccion ODBC Oracle...
echo        (Asegurate de tener la VPN activa)
echo.
node fetch-lista-espera.cjs
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo *** ERROR: Fallo la extraccion de datos. ***
    echo     Verifica que la VPN este activa y el DSN ODBC configurado.
    pause
    exit /b 1
)

echo.
echo [2/2] Datos actualizados correctamente.
echo.
echo ================================================
echo  Archivo generado: public\data\lista_espera_cached.json
echo  Recarga la aplicacion en el navegador para ver
echo  los datos actualizados.
echo ================================================
echo.
pause
