const File = require('fs')
// const _ = require('lodash')

module.exports = {
  retryOnLock: async (maxRetryCount = 2, fn, timeout = 120000, ...args) => {
    var i = 0
    var response = {}
    var isDeadlock = false
    var isLockTimeout = false
    var isUnknownCode = false
    let timer = setTimeout(() => {
      i = maxRetryCount + 1
    }, timeout)
    do {
      try {
        let RES = await fn(...args)
        response = RES || {}
      } catch (err) {
        response = err || {}
      }
      isDeadlock = response.code && response.code === 'ER_LOCK_DEADLOCK'
      isLockTimeout = response.code && response.code === 'ER_LOCK_WAIT_TIMEOUT'
      isUnknownCode = response.code && response.code === 'UNKNOWN_CODE_PLEASE_REPORT'
      i++
    } while (
      i < maxRetryCount && (isDeadlock || isLockTimeout || isUnknownCode)
    )
    clearTimeout(timer)
    return response
  },
  buildMappers (dir) {
    let mappers = {}
    if (File.existsSync(dir)) {
      File.readdirSync(dir)
        .forEach(subItem => {
          try {
            mappers[subItem.split('.')[0]] = require(`${dir}${subItem}`)
            for (let key in mappers[subItem.split('.')[0]]) {
              if (mappers[subItem.split('.')[0]][key][0] === '.') {
                try {
                  mappers[subItem.split('.')[0]][key] = require(`${dir}${mappers[subItem.split('.')[0]][key]}`)
                } catch (e) {
                  // console.log(e)
                  console.log('key1', `${dir}${mappers[subItem.split('.')[0]][key]}`)
                }
              } else if (Array.isArray(mappers[subItem.split('.')[0]][key])) {
                try {
                  if (Array.isArray(mappers[subItem.split('.')[0]][key])) {
                    if (typeof mappers[subItem.split('.')[0]][key][0] === 'object') {
                      // console.log('typeof 1', mappers[subItem.split('.')[0]][key])
                    } else {
                      mappers[subItem.split('.')[0]][key] = [require(`${dir}${mappers[subItem.split('.')[0]][key][0]}`)]
                    }
                  } else if (typeof mappers[subItem.split('.')[0]][key] === 'object') {
                    console.log('typeof 2', mappers[subItem.split('.')[0]][key])
                    // mappers[subItem.split('.')[0]][key]
                  } else {
                    console.log('when does this happen', `${dir}${mappers[subItem.split('.')[0]][key][0]}`)
                    mappers[subItem.split('.')[0]][key] = [require(`${dir}${mappers[subItem.split('.')[0]][key]}`)]
                  }
                } catch (e) {
                  // console.log(e)
                  console.log('key2', `${dir}${mappers[subItem.split('.')[0]][key]}`)
                }
              }
            }
          } catch (e) {
            console.log('Unable to load Mapper', `${dir}${subItem}`)
          }
        })
    }

    return mappers
  }
}
