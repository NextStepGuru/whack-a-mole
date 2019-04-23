const Plugin = {}
const Boom = require('boom')
const { isArray, last, indexOf } = require('lodash')
const os = require('os')
// const Raven = require('raven')
// const jsonSize = require('json-size')
const SitePackageJSON = require('../../package.json')

const isDevelopment = process.env.NODE_ENV === 'development'
const isSandbox = process.env.NODE_ENV === 'sandbox'
const isLabTest = process.env.npm_lifecycle_script && process.env.npm_lifecycle_script[0] === 'l'

Plugin.register = async function (server, options) {
  /*
  Raven
    .config('https://f50c37f107a14ece9de7ac75b33defd4@sentry.io/1286351', {
      release: process.env.npm_package_version,
      environment: process.env.NODE_ENV,
      autoBreadcrumbs: true,
      captureUnhandledRejections: !isSandbox,
      maxBreadcrumbs: 100,
      shouldSendCallback: (data) => {
        return !isDevelopment
      },
      dataCallback: (data) => {
        // Nasty Size Check - Improve this
        if (jsonSize(data.extra.propsData) > 100000) {
          delete data.extra.propsData
        }
        return data
      }
    })
    .install((err, initialErr, eventId) => {
      console.error(err)
      process.exit(0)
    })
  server.expose('client', Raven)
  server.app.raven = Raven
  */
  server.ext({
    type: 'onRequest',
    method: (request, h) => {
      if (request.headers['content-type'] === 'application/csp-report') {
        request.headers['content-type'] = 'application/json'
        request.headers['x-content-type'] = 'application/csp-report'
      }

      return h.continue
    }
  })

  server.events.on({
    name: 'request',
    channels: 'error'
  }, (request, event, tags) => {
    const requestHeaders = request.headers
    const baseUrl = request.info.uri || (request.info.host && `${server.info.protocol}://${request.info.host}`) || server.info.uri
    const sessionUrl = 'x-session' in requestHeaders ? requestHeaders['x-session'] : ''
    if ((isDevelopment || isSandbox) && !isLabTest) { console.log('Hapi Non-Boom Error', event.error) }
    let req = {
      headers: request.headers,
      method: request.method,
      host: request.info.host,
      protocol: server.info.protocol,
      url: !request.path.includes(baseUrl) ? request.path : baseUrl + request.path,
      query: request.query,
      cookies: request.state,
      body: {
        params: request.params,
        info: request.info
      },
      ip: request.info.remoteAddress
    }
    let extra = {
      timestamp: request.info.received,
      id: request.id,
      remoteAddress: request.info.remoteAddress,
      sessionURL: sessionUrl,
      logs: request.logs,
      payload: request.payload
    }
    let defaultTags = {
      'api_route': request.route.fingerprint
    }
    let fingerprint = ''
    if ('extra' in request.app) {
      Object.assign(extra, request.app.extra)
    }
    if ('req' in request.app) {
      Object.assign(req, request.app.req)
    }
    if ('tags' in request.app) {
      Object.assign(defaultTags, request.app.tags)
    }
    Object.assign(defaultTags, tags)
    if ('fingerprint' in request.app) {
      fingerprint = request.app.fingerprint
    }
    if (!isSandbox) {
      /*
      server.app.raven.captureException(event.error, {
        req,
        extra,
        defaultTags,
        ...fingerprint.length && { fingerprint: request.route.fingerprint }
      }, (sendErr, eventId) => {
        if ((isDevelopment || isSandbox) && !isLabTest) {
          console.log('Send Log:', `Error: ${sendErr}`, `ID: ${eventId}`)
        }
      })
      */
    }
  })

  server.ext('onPreHandler', function (request, h) {
    if (!isLabTest && request.url && request.url.path) {
      let ext = last(request.url.path.split('.'))
      if (indexOf(['png', 'js', 'json', 'ico'], ext) === -1 && request.url.path !== '/__webpack_hmr/client' && request.url.path !== '/_loading/ws') {
        console.log('API: ', `${request.method}:${request.url.path}`)
      }
    }
    if ((request.method === 'post' || request.method === 'patch' || request.method === 'put') && request.payload === null) {
      return Boom.badRequest(`Payload is Required for ${request.method} METHOD`)
    }

    request.startTick = new Date().getTime()
    return h.continue
  })

  server.ext('onPreResponse', function (request, h) {
    const res = request.response
    let originalBody = request.response.source
    let responseType = res.headers && res.headers['content-type'] ? res.headers['content-type'] : 'application/json'
    let responseStatusCode = res.statusCode
    let requestHeaders = request.headers
    let responseBody = {
      error: [],
      code: 200,
      statusCode: 200,
      message: [],
      data: null,
      timestamp: request.info.received,
      execTimeMS: new Date().getTime() - request.startTick,
      apiVersion: SitePackageJSON.version
    }

    if (res.isBoom) {
      var err = request.response
      responseStatusCode = err.output.statusCode
      responseBody.code = err.output.payload.statusCode
      responseBody.statusCode = err.output.payload.statusCode
      responseBody.error.push((err.err || err.message || err))
      if (os.platform() === 'win32') {
        responseBody.error.push.apply(responseBody.error, err.stack.split('\n'))
      }
      if (err.sqlMessage) {
        responseBody.message.push(err.sqlMessage)
      } else if (err.message) {
        responseBody.message.push(err.message)
      }
      const baseUrl = request.info.uri || (request.info.host && `${server.info.protocol}://${request.info.host}`) || server.info.uri
      const sessionUrl = 'x-session' in requestHeaders ? requestHeaders['x-session'] : ''
      // Breadcrumbs - more to learn if even necessary on this side
      // server.app.raven.context(() => {
      //   server.app.raven.captureBreadcrumb({
      //     message: `Test`,
      //     category: 'Category One',
      //     data: {
      //       started: request.info.received
      //     }
      //   })
      //   // errors thrown here will have breadcrumb attached
      // })
      if ((isDevelopment || isSandbox) && !isLabTest) { console.log('Hapi Boom Error', err) }
      let req = {
        headers: request.headers,
        method: request.method,
        host: request.info.host,
        protocol: server.info.protocol,
        url: !request.path.includes(baseUrl) ? request.path : baseUrl + request.path,
        query: request.query,
        cookies: request.state,
        body: {
          params: request.params,
          info: request.info
        },
        ip: request.info.remoteAddress
      }
      let extra = {
        errors: responseBody.error,
        messages: responseBody.message,
        timestamp: request.info.received,
        id: request.id,
        remoteAddress: request.info.remoteAddress,
        sessionURL: sessionUrl,
        logs: request.logs,
        payload: request.payload
      }
      let tags = {
        'api_route': request.route.fingerprint
      }
      let fingerprint = ''
      if ('extra' in request.app) {
        Object.assign(extra, request.app.extra)
      }
      if ('req' in request.app) {
        Object.assign(req, request.app.req)
      }
      if ('tags' in request.app) {
        Object.assign(tags, request.app.tags)
      }
      if ('fingerprint' in request.app) {
        fingerprint = request.app.fingerprint
      }
      if (!isSandbox) {
        /*
          server.app.raven.captureMessage(responseBody.message[0], {
            req,
            extra,
            tags,
            ...fingerprint.length && { fingerprint: request.route.fingerprint }
          }, (sendErr, eventId) => {
            if ((isDevelopment || isSandbox) && !isLabTest) { console.log('Send Log:', `Error: ${sendErr}`, `ID: ${eventId}`) }
          })
        */
      }
    } else if (request.method !== 'options') {
      try {
        // convert only for bookshelf
        originalBody = originalBody.toJSON()
        if (originalBody[1] !== undefined && originalBody[1][0] !== undefined && originalBody[1][0]['catalog'] === 'def') {
          originalBody = originalBody[0]
        }
      } catch (err) {}

      try {
        if (originalBody.length === undefined) {
          originalBody = [originalBody]
        }
        responseBody.data = originalBody

        if (requestHeaders['X-Response-Format']) {
          switch (requestHeaders['X-Response-Format']) {
            case 'array':
              responseBody.data = JSON.parse(JSON.stringify(responseBody.data))

              responseBody.headers = Object.keys(isArray(responseBody.data[0]) ? responseBody.data[0][0] : responseBody.data[0])
              responseBody.data = responseBody.data.map(function (obj) {
                return Object.keys(obj).map(function (key) {
                  return obj[key]
                })
              })

              break
            default:
              // do nothing
          }
        }
      } catch (err) {}
    }

    if (responseType === 'text/html' || request.url.path === '/stats') {
      const response = h
        .response(responseBody.data)
        .type('text/html')
        .code(responseStatusCode)
      return response
    }
    if (request.response.headers && request.response.headers['content-type']) {
      responseType = request.response.headers['content-type']
    }
    if (responseType === 'application/xml') {
      responseBody = responseBody.data
    }

    const response = h
      .response(responseBody)
      .type(responseType)
      .code(responseStatusCode)
      .header('Cache-Control', 'no-cache')
      .header('Access-Control-Allow-Origin', '*')
      .header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
      .header('Access-Control-Allow-Headers', 'Authorization,DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,X-Response-Format,X-Account-Id,X-User-Id,X-Session,X-Channel-Id')

    for (let header in request.response.headers) {
      response.header(header, request.response.headers[header])
    }

    return response
  })
}

Plugin.name = 'standard-api'

module.exports = Plugin
