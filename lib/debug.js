const debug_enabled = true

const debug = (...args) => {
  if (debug_enabled)
    console.log(...args)
}

module.exports = debug
