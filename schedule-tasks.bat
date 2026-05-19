@echo off
echo =================================================================
echo   CONFIGURADOR DE TAREAS PROGRAMADAS - CONTROL DE FARMACIA
echo =================================================================
echo.
echo Este script configurará la actualización automática diaria a las
echo 06:00 y a las 14:00 para la Producción de Farmacia.
echo.
echo NOTA: Por favor, asegúrese de ejecutar este archivo como
echo Administrador (clic derecho ^> Ejecutar como Administrador).
echo.

:: Get current directory path and remove trailing backslash
set WORKSPACE_DIR=%~dp0
set WORKSPACE_DIR=%WORKSPACE_DIR:~0,-1%
set SCRIPT_PATH=%WORKSPACE_DIR%\parse-pharmacy.js

echo Directorio detectado: %WORKSPACE_DIR%
echo Script a ejecutar: %SCRIPT_PATH%
echo.

:: Check if node is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ADVERTENCIA] No se detectó 'node' en la variable de entorno PATH.
    echo Asegúrese de tener Node.js instalado para que la tarea programada funcione.
)

echo Creando tareas en el Programador de Tareas de Windows...
echo.

:: Create task for 06:00
schtasks /create /tn "ControlGestion_Farmacia_0600" /tr "node \"%SCRIPT_PATH%\"" /sc daily /st 06:00 /f
if %errorlevel% equ 0 (
    echo [OK] Tarea de las 06:00 creada con éxito.
) else (
    echo [ERROR] Falló la creación de la tarea de las 06:00.
    echo Verifique si tiene privilegios de Administrador.
)

echo.

:: Create task for 14:00
schtasks /create /tn "ControlGestion_Farmacia_1400" /tr "node \"%SCRIPT_PATH%\"" /sc daily /st 14:00 /f
if %errorlevel% equ 0 (
    echo [OK] Tarea de las 14:00 creada con éxito.
) else (
    echo [ERROR] Falló la creación de la tarea de las 14:00.
    echo Verifique si tiene privilegios de Administrador.
)

echo.
echo =================================================================
echo   PROCESO COMPLETADO
echo =================================================================
echo Puede ver las tareas creadas abriendo "Programador de Tareas"
echo en Windows y buscando "ControlGestion_Farmacia_".
echo.
pause
