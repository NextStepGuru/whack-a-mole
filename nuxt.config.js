const pkg = require('./package')
const FavIconConfig = require('./static/nuxt.json')

module.exports = {
  mode: 'spa',
  head: {
    title: "Whack-a-mole Demo",
    meta: [
      { charset: 'utf-8' },
      { name: 'mobile-web-app-capable', content: 'yes' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: pkg.description },
      ...FavIconConfig.meta
    ],
    link: [
      ...FavIconConfig.link
    ]
  },

  /*
   ** Customize the progress-bar color
   */
  loading: { color: '#fff' },

  router: {
    middleware: 'auth',
    scrollBehavior: function (to, from, savedPosition) {
      return { x: 0, y: 0 }
    }
  },
  css: [],
  plugins: [
    '~/plugins/nextstepguru',
    '~/plugins/axios'
  ],
  fontawesome: {
    component: 'fa',
    includeCss: false,
    imports: [
      {
        set: '@fortawesome/pro-light-svg-icons',
        icons: ['faTasks', 'faSearch', 'faBars', 'faCrosshairs', 'faBrowser', 'faSearchLocation', 'faFilePlus', 'faDraftingCompass', 'faPray', 'faCommentAlt', 'faComment', 'faArrowToLeft', 'faArrowToRight', 'faBan', 'faBold', 'faBooks', 'faCode', 'faCogs', 'faEdit', 'faExclamationTriangle', 'faFileAlt', 'faFileEdit', 'faFingerprint', 'faHeading', 'faHome', 'faImages', 'faItalic', 'faLink', 'faListOl', 'faListUl', 'faMailBulk', 'faQuoteRight', 'faRssSquare', 'faSave', 'faSignOut', 'faSignIn', 'faStrikethrough', 'faTrashAlt', 'faUnderline', 'faUpload', 'faUserPlus', 'faUsers', 'faUserAlt', 'faTrafficLightGo', 'faToolbox', 'faBells', 'faTachometer', 'faCampground', 'faAngleDoubleDown', 'faAngleDoubleUp', 'faCheck', 'faPlayCircle', 'faArrowRight', 'faArrowLeft', 'faIdCard', 'faStethoscope', 'faTombstone', 'faTheaterMasks', 'faBible', 'faFilePdf', 'faDownload', 'faFileVideo', 'faFile', 'faFileSpreadsheet', 'faFileInvoice', 'faFileCode', 'faFileAudio', 'faFileArchive']
      }
    ]
  },
  modules: [
    '@nuxtjs/axios',
    '@nuxtjs/style-resources',
    'nuxt-fontawesome',
    'cookie-universal-nuxt',
    'nuxt-buefy',
    '@nuxtjs/pwa'
  ],
  axios: {
    // See https://github.com/nuxt-community/axios-module#options
  },
  build: {
    /*
     ** You can extend webpack config here
     */
    extend(config, ctx) {
      // Run ESLint on save
      if (ctx.isDev && ctx.isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }
    }
  }
}
