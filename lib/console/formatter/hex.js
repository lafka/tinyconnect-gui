import map from 'lodash/collection/map'

var formatter = function(line) {
  return map(line.buf, function(n) {
    if ("string" === typeof(n))
      n = n.charCodeAt()

    return ("0" + n.toString(16)).slice(-2)
  }).join(' ') + "\n"
}

formatter.key  = 'hex'
formatter.label = 'Hex'

export default formatter
