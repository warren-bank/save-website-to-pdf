// ES5 only

window.addEventListener(
  "DOMContentLoaded",
  function() {
    // skip TOC page
    if (document.body.className === 'TOC')
      return

    var remove_all = function(css_selector) {
      var matches, i, match

      matches = document.querySelectorAll(css_selector)
      for (i=0; i < matches.length; i++) {
        match = matches[i]
        match.parentNode.removeChild(match)
      }
    }

    var set_attribute = function(css_selector, name, value, append) {
      var matches, i, match, old_value, new_value

      matches = document.querySelectorAll(css_selector)
      for (i=0; i < matches.length; i++) {
        match = matches[i]

        if (append) {
          old_value = match.getAttribute(name)
          new_value = old_value + ' ' + value
        }
        else {
          new_value = value
        }

        match.setAttribute(name, new_value)
      }
    }

    var relink_all = function() {
      var css_selector, matches, regex, i, match, href

      css_selector = 'a[href$=".1"]'
      matches      = document.querySelectorAll(css_selector)
      regex        = /\.1$/

      for (i=0; i < matches.length; i++) {
        match = matches[i]
        href  = match.getAttribute('href').replace(regex, '/index.html')

        match.setAttribute('href', href)
      }
    }

    remove_all('body > nav.navbar')
    remove_all('body > section.section > div.container > div.columns > div.column:first-child')
    remove_all('body > footer.footer')

    set_attribute('body > section.section > div.container > div.columns > div.column:last-child', 'class', 'column')
    set_attribute('body > section.section > div.container > div.columns > div.column:last-child', 'style', 'max-width: 765px !important;')
    set_attribute('pre', 'style', '; white-space: pre-wrap !important;', true)

    relink_all()
  },
  false
)
