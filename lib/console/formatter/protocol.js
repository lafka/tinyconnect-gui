import hexFormatter from './hex'

var packId  = function(id) {
  return [
    (id >> 24) & 255,
    (id >> 16) & 255,
    (id >> 8) & 255,
    (id >> 0) & 255
  ].join('.')
}


var formatter = function(line) {
  if (line.proto) {
    var txt = packId(line.proto.uid)
      + ': ' + line.proto.type
      + '/' + (line.proto.detail || line.proto.command)
      + " [" + line.proto.packet_number.toString() + "]"
      + "  rssi: " + line.proto.rssi.toString()
      + ", network_lvl: " + line.proto.network_lvl.toString()
      + ", hops: " + line.proto.hops.toString()
      + ", fw-revision: " + line.proto.fw
      + "\n"

    return <span>{txt}</span>
  } else {
    return '< ' + hexFormatter(line).trim() + ' >' + "\n"
  }
}

formatter.key   = 'protocol'
formatter.label = 'Protocol'
formatter.order = 4

export default formatter
