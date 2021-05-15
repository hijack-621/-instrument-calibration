@ECHO OFF
title test.bat
node ./timer.js
::taskkill /f /fi "WINDOWTITLE eq test.cmd"
::exit
