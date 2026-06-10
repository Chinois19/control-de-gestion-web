@echo off
echo =================================================================
echo   CONFIGURADOR DE TAREAS PROGRAMADAS - CONTROL DE GESTION
echo =================================================================
echo.
echo Este script configurara la actualizacion automatica diaria en el
echo Programador de Tareas de Windows para todos los paneles del proyecto.
echo.
echo NOTA: Asegurese de ejecutar este archivo como Administrador
echo (clic derecho ^> Ejecutar como Administrador).
echo.

:: Get current directory path and remove trailing backslash
set WORKSPACE_DIR=%~dp0
set WORKSPACE_DIR=%WORKSPACE_DIR:~0,-1%

set PHARMACY_SCRIPT=%WORKSPACE_DIR%\update-pharmacy.bat
set CLINIC_SCRIPT=%WORKSPACE_DIR%\run-cache.bat
set SIGCOM_SCRIPT=%WORKSPACE_DIR%\update-sigcom.bat

echo Directorio detectado: %WORKSPACE_DIR%
echo.

:: Check if node is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ADVERTENCIA] No se detecto 'node' en la variable de entorno PATH.
    echo Asegurese de tener Node.js instalado para que las tareas funcionen.
)

echo Creando tareas en el Programador de Tareas de Windows...
echo.

:: 1. Tareas de Farmacia (06:00 y 14:00)
schtasks /create /tn "ControlGestion_Farmacia_0600" /tr "\"%PHARMACY_SCRIPT%\"" /sc daily /st 06:00 /f
schtasks /create /tn "ControlGestion_Farmacia_1400" /tr "\"%PHARMACY_SCRIPT%\"" /sc daily /st 14:00 /f

:: 2. Tareas de Clinica (07:00 y 15:00)
schtasks /create /tn "ControlGestion_Clinica_0700" /tr "\"%CLINIC_SCRIPT%\"" /sc daily /st 07:00 /f
schtasks /create /tn "ControlGestion_Clinica_1500" /tr "\"%CLINIC_SCRIPT%\"" /sc daily /st 15:00 /f

:: 3. Tareas de SIGCOM (Todos los lunes a las 08:00)
schtasks /create /tn "ControlGestion_SIGCOM_Semanal" /tr "\"%SIGCOM_SCRIPT%\"" /sc weekly /d MON /st 08:00 /f

echo.
echo =================================================================
echo   CONFIGURACION DE CREDENCIALES DE GIT (MUY IMPORTANTE)
echo =================================================================
echo Para que las tareas automatizadas puedan subir los cambios a la web
echo sin quedarse congeladas solicitando su contraseña, debe activar
echo el asistente de credenciales de Git de forma global ejecutando:
echo.
echo     git config --global credential.helper store
echo.
echo Ademas, asegurese de haber realizado al menos un "git push" manual
echo exitoso previamente en este equipo para guardar sus credenciales.
echo.
echo =================================================================
echo   PROCESO COMPLETADO
echo =================================================================
echo Puede ver las tareas creadas abriendo "Programador de Tareas"
echo en Windows y buscando "ControlGestion_".
echo.
pause

