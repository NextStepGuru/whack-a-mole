const Moment = require('moment')
const fs = require('fs')
// const utils = require('../plugins/utils.js')

let routes = []

fs.readdirSync(__dirname)
  .filter(file => file !== 'index.js')
  .forEach(file => {
    routes = routes.concat(require(`./${file}`))
  })

routes.push({
  method: 'options',
  path: '/{p*}',
  handler: function (request, h) {
    return 'success'
  }
})

routes.push({
  method: 'get',
  path: '/sitemap.xml',
  handler: async (request, h) => {
    if (request.method === 'options') {
      return 'success'
    }
    const NextStepGuruDB = request.server.app.db.nextstepguru.db
    const Page = request.server.app.db.nextstepguru.models.page

    let getPages = await Page
      .query(NextStepGuruDB)
      .where({
        isInSitemap: 1
      })
      .whereNotNull('lastPublishedAt')
      .whereNot({
        path: '/'
      })

    let results = []

    for (let i = 0; i < getPages.length; i++) {
      results.push(`
        <url>
          <loc>https://www.nextstepguru.com${getPages[i].path}</loc>
          <lastmod>${Moment(getPages[i].lastPublishedAt).format('YYYY-MM-DDTHH:mm:ssZ')}</lastmod>
          <xhtml:link
             rel="alternate" hreflang="en-us"
             href="https://www.nextstepguru.com${getPages[i].path}"/>
        </url>
      `)
    }

    const response = h
      .response(`<?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
          xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
          xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"
          xmlns:xhtml="http://www.w3.org/1999/xhtml">
          <url>
            <loc>https://www.nextstepguru.com/</loc>
            <lastmod>${Moment().format('YYYY-MM-DDTHH:mm:ssZ')}</lastmod>
            <xhtml:link
               rel="alternate" hreflang="en-us"
               href="https://www.nextstepguru.com/"/>
            <image:image>
               <image:loc>https://res.cloudinary.com/nextstepguru/image/upload/s--H9BlFJ6K--/c_scale,w_1024/v1550678366/GuidedSteps_Mark_Logo.png</image:loc>
               <image:title>Guided Steps Logo and Mark</image:title>
            </image:image>
          </url>
          ${results.join(' ')}
        </urlset>`)
      .type('application/xml')
      .code(200)
    /*
      https://blog.spotibo.com/sitemap-guide/
      <video:video>
        <video:thumbnail_loc>http://example.com/thumb1.jpg
        </video: thumbnail_loc>
        <video:title>A clown in the garden</video:title>
        <video:description>Crazy clown is riding a rabbit.</video:description>
        <video:content_loc>http://www.example.com/video1.mp4</video:content_loc>
        <video:player_loc autoplay="ap=1"> http://www.example.com/videoplayer.mp4?video=123</video:player_loc>
        <video:duration>600</video:duration>
        <video:expiration_date>2018-11-05T15:20:30+08:00</video:expiration_date>
        <video:rating>3.7</video:rating>
        <video:view_count>54321</video:view_count>
        <video:publication_date>2017-11-05T15:20:30+08:00</video:publication_date>
        <video:family_friendly>yes</video:family_friendly>
        <video:restriction relationship="deny">GB USCA </video:restriction>
        <video:requires_subscription>no</video:requires_subscription>
        <video:live>no</video:live>
      </video:video>
    */

    return response
  }
})

routes.push({
  method: 'get',
  path: '/robots.txt',
  handler: function (request, h) {
    if (request.method === 'options') {
      return 'success'
    }

    const response = h
      .response(`User-agent: *\nDisallow: /`)
      .type('text/plain')
      .code(200)

    return response
  }
})

// Handle Catch ALL for Errors
routes.push({
  method: ['get', 'post', 'put', 'delete', 'patch'],
  path: '/api/{p*}',
  handler: function (request, h) {
    if (request.method === 'options') {
      return 'success'
    }

    return h.response({
      error: 'The required API end-point is not available'
    })
      .code(404)
  }
})

module.exports = routes
