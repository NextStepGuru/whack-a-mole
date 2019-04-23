// import { version } from '../package.json'
export default function ({ $axios, redirect, app }) {
  $axios.setHeader('Content-Type', 'application/json', ['put', 'post', 'patch', 'delete', 'get'])
  $axios.setHeader('Accept', 'application/json', ['put', 'post', 'patch', 'delete', 'get'])


  $axios.onRequest(config => {
  })

  $axios.onResponse(response => {
    if (response && !response.statusCode && response.status) {
      response.statusCode = +response.status
    }
    return response
  })

  $axios.onError(err => {
    if (err && err.response && !err.response.statusCode && err.response.status) {
      err.response.statusCode = +err.response.status
    }
    return err.response
  })

  $axios.onResponseError(err => {
    try {
      if (err && err.response && !err.response.statusCode && err.response.status) {
        err.response.statusCode = +err.response.status
      }
      return err.response
    } catch (e) {
      return {
        status: 500,
        statusCode: 500
      }
    }
  })
}
