import map from 'lodash/collection/map'

var formatter = function(line) {
  return map(line.buf, function(n) {
    if ("string" === typeof(n))
      n = n.charCodeAt()

    return n.toString()
  }).join(' ') + "\n"
}

formatter.key  = 'binary'
formatter.label = 'Binary'
formatter.order = 3

export default formatter
