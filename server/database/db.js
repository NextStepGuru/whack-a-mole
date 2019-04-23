const fs = require('fs')
const DatabaseUtilities = require(`../../lib/databaseUtilities.js`)
let data = {}

fs.readdirSync(`${__dirname}/../../server/database/`)
  .filter(itemName => itemName[0] !== '.' && itemName.split('.')[1] !== 'js')
  .forEach(itemName => {
    try {
      data[itemName] = {
        db: require(`${__dirname}/../../server/database/${itemName}/config/db.js`),
        mappers: (function (itemName) {
          try {
            return DatabaseUtilities.buildMappers(`${__dirname}/../../server/database/${itemName}/mappers/`)
          } catch (e) {
            console.log(`Failed to load Mappers ${itemName}`)
            return {}
          }
        }(itemName)),
        models: (function (itemName) {
          let models = {}
          fs.readdirSync(`${__dirname}/../../server/database/${itemName}/models/`)
            .filter(subItem => subItem !== 'base.js')
            .forEach(subItem => {
              models[subItem.split('.')[0]] = require(`${__dirname}/../../server/database/${itemName}/models/${subItem}`)
            })

          return models
        }(itemName))
      }
    } catch (e) {
      console.log(`Failed loading Database ${itemName}`, e)
    }
  })
module.exports = data
