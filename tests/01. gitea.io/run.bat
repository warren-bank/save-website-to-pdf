@echo off

call "%~dp0..\env.bat"

set workspace=%~dp0.\workspace

set input_url="https://docs.gitea.io/en-us/"
set output_html_dir="%workspace%\gitea.io"
set output_pdf_file="%workspace%\gitea.io.pdf"
set hooks_module="%~dp0.\data\hooks.js"

set logfile="%workspace%\log.txt"

if exist "%workspace%" rmdir /Q /S "%workspace%"
mkdir %output_html_dir%

%url2pdf% --input-url %input_url% --output-html-dir %output_html_dir% --output-pdf-file %output_pdf_file% --hooks %hooks_module% >%logfile% 2>&1
