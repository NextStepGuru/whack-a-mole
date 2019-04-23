<template lang="pug">
  form.form(@submit.prevent="", action="/login", name="accountSignin")
    .columns.is-desktop
      .column.is-6.is-offset-3
        h3.title.is-size-4
          span.icon
            fa(:icon="['fal', 'fingerprint']")
          span  Reset Password
        .message.has-text-left.is-primary
          .message-header Fill out the form below to reset your password.
          .message-body
            message(
              v-if="state.errors.length",
              :messages="state.errors",
              messageTitle="Error: ",
              messageType="warning")
            message(
              v-if="state.success.length",
              :messages="state.success",
              messageType="Success")
            .field
              label.label Enter your new password below
              .control
                input.input(
                  type="password",
                  placeholder="New Password",
                  v-model="state.password",
                  name="password",
                  id="inputPassword")

            button.button(@click="forgot")
              span.icon
                fa(:icon="['fal', 'fingerprint']")
              span Reset Password
        p.has-text-grey
          nuxt-link(to="/login/forgot") Forgot Password
          span &nbsp;|&nbsp;
          nuxt-link(to="/login/signup") Sign-up
          span &nbsp;|&nbsp;
          nuxt-link(to="/login") Sign-in
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'AccountForgotPassword',
  data () {
    return {
      state: {
        password: '',
        errors: [],
        success: []
      }
    }
  },
  computed: {
    ...mapGetters(['isUserLoggedIn'])
  },
  async asyncData ({ $axios, app, route }) {
    let returnData = {}

    return returnData
  },
  methods: {
    ...mapActions([
      'setUser'
    ]),
    async forgot () {
      this.state.errors = []
      this.state.success = []
      const RES = await this.$axios({
        method: 'POST',
        url: '/api/login/resetPassword',
        data: {
          password: this.state.password,
          ...this.$route.params
        }
      })

      if (RES.statusCode !== 200) {
        this.state.errors.push(RES.data.error[0])
      } else {
        this.$axios.setToken(RES.data.data[0].token)
        this.setUser({ user: RES.data.data[0] })
        this.$cookies.set('jwt', RES.data.data[0].token, {
          path: '/',
          maxAge: 60 * 60 * 24 * 365
        })
        this.$router.push({ path: '/dashboard' })
      }
    }
  }
}
</script>

<style lang="stylus">

</style>
