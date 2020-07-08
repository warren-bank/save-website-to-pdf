const debug = require('./debug')
const path  = require('path')
const child = require('child_process')

const hard_coded_settings = {
  maxBuffer: (1024 * 1024 * 100),  // 100 MB
  pdfMargin: "0mm"
}

const url_pattern = new RegExp('^(?:https?://[^/]+/)((?:[^/]+/)*)(?:[^/]*)$', 'i')

const get_wget_opts = (argv_vals) => {
  const url        = argv_vals["--input-url"]
  const matches    = url_pattern.exec(url)
  const pathname   = matches[1]
  const dirs_count = pathname.replace(new RegExp('[^/]+', 'g'), '').length

  // https://www.gnu.org/software/wget/manual/wget.html
  const opts = []

  // base output directory
  const dir = argv_vals["--output-html-dir"]
  opts.push(`-P "${dir}"`)

  // do not create a subdirectory for the hostname
  opts.push('-nH')

  // do not create subdirectories for parent directories in url pathname
  if (dirs_count)
    opts.push(`--cut-dirs ${dirs_count}`)

  // recurse (ie: follow links) an unlimited depth beneath parent directory, do not recurse above parent directory, convert links for downloaded files to relative paths
  opts.push('-r -l inf -np -k')

  // download prerequisite files (ex: img, css, js)
  opts.push('-p')

  // ignore verification of TLS authority, ignore robots.txt exclusions
  opts.push('--no-check-certificate -e robots=off')

  // reduce verbosity of log output
  opts.push('-nv')

  // download URL
  opts.push(`"${url}"`)

  return opts.join(' ')
}

const extract_absolute_html_filepaths = ({text, paths}) => {
  const grep_pattern = new RegExp(` -> "([^"]+\.html?)"`, 'ig')
  let matches

  while (null !== (matches = grep_pattern.exec(text.replace(/[\r\n]+/g, ' ')))) {
    paths.push(matches[1])
  }
}

const get_prince_xml_opts = (argv_vals, abs_html_paths) => {
  // https://www.princexml.com/doc/command-line/
  const opts = []

  // prince doesn't convert links between HTML files when absolute paths are given on the command-line.
  // prince doesn't convert links between HTML files when relative paths are given on the command-line using Windows path separator.
  // workaround for bugs:
  //   - convert from absolute to relative paths
  //   - normalize relative paths to use Posix path separator
  //   - when prince is executed in a separate process, change the current working directory so relative paths will resolve
  abs_html_paths.forEach(abs_html_file => {
    const dir           = argv_vals["--output-html-dir"]
    const rel_html_file = path.resolve(abs_html_file).replace(`${dir}${path.sep}`, '').replace(new RegExp(`[\\${path.sep}]`, 'g'), '/')

    opts.push(`"${rel_html_file}"`)
  })

  // treat all input files as html format
  opts.push('-i html')

  // allow network access, ignore verification of TLS authority
  opts.push('--insecure')

  // render for A4 paper size with no extra page margins
  opts.push('--page-size "A4"')
  opts.push(`--page-margin "${hard_coded_settings.pdfMargin}"`)

  // render for screen media type
  opts.push('--media screen')

  // ignore css warnings
  opts.push('--no-warn-css')

  // output filepath
  const pdf_file = argv_vals["--output-pdf-file"]
  opts.push(`-o "${pdf_file}"`)

  return opts.join(' ')
}

const generate_pdf = (argv_vals, abs_html_paths) => {
  const prince_xml_opts = get_prince_xml_opts(argv_vals, abs_html_paths)
  const prince_xml_cmd  = `prince ${prince_xml_opts}`

  debug(prince_xml_cmd)

  child.exec(
    prince_xml_cmd,
    {
      cwd:       argv_vals["--output-html-dir"],
      maxBuffer: hard_coded_settings.maxBuffer
    },
    (error, stdout, stderr) => {
      if (error)
        debug(`error:\n${error.message}`)

      if (stderr)
        debug(`stderr:\n${stderr}`)

      if (stdout)
        debug(`stdout:\n${stdout}`)
    }
  )
}

const url2pdf = (argv_vals) => {
  const wget_opts = get_wget_opts(argv_vals)
  const wget_cmd  = `wget ${wget_opts}`

  debug(wget_cmd)

  child.exec(
    wget_cmd,
    {
      maxBuffer: hard_coded_settings.maxBuffer
    },
    (error, stdout, stderr) => {
      const abs_html_paths = []

      if (error)
        debug(`error:\n${error.message}`)

      if (stderr) {
        debug(`stderr:\n${stderr}`)
        extract_absolute_html_filepaths({text: stderr, paths: abs_html_paths})
      }

      if (stdout) {
        debug(`stdout:\n${stdout}`)
        extract_absolute_html_filepaths({text: stdout, paths: abs_html_paths})
      }

      debug('html files:', JSON.stringify(abs_html_paths, null, 2))

      generate_pdf(argv_vals, abs_html_paths)
    }
  )
}

module.exports = url2pdf
