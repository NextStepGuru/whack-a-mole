const consola = require('consola')
const HapiNuxt = require('hapi-nuxt')
const StandardAPI = require('./plugins/standard-api.js')
const LoadConfigAPI = require('./plugins/load-config-api.js')
const DB = require('./database/db.js')
const { Server } = require('hapi')
const Boom = require('boom')

const File = require('fs')

const OS = require('os')
const tls = {
  key: File.readFileSync(process.env.NODE_ENV !== 'development' && OS.platform() !== 'win32'
    ? '/etc/letsencrypt/live/nextstep.guru/privkey.pem' : './config/privkey.pem'),
  cert: File.readFileSync(process.env.NODE_ENV !== 'development' && OS.platform() !== 'win32'
    ? '/etc/letsencrypt/live/nextstep.guru/fullchain.pem' : './config/fullchain.pem')
}

async function start () {
  const server = new Server({
    host: process.env.HOST || '0.0.0.0',
    port: process.env.PORT || 3000,
    tls: tls,
    routes: {
      validate: {
        failAction: async (request, h, err) => {
          if (err && err.details && err.details.length && err.details[0].message) {
            return Boom.badRequest(err.details[0].message)
          } else {
            return Boom.badRequest(err)
          }
        }
      }
    }
  })

  server.app.db = DB

  /*
    Register ALL Database Configs
   */
  await server.register({
    plugin: LoadConfigAPI
  })

  /*
    Connect HAPI to Nuxt
   */
  await server.register({
    plugin: HapiNuxt
  })

  /*
    Load Standard API Framework
   */
  await server.register({
    plugin: StandardAPI
  })

  let HapiAuthJwt2 = require('hapi-auth-jwt2')
  HapiAuthJwt2.name = 'hapi-auth-jwt2'
  await server.register(HapiAuthJwt2)

  const jwtFunction = require('../config/jwtConfig.js')(server, DB.nextstepguru.db, DB.nextstepguru.models.user)
  await server.auth.strategy('jwt', 'jwt', jwtFunction)

  /*
    Routes must be loaded after ALL Database Configs
   */
  await server.route(require('./api/index.js'))

  await server.start()

  // running inside pm2
  if ('PM2_HOME' in process.env || 'PM2_JSON_PROCESSING' in process.env || 'PM2_CLI' in process.env) {
    process.send('ready')
  }

  consola.ready({
    message: `Server running at: ${server.info.uri}`,
    badge: true
  })
}

start().catch(console.error)
