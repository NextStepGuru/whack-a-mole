const Joi = require('joi')
const _ = require('lodash')
// const File = require('fs')
// const SiteConfig = require('../../../lib/siteConfig.js')
// const Utilities = require('../../../lib/utilities.js')
// const Config = require('../../../config/index.js')

module.exports = [
  {
    method: ['get'],
    path: '/api/page/list',
    handler: async (request, h) => {
      const NextStepGuruDB = request.server.app.db.nextstepguru.db
      const Page = request.server.app.db.nextstepguru.models.page
      const PageFolder = request.server.app.db.nextstepguru.models.pageFolder
      const PageType = request.server.app.db.nextstepguru.models.pageType

      let pageList = await Page
        .query(NextStepGuruDB)
        .where({
          isActive: 1
        })
        .andWhere('pageTypeId', request.query.pageTypeId === '0' ? '!=' : '=', 3)
        .orderBy('name')
        .eager('[type, folder]')

      let folderList = await PageFolder
        .query(NextStepGuruDB)
        .orderBy('name')

      let typeList = await PageType
        .query(NextStepGuruDB)
        .where('id', request.query.pageTypeId === '0' ? '!=' : '=', 3)
        .orderBy('name')

      return {
        pages: pageList,
        folders: folderList,
        types: typeList
      }
    },
    options: {
      auth: {
        strategy: 'jwt',
        access: [{
          scope: ['super-user']
        }]
      }
    }
  },
  {
    method: ['get'],
    path: '/api/page/test',
    handler: async (request, h) => {
      const NextStepGuruDB = request.server.app.db.nextstepguru.db
      const EmailTemplate = request.server.app.db.nextstepguru.models.emailTemplate

      return {}
    },
    options: {
      auth: {
        strategy: 'jwt',
        access: [{
          scope: ['super-user']
        }]
      }
    }
  },
  {
    method: 'post',
    path: '/api/page',
    handler: async (request, h) => {
      const NextStepGuruDB = request.server.app.db.nextstepguru.db
      const Page = request.server.app.db.nextstepguru.models.page

      let pageData = await Page
        .query(NextStepGuruDB)
        .where({
          path: request.payload.path
        })
        .eager('[type]')
        .first()

      return pageData ? {
        content: pageData.originalContent,
        pageHeading: pageData.pageHeading,
        head: {
          title: pageData.metaTitle,
          meta: [
            { hid: 'description', name: 'description', content: pageData.metaDescription },
            { hid: 'keywords', name: 'keywords', content: pageData.metaKeywords }
          ],
          link: [],
          script: []
        }
      } : {
        content: null,
        pageHeading: null,
        head: {
          meta: [],
          link: [],
          script: []
        }
      }
    }
  },
  {
    method: 'post',
    path: '/api/page/auth',
    handler: async (request, h) => {
      const NextStepGuruDB = request.server.app.db.nextstepguru.db
      const Page = request.server.app.db.nextstepguru.models.page

      let pageData = await Page
        .query(NextStepGuruDB)
        .where({
          path: request.payload.path
        })
        .eager('[type]')
        .first()

      if (_.isNil(pageData) && request.auth.credentials.scope.indexOf('super-user') !== -1) {
        try {
          let slugs = request.payload.path.split('/')
          pageData = await Page
            .query(NextStepGuruDB)
            .insertAndFetch({
              isActive: 1,
              pageTypeId: slugs.indexOf('blog') ? 3 : 1,
              name: request.payload.path,
              path: request.payload.path,
              metaTitle: request.payload.path
            })
        } catch (e) {
          pageData = await Page
            .query(NextStepGuruDB)
            .where({
              path: request.payload.path
            })
            .eager('[type]')
            .first()
        }
      }

      return pageData ? {
        title: pageData.metaTitle,
        content: pageData.originalContent,
        pageHeading: pageData.pageHeading,
        head: {
          meta: [
            { hid: 'description', name: 'description', content: pageData.metaDescription },
            { hid: 'keywords', name: 'keywords', content: pageData.metaKeywords }
          ]
        }
      } : {
        title: null,
        content: null,
        pageHeading: null,
        head: {
          meta: []
        }
      }
    },
    options: {
      auth: {
        strategy: 'jwt'
      }
    }
  },
  {
    method: ['post'],
    path: '/api/page/save',
    handler: async (request, h) => {
      const NextStepGuruDB = request.server.app.db.nextstepguru.db
      const Page = request.server.app.db.nextstepguru.models.page

      let page = null

      if (request.payload.id) {
        page = await Page
          .query(NextStepGuruDB)
          .where({
            id: request.payload.id
          })
          .eager('[type]')
          .first()
      } else {
        page = new Page(request.payload)
      }

      page = _.merge(page, request.payload)

      if (page.originalContent !== page.pendingContent && request.payload.isPublished) {
        page.publishedAt = new Date()
      }

      if (request.payload.isPublished) {
        page.originalContent = page.pendingContent
        page.lastPublishedAt = new Date()
        page.publishedAt = null

        page.originalContent = page.originalContent.replace(/<(figure|figcaption).+?">/gm, '').replace(/<\/?(figure|figcaption)>/gm, '')
      }

      do {
        let checkPageTitle = await Page
          .query(NextStepGuruDB)
          .where('id', '!=', request.payload.id)
          .where({
            path: page.path
          })
          .first()

        if (!_.isNil(checkPageTitle)) {
          page.path = `${page.path}_${new Date().getTime()}`
        } else {
          break
        }
      } while (true)


      // delete keys before save
      delete page.type
      delete page.folder
      delete page.isPublished
      delete page.isBlog
      if (page.id === 0) {
        delete page.id
      }

      page = await Page
        .query(NextStepGuruDB)
        .upsertGraphAndFetch(page, {
          noDelete: true
        })
        .eager('[type]')

      return page
    },
    options: {
      validate: {
        options: {
          allowUnknown: true
        },
        payload: {
          id: Joi.number().required()
        }
      },
      auth: {
        strategy: 'jwt',
        access: [{
          scope: ['super-user']
        }]
      }
    }
  }
]
