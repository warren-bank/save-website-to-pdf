const process_argv = require('@warren-bank/node-process-argv')

const path = require('path')
const fs   = require('fs')

const argv_flags = {
  "--help":                   {bool: true},
  "--version":                {bool: true},

  "--input-url":              {},
  "--output-html-dir":        {file: "path-exists"},
  "--output-pdf-file":        {file: "path-dirname-exists"}
}

const argv_flag_aliases = {
  "--help":                   ["-h"],
  "--version":                ["-v"],
  "--input-url":              ["-u", "--url"],
  "--output-html-dir":        ["-d", "--dir"],
  "--output-pdf-file":        ["-o", "--pdf"]
}

let argv_vals = {}

try {
  argv_vals = process_argv(argv_flags, argv_flag_aliases)
}
catch(e) {
  console.log('ERROR: ' + e.message)
  process.exit(1)
}

if (argv_vals["--help"]) {
  const help = require('./help')
  console.log(help)
  process.exit(0)
}

if (argv_vals["--version"]) {
  const data = require('../../package.json')
  console.log(data.version)
  process.exit(0)
}

if (!argv_vals["--input-url"]) {
  console.log('ERROR: URL parameter not defined')
  process.exit(1)
}
if (!argv_vals["--output-html-dir"]) {
  console.log('ERROR: HTML directory path parameter not defined')
  process.exit(1)
}
if (!argv_vals["--output-pdf-file"]) {
  console.log('ERROR: PDF file path parameter not defined')
  process.exit(1)
}

if (!(/^https?:/i).test(argv_vals["--input-url"])) {
  console.log('ERROR: URL parameter is not valid')
  process.exit(1)
}

argv_vals["--output-html-dir"] = path.normalize(argv_vals["--output-html-dir"])
argv_vals["--output-pdf-file"] = path.normalize(argv_vals["--output-pdf-file"])

if (fs.existsSync(argv_vals["--output-pdf-file"])) {
  console.log('ERROR: PDF file path parameter already exists')
  process.exit(1)
}

module.exports = argv_vals
