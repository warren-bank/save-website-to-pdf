const help = `
usage:
======
url2pdf <options>

options:
========
"-h"
"--help"
    Print a help message describing all command-line options.

"-v"
"--version"
    Display the version.

"-u" <URL>
"--url" <URL>
"--input-url" <URL>
    Specify the URL at which to begin recursively downloading a website.

"-d" <dirpath>
"--dir" <dirpath>
"--output-html-dir" <dirpath>
    Specifies the directory path where an offline copy of a website will be saved.

"-o" <filepath>
"--pdf" <filepath>
"--output-pdf-file" <filepath>
    Specifies the file path where the resulting .pdf file will be saved.

"--hooks" <filepath>
    Specifies the file path to a CommonJS module that can export various hooks to configure and modify behavior.
`

module.exports = help
