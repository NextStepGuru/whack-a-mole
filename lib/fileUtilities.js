const Papa = require('papaparse')
const File = require('fs')
const _ = require('lodash')

module.exports = {
  readAndParseJson (filename) {
    return JSON.parse(File.readFileSync(filename))
  },
  readTypeFromFile (type, filename, hasHeader = true, options = {}) {
    switch (type.toLowerCase()) {
      case 'csv':
        return new Promise((resolve, reject) => {
          Papa.parse(File.createReadStream(filename), {
            header: hasHeader,
            worker: true,
            complete: (results, file) => {
              resolve(results.data)
            },
            error: err => {
              reject(err)
            }
          })
        })

      case 'tab':
        return new Promise((resolve, reject) => {
          Papa.parse(File.createReadStream(filename), {
            header: hasHeader,
            worker: true,
            complete: (results, file) => {
              resolve(results.data)
            },
            error: err => {
              reject(err)
            }
          })
        })

      case 'fixed':
        return new Promise((resolve, reject) => {
          let returnResults = []
          let readStream = File.createReadStream(filename)

          readStream
            .on('readable', function () {
              let chunk
              while ((chunk = readStream.read()) !== null) {
                returnResults.push(chunk.toString().split('\n'))
              }
            })
            .on('end', function () {
              returnResults = _.flatten(returnResults)

              for (let i = 0; i < returnResults.length; i++) {
                let record = {}
                for (let f = 0; f < options.headers.length; f++) {
                  record[options.headers[f][0]] = returnResults[i].substr(options.headers[f][1], options.headers[f][2] - options.headers[f][1]).trim()
                }
                returnResults[i] = record
              }

              resolve(returnResults)
            })
        })

      default:
        throw new Error('Unknown File Parsing Type')
    }
  }
}
