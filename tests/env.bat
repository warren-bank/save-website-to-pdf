@echo off

set node_HOME=C:\PortableApps\node.js\13.14.0
set wget_HOME=C:\PortableApps\wget\1.19.4
set prince_HOME=C:\PortableApps\prince-13.5-win64\bin
set PATH=%node_HOME%;%wget_HOME%;%prince_HOME%;%PATH%

set url2pdf=node "%~dp0..\bin\url2pdf.js"
