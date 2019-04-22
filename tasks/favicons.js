const File = require('fs')
const pkg = require('../package')
const favicons = require('favicons')
const source = '../static/mark.png'

const configuration = {
  path: '/', // Path for overriding default icons path. `string`
  appName: pkg.appName, // Your application's name. `string`
  appShortName: pkg.shortName, // Your application's short_name. `string`. Optional. If not set, appName will be used
  appDescription: pkg.description, // Your application's description. `string`
  developerName: pkg.author, // Your (or your developer's) name. `string`
  developerURL: pkg.authorUrl, // Your (or your developer's) URL. `string`
  dir: 'auto', // Primary text direction for name, short_name, and description
  lang: 'en-US', // Primary language for name and short_name
  background: '#fff', // Background colour for flattened icons. `string`
  theme_color: '#fff', // Theme color user for example in Android's task switcher. `string`
  appleStatusBarStyle: 'black-translucent', // Style for Apple status bar: "black-translucent", "default", "black". `string`
  display: 'standalone', // Preferred display mode: "fullscreen", "standalone", "minimal-ui" or "browser". `string`
  orientation: 'any', // Default orientation: "any", "natural", "portrait" or "landscape". `string`
  scope: '/', // set of URLs that the browser considers within your app
  start_url: '/', // Start URL when launching the application from a device. `string`
  version: pkg.version, // Your application's version string. `string`
  logging: false, // Print logs to console? `boolean`
  pixel_art: false, // Keeps pixels "sharp" when scaling up, for pixel art.  Only supported in offline mode.
  loadManifestWithCredentials: false, // Browsers don't send cookies when fetching a manifest, enable this to fix that. `boolean`
  icons: {
    // Platform Options:
    // - offset - offset in percentage
    // - background:
    //   * false - use default
    //   * true - force use default, e.g. set background for Android icons
    //   * color - set background for the specified icons
    //   * mask - apply mask in order to create circle icon (applied by default for firefox). `boolean`
    //   * overlayGlow - apply glow effect after mask has been applied (applied by default for firefox). `boolean`
    //   * overlayShadow - apply drop shadow after mask has been applied .`boolean`
    //
    android: true, // Create Android homescreen icon. `boolean` or `{ offset, background, mask, overlayGlow, overlayShadow }`
    appleIcon: true, // Create Apple touch icons. `boolean` or `{ offset, background, mask, overlayGlow, overlayShadow }`
    appleStartup: true, // Create Apple startup images. `boolean` or `{ offset, background, mask, overlayGlow, overlayShadow }`
    coast: true, // Create Opera Coast icon. `boolean` or `{ offset, background, mask, overlayGlow, overlayShadow }`
    favicons: true, // Create regular favicons. `boolean` or `{ offset, background, mask, overlayGlow, overlayShadow }`
    firefox: true, // Create Firefox OS icons. `boolean` or `{ offset, background, mask, overlayGlow, overlayShadow }`
    windows: true, // Create Windows 8 tile icons. `boolean` or `{ offset, background, mask, overlayGlow, overlayShadow }`
    yandex: true // Create Yandex browser icon. `boolean` or `{ offset, background, mask, overlayGlow, overlayShadow }`
  }
}


const callback = async function (error, response) {
  if (error) {
    console.log(error.message) // Error description e.g. "An unknown error has occurred"
    return
  }
  for (let i = 0; i < response.images.length; i++) {
    File.writeFileSync(`../static/${response.images[i].name}`, response.images[i].contents)
  }
  for (let i = 0; i < response.files.length; i++) {
    File.writeFileSync(`../static/${response.files[i].name}`, response.files[i].contents)
  }

  const regex = /(\S+)=["']?((?:.(?!["']?\s+(?:\S+)=|[>"']))+.)["']?/gm

  let metaArr = []
  let linkArr = []

  for (let i = 0; i < response.html.length; i++) {
    let thisItem = {}
    const str = response.html[i]
    let m

    while ((m = regex.exec(str)) !== null) {
      // This is necessary to avoid infinite loops with zero-width matches
      if (m.index === regex.lastIndex) {
        regex.lastIndex++
      }

      thisItem[m[1]] = m[2]

      if (str.indexOf('<link') !== -1) {
        if (linkArr.indexOf(thisItem) === -1) {
          linkArr.push(thisItem)
        }
      } else if (str.indexOf('<meta') !== -1) {
        if (metaArr.indexOf(thisItem) === -1) {
          metaArr.push(thisItem)
        }
      }
    }
  }

  File.writeFileSync(`../static/nuxt.json`, JSON.stringify({
    meta: metaArr,
    link: linkArr
  }))
}

favicons(source, configuration, callback)
