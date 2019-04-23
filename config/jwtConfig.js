const Config = require('./index.js')
module.exports = (Server, Database, User) => {
  return {
    key: Config.JWT_API_SECRET,
    validate: async function (decoded, request, h) {
      try {
        let user = await User
          .query(Database)
          .where({
            id: decoded.id
          })
          .first()

        if (user) {
          user.scope = user.config.roles

          return { isValid: true, credentials: user, h: h }
        } else {
          return { isValid: false }
        }
      } catch (e) {
        console.log('[JWT VALIDATION FUNCTION ERROR]', e)
        return { isValid: true }
      }
    },
    verifyOptions: { algorithms: [ 'HS512' ] }
  }
}
