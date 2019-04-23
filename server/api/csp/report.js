// const Config = require('../../../config/index.js')

module.exports = [
  {
    method: ['get', 'post'],
    path: '/api/csp/report',
    handler: async (request, h) => {
      console.log('CSP-Report', request.payload)
      return {
        success: true
      }
    },
    options: {
    }
  }
]
