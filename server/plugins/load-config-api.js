
const Plugin = {}

Plugin.register = async function (server, options) {
  const NextStepGuruDB = server.app.db.nextstepguru.db
  const Config = server.app.db.nextstepguru.models.config
  let SiteConfig = {}

  let siteData = await Config
    .query(NextStepGuruDB)

  for (let i = 0; i < siteData.length; i++) {
    SiteConfig[siteData[i].key] = siteData[i].config
  }

  process.config.siteConfig = SiteConfig
}

Plugin.name = 'load-config-api'

module.exports = Plugin
