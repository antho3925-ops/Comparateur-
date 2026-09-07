@echo off
REM Double-cliquez sur ce fichier pour demarrer la plateforme et le tunnel.
REM Fermez la fenetre, ou faites Ctrl+C, pour tout arreter.
REM
REM Il passe par demarrer.ps1 en contournant la politique d'execution de
REM Windows, qui bloquerait autrement un script PowerShell telecharge.

cd /d "%~dp0"
title Suivi de performance - Swiss Times Fiduciary

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0demarrer.ps1" %*

echo.
echo La plateforme est arretee. Vous pouvez fermer cette fenetre.
pause
