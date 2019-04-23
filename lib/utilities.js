// npm
const { find, indexOf, has, merge, isNil } = require('lodash')
const Moment = require('moment')
const Bcrypt = require('bcryptjs')

module.exports = {
  shuffle: (array) => {
    let currentIndex = array.length
    let temporaryValue, randomIndex

    // While there remain elements to shuffle...
    while (currentIndex !== 0) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex)
      currentIndex -= 1

      // And swap it with the current element.
      temporaryValue = array[currentIndex]
      array[currentIndex] = array[randomIndex]
      array[randomIndex] = temporaryValue
    }

    return array
  },
  filterFields (data, fields, parent) {
    for (let key in data) {
      if (key[0] === '$') {
        delete data[key]
      } else if (fields.length === 0) {
        // do nothing
      } else if (Array.isArray(data[key]) && fields.length) {
        let findObj = {}
        findObj[key] = []
        let thisFields = find(fields, findObj)

        if (thisFields) {
          for (let i = 0; i < data[key].length; i++) {
            data[key][i] = this.filterFields(data[key][i], thisFields[key], key)
          }
        } else {
          delete data[key]
        }
      } else if (typeof data[key] === 'object' && !isNil(data[key]) && data[key] instanceof Date === false) {
        let findObj = {}
        findObj[key] = []
        let thisFields = find(fields, findObj)
        if (thisFields) {
          data[key] = this.filterFields(data[key], thisFields[key], key)
        } else {
          delete data[key]
        }
      } else if (indexOf(fields, key) === -1) {
        delete data[key]
      }
    }

    return data
  },
  comparePasswords (passwordOld, passwordNew) {
    return Bcrypt.compareSync(passwordNew, passwordOld)
  },
  encryptPassword (password) {
    const salt = Bcrypt.genSaltSync(12)

    let thisPassword = password

    thisPassword = Bcrypt.hashSync(thisPassword, salt)

    return thisPassword
  },
  formatObjectForPatch (sourceData) {
    let returnObject = sourceData
    if (returnObject['$dirty'] === undefined || returnObject['$dirty'] === null || !Array.isArray(returnObject['$dirty']['$s'])) {
      returnObject['$dirty'] = { '$s': [], '$d': [] }
    }

    let keepFields = returnObject['$dirty']['$s']
    let objectFields = []

    if (Array.isArray(returnObject.constructor.idColumn)) {
      for (let k = 0; k < returnObject.constructor.idColumn.length; k++) {
        keepFields.push(returnObject.constructor.idColumn[k])
      }
    } else {
      keepFields.push(returnObject.constructor.idColumn)
    }

    if (indexOf(keepFields, 'id') === -1) {
      keepFields.push('id')
    }

    for (let key in returnObject) {
      if (returnObject[key] instanceof Object && typeof returnObject[key] === 'object' && returnObject[key] !== null && returnObject[key].constructor.name !== 'Date' && indexOf(keepFields, key) === -1) {
        objectFields.push(key)
      } else if (returnObject[key] instanceof Array) {
        // array
      } else if (indexOf(keepFields, key) === -1) {
        delete returnObject[key]
      }
    }
    for (let i = 0; i < objectFields.length; i++) {
      for (let k = 0; k < keepFields.length; k++) {
        if (!has(returnObject[objectFields[i]], keepFields[k]) && keepFields[k] !== 'id') {
          delete returnObject[objectFields[i]]
          break
        }
      }
    }

    returnObject['$isDirty'] = false
    returnObject['$dirty'] = { '$s': [], '$d': [] }

    return returnObject
  },
  bulkMergeObject (sourceData, mergeObject) {
    let thisData = sourceData
    if (!Array.isArray(thisData)) {
      thisData = [thisData]
    }

    for (let i = 0; i < thisData.length; i++) {
      thisData[i] = merge(thisData[i], mergeObject)
    }

    return Array.isArray(sourceData) ? thisData : thisData[0]
  },
  remapColumns (sourceData, columnMap, keepUnmappedColumns = true) {
    let thisData = sourceData
    if (!Array.isArray(thisData)) {
      thisData = [thisData]
    }

    for (let i = 0; i < thisData.length; i++) {
      let thisItem = thisData[i]
      let newItem

      if (keepUnmappedColumns) {
        newItem = thisData[i]
      } else {
        newItem = {}
      }
      for (let key in columnMap) {
        if (thisItem[key] !== undefined) {
          if (typeof columnMap[key] === 'object' && !Array.isArray(columnMap[key])) {
            if ('mapPath' in columnMap[key]) {
              if (newItem[columnMap[key]['mapPath']] === undefined) {
                newItem[columnMap[key]['mapPath']] = {}
                newItem[columnMap[key]['mapPath']][columnMap[key]['mapColumn']] = {}
              }
              newItem[columnMap[key]['mapPath']][columnMap[key]['mapColumn']] = thisItem[key]
              newItem[columnMap[key]['mapPath']] = this.bulkMergeObject(newItem[columnMap[key]['mapPath']], {
                accountId: thisItem.accountId,
                channelId: thisItem.channelId,
                integrationId: thisItem.integrationId
              })
            } else {
              newItem[key] = this.bulkMergeObject(thisItem[key], {
                accountId: thisItem.accountId,
                channelId: thisItem.channelId,
                integrationId: thisItem.integrationId
              })
              newItem[key] = this.remapColumns(newItem[key], columnMap[key], keepUnmappedColumns)
            }
          } else if (Array.isArray(columnMap[key])) {
            if ('mapPath' in columnMap[key][0]) {
              if (newItem[columnMap[key][0]['mapPath']] === undefined) {
                newItem[columnMap[key][0]['mapPath']] = []
                newItem[columnMap[key][0]['mapPath']][0] = {}
              }
              newItem[columnMap[key][0]['mapPath']][0][columnMap[key][0]['mapColumn']] = thisItem[key]
              newItem[columnMap[key][0]['mapPath']][0] = this.bulkMergeObject(newItem[columnMap[key][0]['mapPath']][0], {
                accountId: thisItem.accountId,
                channelId: thisItem.channelId,
                integrationId: thisItem.integrationId
              })
            } else {
              newItem[key] = this.bulkMergeObject(thisItem[key], {
                accountId: thisItem.accountId,
                channelId: thisItem.channelId,
                integrationId: thisItem.integrationId
              })
              newItem[key] = this.remapColumns(newItem[key], columnMap[key][0], keepUnmappedColumns)
            }
          } else {
            newItem[columnMap[key]] = this.ifDateDatabaseFormatOrReturn(thisItem[key])
            if (key !== columnMap[key]) {
              delete newItem[key]
            }
          }
        }
      }

      thisData[i] = newItem
    }

    return Array.isArray(sourceData) ? thisData : thisData[0]
  },
  normalizeAxiosErrorResponse (data) {
    let returnData = {
      response: {}
    }

    if (data.returnData === undefined && data.response && data.response.data) {
      returnData.data = data.response.data
    } else if (data.returnData === undefined && data && data.data && data.data.message && data.data.message.length) {
      returnData.data.error = {
        message: data.data.message[0],
        code: 501,
        errno: data.data.error ? data.data.error.code : '0'
      }
    } else {
      returnData.data.error = {}
      returnData.data = data.response.data
      returnData.data.error.code = 502
    }

    return returnData
  },
  parsedStringTemplate (template, args) {
    const EVALUATE_TEMPLATE = (template, variables) => {
      return Function(...Object.keys(variables), `return ${template}`)(...Object.values(variables))
    }

    return EVALUATE_TEMPLATE(template, { ...args })
  },
  sleep (ms) {
    return new Promise(resolve => {
      setTimeout(resolve, ms)
    })
  },
  formatAddressAsEasypost (address) {
    return {
      name: address.name,
      company: address.company,
      street1: address.addressLine1,
      street2: address.addressLine2,
      city: address.city,
      state: address.stateOrProvidence,
      zip: address.postalCode,
      country: address.country,
      residential: null,
      phone: address.phoneWork !== null ? address.phoneWork : address.phoneHome,
      email: address.email
    }
  },
  ifDateDatabaseFormatOrReturn (sourceData) {
    const zulu = RegExp('[0-9]{4}-?[0-9]{2}-?[0-9]{2}T[0-9]{2}:?[0-9]{2}:?[0-9]{2}(.[0-9]{3})?(-[0-9]{2}:[0-9]{2})?Z?', 'g')
    /*
      20180613T233545Z
      2018-05-11T13:13:32
      2018-05-11T17:08:21-04:00
    */
    if (zulu.test(sourceData) === true) {
      return Moment(sourceData).format('YYYY-MM-DD HH:mm:SS')
    } else {
      return sourceData
    }
  },
  findKeyDeepInObject (o, id) {
    // Early return
    if (o.id === id) {
      return o
    }
    var result, p
    for (p in o) {
      if (o.hasOwnProperty(p) && typeof o[p] === 'object') {
        result = this.findKeyDeepInObject(o[p], id)
        if (result) {
          return result
        }
      }
    }
    return result
  }
}
