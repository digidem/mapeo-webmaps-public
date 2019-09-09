module.exports.omit = function omit (obj, blacklist) {
  const newObj = {}
  blacklist = blacklist || []
  Object.keys(obj).forEach(function (key) {
    if (blacklist.indexOf(key) >= 0) return
    newObj[key] = obj[key]
  })
  return newObj
}
