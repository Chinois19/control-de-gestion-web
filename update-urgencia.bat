@echo off
echo =========================================================================
echo ACTUALIZADOR DE DATOS DE ATENCION DE URGENCIA - HOSPITAL VILLARRICA
echo Conectando a Discoverer via VPN ODBC...
echo =========================================================================
cd /d "%~dp0"
node fetch-urgencia.cjs
pause
