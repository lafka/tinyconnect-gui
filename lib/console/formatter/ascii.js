var formatter = function(line) {
  // hope you'r not displaying a shit load of data....
  var
    buf = line.buf,
    ret = "",
    unescape = false

  // find displayable ranges and group them before concatenating them
  for (var i = 0; i < buf.length; i++) {
    var e = buf[i]

    if ("string" === typeof(e))
      e = e.charCodeAt()

    if ((e < 20 || e > 126) && (e !== 9 && e !== 10) ) {
      if (!unescape)
        ret += "< "

      unescape = true
      ret += ("0" + e.toString(16)).slice(-2) + " "
    } else {
      if (unescape) {
        ret += ">" + String.fromCharCode(e)
        unescape = false
      } else {
        ret += String.fromCharCode(e)
      }
    }
  }
  return (unescape ? ret + ">" : ret) + "\n"
}

formatter.key   = 'ascii'
formatter.label = 'ASCII'

export default formatter
