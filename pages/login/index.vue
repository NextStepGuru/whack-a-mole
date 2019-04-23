<template lang="pug">
  form.form(
    @submit.prevent="",
    action="/login",
    name="accountSignin",
    :disabled="!isValidForm")
    .columns.is-desktop
      .column.is-6.is-offset-3
        h3.title.is-size-4
          span.icon
            fa(:icon="['fal', 'sign-in']", size="3x")
          span  Login
        b-message(
          class="is-primary"
          title="Fill out the form below to sign-in",
          @close="$router.push({path: '/'})")
            b-message(
              v-if="state.errors.length",
              :messages="state.errors",
              messageTitle="Error: ",
              messageType="warning")
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
            .field
              label.checkbox
                input(
                  type="checkbox",
                  v-model="state.isRememberMe",
                  name="isRememberMe",
                  id="inputIsRememberMe")
                span  Remember Me

            button.button.is-primary(
              @click="signin",
              :disabled="!isValidForm")
              span.icon
                fa(:icon="['fal', 'sign-in']")
              span Sign-in
        p.has-text-grey
          nuxt-link(to="/login/signup") Sign-up
          span &nbsp;|&nbsp;
          nuxt-link(to="/login/forgot") Forgot Password
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { validate } from 'email-validator'

export default {
  name: 'AccountSignin',
  data () {
    return {
      state: {
        errors: [],
        isRememberMe: false,
        email: '',
        password: ''
      }
    }
  },
  computed: {
    ...mapGetters(['isUserLoggedIn']),
    isValidForm () {
      return validate(this.state.email)
    }
  },
  async asyncData ({ $axios, app, route }) {
    let returnData = {}

    return returnData
  },
  mounted () {
    if (this.isUserLoggedIn) {
      this.$router.push({ path: '/dashboard' })
    }
  },
  methods: {
    ...mapActions([
      'setUser'
    ]),
    async signin () {
      this.state.errors = []
      const RES = await this.$axios({
        method: 'POST',
        url: '/api/login/verify',
        data: {
          email: this.state.email,
          password: this.state.password
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
        this.$router.push({ path: RES.data.data[0].lastRoute })
      }
    }
  }
}
</script>

<style lang="stylus">

</style>
