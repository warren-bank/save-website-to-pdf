### [url2pdf](https://github.com/warren-bank/save-website-to-pdf)

Command-line utility for downloading an offline copy of a website and converting all HTML pages to a single PDF document.

#### Installation:

```bash
npm install --global @warren-bank/save-website-to-pdf
```

#### Usage:

```bash
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
```

#### Hooks:

* please refer to [this complete example](https://github.com/warren-bank/save-website-to-pdf/blob/master/tests/01.%20gitea.io/data/hooks.js)
  - it implements a ["two-pass" strategy](https://www.princexml.com/doc/11/two-pass/)
    * 1st pass: extracts a table of contents to a new title page
    * 2nd pass: removes unwanted DOM elements (ex: header, footer, side navigation menu) before generating the final PDF document

#### Requirements:
 
* [node](https://nodejs.org/en/download/releases/)
  - tested with: [13.14.0](https://nodejs.org/download/release/v13.14.0/node-v13.14.0-win-x64.zip)
* [wget](https://www.gnu.org/software/wget/)
  - tested with: [1.19.4](https://sourceforge.net/projects/tumagcc/files/wget-1.19.4_curl-7.58_aria2-1.33.1_dwnl.7z/download) for [windows](https://opensourcepack.blogspot.com/p/wget-and-curl.html)
* [prince](https://www.princexml.com/download/)
  - tested with: [13.5](https://www.princexml.com/download/prince-13.5-win64.zip)

#### Legal:

* copyright: [Warren Bank](https://github.com/warren-bank)
* license: [GPL-2.0](https://www.gnu.org/licenses/old-licenses/gpl-2.0.txt)
