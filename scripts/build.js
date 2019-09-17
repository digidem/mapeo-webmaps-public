const browserify = require('browserify')
const fs = require('fs')
const crypto = require('crypto')
const to = require('flush-write-stream')
const temp = require('temp')
const path = require('path')
const UglifyJS = require('uglify-js')
const envify = require('envify/custom')
const copyfiles = require('copyfiles')
const rimraf = require('rimraf')
const mkdirp = require('mkdirp')

const hashedNames = {}
const outDir = 'dist'
const tmpDir = 'tmp'

rimraf.sync(outDir)
rimraf.sync(tmpDir)
mkdirp.sync(outDir)
mkdirp.sync(tmpDir)

browserify('index.js', { debug: true })
  .transform('nanohtml')
  .transform('sheetify')
  .transform('babelify', { presets: ['@babel/preset-env'] })
  .transform(envify({ NODE_ENV: 'production' }), { global: true })
  .transform('unassertify', { global: true })
  .transform('uglifyify', { global: true })
  .plugin('css-extract', {
    out: renameStream('bundle.css')
  })
  .plugin('split-require', {
    output: renameStream('chunk.js'),
    public: '/'
  })
  .plugin('browser-pack-flat')
  .bundle()
  .pipe(renameStream('bundle.js')())
  .on('finish', function () {
    compress(outDir + hashedNames['bundle.js'])
    compress(outDir + hashedNames['chunk.js'])
    copyfiles(['static/**/*', outDir], 1, parseIndexHtml)
  })

function parseIndexHtml (err) {
  if (err) return console.error(err)
  let html = fs.readFileSync(outDir + '/index.html', 'utf8')
  Object.keys(hashedNames).forEach(function (key) {
    html = html.replace('/' + key, hashedNames[key])
  })
  fs.writeFileSync(outDir + '/index.html', html)
}

function compress (filepath) {
  const code = fs.readFileSync(filepath, 'utf8')
  const result = UglifyJS.minify(code, {
    sourceMap: {
      content: 'inline',
      filename: path.basename(filepath),
      url: path.basename(filepath) + '.map'
    }
  })
  fs.writeFileSync(filepath, result.code)
  fs.writeFileSync(filepath + '.map', result.map)
}

function renameStream (output) {
  return function () {
    const tempName = temp.path({ dir: tmpDir })
    var stream = fs.createWriteStream(tempName)
    var hash = crypto.createHash('sha256')
    return to(onwrite, onend)

    function onwrite (chunk, enc, cb) {
      hash.update(chunk)
      stream.write(chunk, cb)
    }
    function onend (cb) {
      stream.end()
      var parsed = path.parse(output)
      var name =
        parsed.dir +
        '/' +
        parsed.name +
        '.' +
        hash.digest('hex').slice(0, 10) +
        parsed.ext
      hashedNames[output] = name
      if (typeof this.emit === 'function') this.emit('name', name)
      fs.rename(tempName, outDir + name, cb)
    }
  }
}
