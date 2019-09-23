#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const got = require('got')
const mkdirp = require('mkdirp')
const stream = require('stream')
const { promisify } = require('util')
const { randomPosition, randomPoint } = require('@turf/random')
const { featureCollection } = require('@turf/helpers')
const txtgen = require('txtgen')
const randomWords = require('bloom-random-words')
const DateGenerator = require('random-date-generator')
const archiver = require('archiver')
const rimraf = require('rimraf')

const pipeline = promisify(stream.pipeline)

const amazonBbox = [-76.59, -14.05, -51.24, 4.65]
const loc = randomPosition(amazonBbox)
const randomBbox = loc.concat([loc[0] + 1, loc[1] + 1])
const points = randomPoint(40, { bbox: randomBbox }).features.map((f, i) => ({
  id: i,
  ...f,
  properties: {
    title: capitalizeFirstLetter(randomWords({ min: 2, max: 4, join: ' ' })),
    date: DateGenerator.getRandomDateInRange(new Date(2019, 0, 1), new Date()),
    description: txtgen.paragraph(3)
  }
}))

const metadata = {
  title: capitalizeFirstLetter(randomWords({ min: 2, max: 4, join: ' ' })),
  description: txtgen.paragraph(5)
}

const argv = process.argv.slice(2)
const output = argv[0]

mkdirp.sync(path.join(output, 'images'))
const seed = Buffer.from(output, 'utf8').toString('hex')

;(async () => {
  try {
    // Download one at a time to avoid 503 from picsum
    for (var i = 0; i < 20; i++) {
      const imageFilename = `photo${i}.jpg`
      points[i].properties.image = points[i + 20].properties.image = imageFilename
      await pipeline(
        got.stream(`https://picsum.photos/seed/${seed}${i}/1200/800`),
        fs.createWriteStream(path.join(output, `images/${imageFilename}`))
      )
      console.log('downloaded image', i)
    }
  } catch (err) {
    console.error(err)
  }
  fs.writeFileSync(path.join(output, 'points.json'), JSON.stringify(featureCollection(points), null, 2))
  fs.writeFileSync(path.join(output, 'metadata.json'), JSON.stringify(metadata, null, 2))

  const ws = fs.createWriteStream(output + '.mapeomap')
  const archive = archiver('zip', {
    zlib: { level: 9 } // Sets the compression level.
  })
  const p = pipeline(archive, ws)
  archive.directory(output, false)
  archive.finalize()
  await p
  rimraf.sync(output)
})()

function capitalizeFirstLetter (string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}
