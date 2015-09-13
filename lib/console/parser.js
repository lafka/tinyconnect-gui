import {Buffer} from 'buffer'


var fromHex = function(buf) {
  // fix some formats and stuff with padding etc
  var processed = buf
    .split(/\s+/)
    .map(function(v) {
      return v ? ("0" + v).slice(-1 * v.length - (v.length % 2)) : '';
    })
    .join('')

  if (isNaN(parseInt(processed)))
    return {error: "invalid hex input"}

  return new Buffer(processed, "hex")
}

var fromBin = function(buf) {
  var err = undefined

  var processed = buf
    .split(/\s+/)
    .reduce(function(acc, n) {
      if ('' === n)
        return acc

      var num = parseInt(n)

      if (isNaN(num && !err)) {
        err = {error: 'invalid number `' + n + '` in byte array', pos: -1}
      } else if (num > 255 || num < 0 && !err) {
        err = {error: 'invalid byte `' + n + ', out of range 0..255', pos: -1}
      } else {
        acc.push(num)
      }

      return acc
    }, [])

  return err || new Buffer(processed)
}

var fromAscii = function(buf) {
  return new Buffer(buf)
}

var pair = {
  '<': '>',
  '[': ']',
  '"': '"',
  '\'': '\''
}

var parseAs = {
  '<': fromHex,
  '[': fromBin,
  '"': fromAscii,
  '\'': fromAscii
}

var parser = function(buf, acc) {
  if ('' === buf)
    return acc

  acc = acc || new Buffer("")
  var
    head = buf.slice(0, 1),
    rest = buf.slice(1)

  console.log('ead', head, rest)

  if (!pair[head])
    return {error: 'expected one of `[`, `<`, `\'`, `"`. Got: `' + head + '`', pos: acc.length}

  var parts = rest.split(pair[head])
  if (undefined === parts[1])
    return {error: "failed to find matching `" + head + "`", pos: acc}

  var res = parseAs[head](parts[0])
  if (res.error)
    return res

  parts.shift()
  return parser(parts.join(pair[head]), Buffer.concat([acc, res]))
}

parser.help = `\
Tiny Connect serial port: Observe IO on the serial port side of the communication.
You can use this to send data to the TinyMesh gateway module by typing data below.
The console accepts the following formats:

  "normal ASCII data"                   <- send ASCII data
  <07 08 09 0a 0b 0c 0d>                <- sends HEX data
  [255 255 255 255 0]                   <- sends decimal data
  "ASCII data + hex: " <12 34 56> [0]   <- you can use any combination

-----------------------------------------------------------
`

export default parser
