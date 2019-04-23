const os = require('os')
let maxPoolThreads = 10
if (process.env.NODE_ENV === 'production') {
  maxPoolThreads = 50
  console.log(`Database Max Pool Threads set to ${maxPoolThreads} in production`)
} else if (process.env.NODE_ENV === 'sandbox') {
  maxPoolThreads = 10
  // console.log(`Database Max Pool Threads set to ${maxPoolThreads} in sandbox`)
}

// console.log(`Database Config:`, process.argv)
var connectionErrorHandler = function (connection, err) {
  if (connection && err && err.fatal) {
    if (connection.removedFromThePool) {
      return
    }

    connection.removedFromThePool = true
  }
}

const nextstepguru = {
  client: 'mysql',
  connection: {
    host: '66.228.63.64',
    port: 6033,
    user: 'nextstepguru',
    password: 'nextstepguruapi',
    database: 'nextstepguru',
    timezone: 'UTC'
  },
  pool: {
    min: 0,
    max: maxPoolThreads
  }
}

let exportDatabases = {}

if (os.platform() === 'win32') {
  exportDatabases = { nextstepguru }
} else {
  exportDatabases = { nextstepguru }
}

module.exports = exportDatabases
