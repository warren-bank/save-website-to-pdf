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

  // add user-defined options
  if (argv_vals["--hooks"] && argv_vals["--hooks"].wget && argv_vals["--hooks"].wget.options)
    opts.push(argv_vals["--hooks"].wget.options)

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

const get_rel_html_paths = (argv_vals, abs_html_paths) => {
  // prince doesn't convert links between HTML files when absolute paths are given on the command-line.
  // prince doesn't convert links between HTML files when relative paths are given on the command-line using Windows path separator.
  // workaround for bugs:
  //   - convert from absolute to relative paths
  //   - normalize relative paths to use Posix path separator
  //   - when prince is executed in a separate process, change the current working directory so relative paths will resolve

  return abs_html_paths.map(abs_path => {
    const dir      = argv_vals["--output-html-dir"]
    const rel_path = path.resolve(abs_path).replace(`${dir}${path.sep}`, '').replace(new RegExp(`[\\${path.sep}]`, 'g'), '/')

    return rel_path
  })
}

const get_prince_xml_opts = (argv_vals, rel_html_paths) => {
  // https://www.princexml.com/doc/command-line/
  const opts = []

  rel_html_paths.forEach(rel_path => {
    opts.push(`"${rel_path}"`)
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

const process_prince_xml_pass = (argv_vals, rel_html_paths, prince_xml_opts, pass_index = 1) => {
  const key = `pass_${pass_index}`

  let prince_xml_pass_opts = prince_xml_opts

  if (argv_vals["--hooks"] && argv_vals["--hooks"].prince && argv_vals["--hooks"].prince.options && argv_vals["--hooks"].prince.options[key]) {
    const options = argv_vals["--hooks"].prince.options[key]

    if (typeof options === 'string') {
      // append
      prince_xml_pass_opts += ` ${options}`
    }
    else if (typeof options === 'function') {
      prince_xml_pass_opts = options(prince_xml_pass_opts, get_prince_xml_opts, {...argv_vals}, [...rel_html_paths])
    }
  }

  const prince_xml_cmd  = `prince ${prince_xml_pass_opts}`
  debug(prince_xml_cmd)

  child.exec(
    prince_xml_cmd,
    {
      cwd:       argv_vals["--output-html-dir"],
      maxBuffer: hard_coded_settings.maxBuffer
    },
    (error, stdout, stderr) => {
      if (argv_vals["--hooks"] && argv_vals["--hooks"].prince && argv_vals["--hooks"].prince.callbacks && argv_vals["--hooks"].prince.callbacks[key]) {
        const callback = argv_vals["--hooks"].prince.callbacks[key]

        callback(argv_vals, error, stdout, stderr)
      }
      else {
        // default callback behavior is to log all data when debug is enabled

        if (error)
          debug(`error:\n${error.message}`)

        if (stderr)
          debug(`stderr:\n${stderr}`)

        if (stdout)
          debug(`stdout:\n${stdout}`)
      }

      if ((pass_index === 1) && argv_vals["--hooks"] && argv_vals["--hooks"].prince && argv_vals["--hooks"].prince.two_pass) {
        process_prince_xml_pass(argv_vals, rel_html_paths, prince_xml_opts, 2)
      }
    }
  )
}

const generate_pdf = (argv_vals, abs_html_paths) => {
  const rel_html_paths  = get_rel_html_paths(argv_vals, abs_html_paths)
  const prince_xml_opts = get_prince_xml_opts(argv_vals, rel_html_paths)

  process_prince_xml_pass(argv_vals, rel_html_paths, prince_xml_opts, 1)
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
