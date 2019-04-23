const Joi = require('joi')
const _ = require('lodash')
const Boom = require('boom')
const Bcrypt = require('bcryptjs')
const uuid = require('uuid/v5')
const Config = require('../../../config/index.js')
const Jwt = require('jsonwebtoken')
const SiteConfig = require('../../../lib/siteConfig.js')
const PostmarkApp = require('postmark')
const PostmarkClient = new PostmarkApp.ServerClient(SiteConfig.postmarkapp.serverToken)

module.exports = [
  {
    method: ['get'],
    path: '/api/login',
    handler: async (request, h) => {
      const NextStepGuruDB = request.server.app.db.nextstepguru.db
      const User = request.server.app.db.nextstepguru.models.user
      let response = {}

      let user = await User
        .query(NextStepGuruDB)
        .where({
          id: request.auth.credentials.id
        })
        .first()
      console.log('test')
      const jwtToken = await Jwt.sign({
        id: user.id
      }, Config.JWT_API_SECRET, {
        algorithm: 'HS512',
        expiresIn: '1y'
      })

      response = user
      response.token = jwtToken

      return Utilities.loginResponse(h, response, jwtToken)
    },
    options: {
      auth: {
        strategy: 'jwt',
        access: [{
          scope: ['user']
        }]
      }
    }
  },
  {
    method: ['post'],
    path: '/api/login',
    handler: async (request, h) => {
      const NextStepGuruDB = request.server.app.db.nextstepguru.db
      const EmailTemplate = request.server.app.db.nextstepguru.models.emailTemplate
      const User = request.server.app.db.nextstepguru.models.user

      let response = {}
      let user = new User(request.payload)


      let checkUser = await User
        .query(NextStepGuruDB)
        .where({
          email: user.email
        })
        .first()

      if (checkUser !== undefined) {
        return Boom.badData(new Error('User already exists'))
      }

      try {
        user.password = Utilities.encryptPassword(request.payload.password)

        user = await User
          .query(NextStepGuruDB)
          .upsertGraphAndFetch(user)

        response = user

        const jwtToken = await Jwt.sign({
          id: user.id
        }, Config.JWT_API_SECRET, {
          algorithm: 'HS512',
          expiresIn: '1y'
        })

        response.token = jwtToken

        try {
          const SignupTemplate = await EmailTemplate
            .query(NextStepGuruDB)
            .where({
              emailTypeId: 4
            })
            .first()

          let emailResult = await PostmarkClient.sendEmailWithTemplate({
            TemplateId: SignupTemplate.config.TemplateId,
            From: SiteConfig.nextstepguru.email.from,
            To: user.email,
            TemplateModel: {
              user: user
            }
          })

          console.log('emailSent', emailResult)
        } catch (e) {}

        return Utilities.loginResponse(h, response, jwtToken)
      } catch (err) {
        return Boom.badData(err)
      }
    },
    options: {
      validate: {
        options: {
          allowUnknown: true
        },
        payload: {
          firstName: Joi.string().required().label('First Name'),
          lastName: Joi.string().required().label('Last Name'),
          email: Joi.string().email().required().label('Email Address'),
          password: Joi.string().required().min(6).label('Password')
        }
      }
    }
  },
  {
    method: ['post'],
    path: '/api/login/verify',
    handler: async (request, h) => {
      const NextStepGuruDB = request.server.app.db.nextstepguru.db
      const User = request.server.app.db.nextstepguru.models.user

      let user = await User
        .query(NextStepGuruDB)
        .where({
          email: request.payload.email
        })
        .first()

      if (_.isNil(user)) {
        return Boom.forbidden('User is not found')
      }

      if (!Utilities.comparePasswords(user.password, request.payload.password)) {
        return Boom.forbidden('Invalid Email/Password Combination')
      }

      const jwtToken = await Jwt.sign({
        id: user.id
      }, Config.JWT_API_SECRET, {
        algorithm: 'HS512',
        expiresIn: '1y'
      })

      user.token = jwtToken

      return Utilities.loginResponse(h, user, jwtToken)
    },
    options: {
      validate: {
        options: {
          allowUnknown: true
        },
        payload: {
          email: Joi.string().email().required().label('Email Address'),
          password: Joi.string().required().label('Password').min(6)
        }
      }
    }
  },
  {
    method: ['post'],
    path: '/api/login/lostPassword',
    handler: async (request, h) => {
      const NextStepGuruDB = request.server.app.db.nextstepguru.db
      const EmailTemplate = request.server.app.db.nextstepguru.models.emailTemplate
      const User = request.server.app.db.nextstepguru.models.user

      let response = [`If your account was located, we will send an email to ${request.payload.email}.`]

      let user = await User
        .query(NextStepGuruDB)
        .where({
          email: request.payload.email
        })
        .first()

      if (user) {
        user.passwordResetRequestedAt = new Date()
        user.passwordResetToken = uuid(`${new Date().getTime()}`, SiteConfig.nextstepguru.server.uuidToken).replace(/-/g, '')

        user = await User
          .query(NextStepGuruDB)
          .upsertGraphAndFetch(user)

        const LostPasswordTemplate = await EmailTemplate
          .query(NextStepGuruDB)
          .where({
            emailTypeId: 9
          })
          .first()

        await PostmarkClient.sendEmailWithTemplate({
          TemplateId: LostPasswordTemplate.config.TemplateId,
          From: SiteConfig.nextstepguru.email.from,
          To: user.email,
          TemplateModel: {
            user: user,
            actionUrl: `${SiteConfig.nextstepguru.baseURL}/login/reset/${user.uuid}/${user.passwordResetToken}`
          }
        })
        // console.debug('emailSent', emailResult)
      }

      return response
    },
    options: {
      validate: {
        options: {
          allowUnknown: true
        },
        payload: Joi.object({
          email: Joi.string().email().required().label('Email Address') // .message('A valid email address is required to recovery your account')
        })
      }
    }
  },
  {
    method: ['post'],
    path: '/api/login/resetPassword',
    handler: async (request, h) => {
      const NextStepGuruDB = request.server.app.db.nextstepguru.db
      const EmailTemplate = request.server.app.db.nextstepguru.models.emailTemplate
      const User = request.server.app.db.nextstepguru.models.user

      let user = await User
        .query(NextStepGuruDB)
        .where({
          uuid: request.payload.uuid,
          passwordResetToken: request.payload.token
        })
        .first()

      if (_.isNil(user)) {
        return Boom.forbidden('Your reset token has expired or you already reset your password.')
      }

      user.password = Utilities.encryptPassword(request.payload.password)
      user.passwordResetAt = new Date()
      user.uuid = uuid(`${new Date().getTime()}-uuid`, SiteConfig.nextstepguru.server.uuidToken).replace(/-/g, '')
      user.passwordResetToken = uuid(`${new Date().getTime()}-passwordResetToken`, SiteConfig.nextstepguru.server.uuidToken).replace(/-/g, '')

      user = await User
        .query(NextStepGuruDB)
        .upsertGraphAndFetch(user)

      const jwtToken = await Jwt.sign({
        id: user.id
      }, Config.JWT_API_SECRET, {
        algorithm: 'HS512',
        expiresIn: '1y'
      })

      const ResetEmailConfirmationTemplate = await EmailTemplate
        .query(NextStepGuruDB)
        .where({
          emailTypeId: 14
        })
        .first()

      let emailResult = await PostmarkClient.sendEmailWithTemplate({
        TemplateId: ResetEmailConfirmationTemplate.config.TemplateId,
        From: SiteConfig.nextstepguru.email.from,
        To: user.email,
        TemplateModel: {
          user: user
        }
      })
      console.log('emailSent', emailResult)

      user.token = jwtToken


      return Utilities.loginResponse(h, user, jwtToken)
    },
    options: {
      validate: {
        options: {
          allowUnknown: true
        },
        payload: {
          token: Joi.string().required(),
          uuid: Joi.string().required(),
          password: Joi.string().required().min(6).label('Password')
        }
      }
    }
  }
]

const Utilities = {
  comparePasswords (passwordOld, passwordNew) {
    return Bcrypt.compareSync(passwordNew, passwordOld)
  },
  encryptPassword (password) {
    const salt = Bcrypt.genSaltSync(12)

    let thisPassword = password

    thisPassword = Bcrypt.hashSync(thisPassword, salt)

    return thisPassword
  },
  loginResponse (h, response, token) {
    return h.response(response)
      .header('Authorization', token)
      .state('jwt', token, {
        ttl: 365 * 24 * 60 * 60 * 1000, // expires a year from today
        encoding: 'none', // we already used JWT to encode
        isSecure: true, // warm & fuzzy feelings
        isHttpOnly: true, // prevent client alteration
        clearInvalid: true, // remove invalid cookies
        domain: '.nextstep.guru',
        strictHeader: false, // don't allow violations of RFC 6265
        path: '/'
      })
  }
}
