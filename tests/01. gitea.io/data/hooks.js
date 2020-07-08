const path = require('path')
const fs   = require('fs')

const hard_coded_settings = {
  PDF_title:    'Gitea Documentation',
  TOC_filename: 'TOC.html'
}

// https://www.gnu.org/software/wget/manual/wget.html
const wget = {
  options: '--reject-regex "/search/"'
}

// https://www.princexml.com/doc/command-line/
// https://www.princexml.com/doc/11/two-pass/
const prince = {
  two_pass: true,
  options: {
    pass_1: (prince_xml_opts, get_prince_xml_opts, argv_vals, rel_html_paths) => {
      // extract the TOC from the left sidebar that is displayed on every page

      const js_file = path.resolve(__dirname, 'prince', 'pass_1', 'extract_TOC.js')

      let opts = `"${rel_html_paths[0]}" --javascript --script "${js_file}"`

      return opts
    },
    pass_2: (prince_xml_opts, get_prince_xml_opts, argv_vals, rel_html_paths) => {
      // prepend the TOC that were extracted in pass #1

      const html_file = path.resolve(argv_vals["--output-html-dir"], hard_coded_settings.TOC_filename)

      let opts = fs.existsSync(html_file)
        ? get_prince_xml_opts(argv_vals, [hard_coded_settings.TOC_filename, ...rel_html_paths])
        : prince_xml_opts

      // add title to PDF metadata
      opts += ` --pdf-title "${hard_coded_settings.PDF_title}"`

      // hide the left sidebar, as well as page headers and footers.
      // fix relative URLs that wget relinked incorrectly.
      const js_file = path.resolve(__dirname, 'prince', 'pass_2', 'modify_DOM.js')
      opts += ` --javascript --script "${js_file}"`

      return opts
    }
  },
  callbacks: {
    pass_1: (argv_vals, error, stdout, stderr) => {
      if (stdout) {
        const html_file = path.resolve(argv_vals["--output-html-dir"], hard_coded_settings.TOC_filename)

        fs.writeFileSync(html_file, stdout)
      }
    },
    pass_2: (argv_vals, error, stdout, stderr) => {}
  }
}

module.exports = {wget, prince}
