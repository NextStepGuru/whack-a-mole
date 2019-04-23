<template lang="pug">
  form.form(
    @submit.prevent="",
    action="/login",
    name="accountSignup",
    :disabled="!isValidForm")
    .columns.is-desktop
      .column.is-6.is-offset-3
        h3.title.is-size-4
          span.icon
            fa(:icon="['fal', 'user-plus']")
          span  Sign-up
        b-message(
          class="is-primary"
          title="Fill out the form below to sign-up",
          @close="$router.push({path: '/'})")
            message(
              v-if="state.errors.length",
              :messages="state.errors",
              messageTitle="Error: ",
              messageType="warning")
            b-field(label="First Name")
              b-input(
                type="text",
                placeholder="First Name",
                v-model="state.firstName",
                name="firstName",
                id="inputfirstName",
                required="true")
            b-field(label="Last Name")
              b-input(
                type="text",
                placeholder="Last Name",
                v-model="state.lastName",
                name="lastName",
                id="inputLastName",
                required="true")
            b-field(label="Email Address")
              b-input(
                type="email",
                placeholder="Email Address",
                v-model="state.email",
                name="email",
                id="inputEmail",
                required="true")
            b-field(label="Password")
              b-input(
                type="password",
                placeholder="Password",
                v-model="state.password",
                name="password",
                id="inputPassword",
                required="true")

            button.button.is-primary(
              :disabled="isDisabled || !isValidForm",
              @click="signup")
              span.icon
                fa(:icon="['fal', 'user-plus']")
              span Sign-up
        p.has-text-grey
          nuxt-link(to="/login") Sign-in
          span &nbsp;|&nbsp;
          nuxt-link(to="/login/forgot") Forgot Password
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { validate } from 'email-validator'

export default {
  name: 'AccountSignUp',
  data () {
    return {
      state: {
        errors: [
        ],
        firstName: '',
        lastName: '',
        email: '',
        password: ''
      }
    }
  },
  computed: {
    ...mapGetters(['isUserLoggedIn']),
    isValidForm () {
      return validate(this.state.email)
    },
    isDisabled () {
      return false
    }
  },
  async asyncData ({ $axios, app, route }) {
    let returnData = {}

    return returnData
  },
  methods: {
    ...mapActions([
      'setUser'
    ]),
    async signup () {
      this.state.errors = []
      const RES = await this.$axios({
        method: 'POST',
        url: '/api/login',
        data: {
          email: this.state.email,
          password: this.state.password,
          lastName: this.state.lastName,
          firstName: this.state.firstName
        }
      })

      if (RES.statusCode !== 200) {
        this.state.errors.push(RES.data.error[0])
      } else {
        let dn = window.location.hostname.split('.')
        if (dn.length === 3) {
          dn.splice(0, 1)
        }
        dn = dn.join('.')
        this.$axios.setToken(RES.data.data[0].token)
        this.setUser({ user: RES.data.data[0] })
        this.$cookies.set('jwt', RES.data.data[0].token, {
          path: '/',
          domain: `.${dn}`,
          maxAge: 60 * 60 * 24 * 365,
          secure: true
        })
        this.$router.push({ path: '/dashboard' })
      }
    }
  }
}
</script>

<style lang="stylus">

</style>
