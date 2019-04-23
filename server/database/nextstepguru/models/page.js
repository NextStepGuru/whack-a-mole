'use strict'

const Model = require('./base.js')

class Page extends Model {
  static get tableName () {
    return 'page'
  }

  static get namedFilters () {
    return {
      is: (builder) => {
        builder
          .where('id', 0)
      }
    }
  }

  static get relationMappings () {
    return {
      type: {
        relation: Model.HasOneRelation,
        modelClass: require('./pageType.js'),
        join: {
          from: 'page.pageTypeId',
          to: 'pageType.id'
        }
      },
      folder: {
        relation: Model.HasOneRelation,
        modelClass: require('./pageFolder.js'),
        join: {
          from: 'page.pageFolderId',
          to: 'pageFolder.id'
        }
      }
    }
  }

  get $schema () {
    return {}
  }
}

module.exports = Page
