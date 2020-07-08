#! /usr/bin/env node

const argv_vals = require('./url2pdf/process_argv')
const url2pdf   = require('../lib/process_cli')

url2pdf(argv_vals)
