// ES5 only

Prince.addEventListener(
  "complete",
  function() {
    var remove_all = function(css_selector) {
      var matches, i, match

      matches = document.querySelectorAll(css_selector)
      for (i=0; i < matches.length; i++) {
        match = matches[i]
        match.parentNode.removeChild(match)
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

    var inject_title = function(title, parent_css_selector) {
      var parentNode, div

      parentNode = document.querySelector(parent_css_selector)
      if (!parentNode) return

      div = document.createElement('div')
      div.innerHTML = '<h1 class="is-size-1 has-text-centered">' + title + '</h1>'

      parentNode.insertBefore(div, parentNode.firstElementChild)
    }

    remove_all('body > nav.navbar')
    remove_all('body > section.section > div.container > div.columns > div.column:last-child')
    remove_all('body > footer.footer')

    relink_all()

    inject_title('Gitea Documentation', 'body > section.section > div.container')

    console.log('<html>')
    console.log('<head>' + document.head.innerHTML + '</head>')
    console.log('<body class="TOC">' + document.body.innerHTML + '</body>')
    console.log('</html>')
  },
  false
)
