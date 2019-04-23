<template lang="pug">
  form.form(
    @submit.prevent="",
    action="/login",
    name="accountForgotPassword",
    :disabled="!isValidForm")
    .columns.is-desktop
      .column.is-6.is-offset-3
        h3.title.is-size-4
          span.icon
            fa(:icon="['fal', 'fingerprint']")
          span  Forgot Password
        b-message(
          class="is-primary"
          title="Fill out the form below to recovery your lost password.",
          @close="$router.push({path: '/'})")
            message(
              v-if="state.errors.length",
              :messages="state.errors",
              messageTitle="Error: ",
              messageType="warning")
            message(
              v-if="state.success.length",
              :messages="state.success",
              messageType="Success")
            b-field(label="Email Address")
              b-input(
                type="email",
                placeholder="Email Address",
                v-model="state.email",
                name="email",
                id="inputEmail",
                required="true")

            button.button.is-primary(
              @click="forgot",
              :disabled="!isValidForm")
              span.icon
                fa(:icon="['fal', 'fingerprint']")
              span Recover Lost Password
        p.has-text-grey
          nuxt-link(to="/login/signup") Sign-up
          span &nbsp;|&nbsp;
          nuxt-link(to="/login") Sign-in
</template>

<script>
import { validate } from 'email-validator'

export default {
  name: 'AccountForgotPassword',
  data () {
    return {
      state: {
        email: '',
        errors: [],
        success: []
      }
    }
  },
  computed: {
    isValidForm () {
      return validate(this.state.email)
    }
  },
  async asyncData ({ $axios, app, route }) {
    let returnData = {}

    return returnData
  },
  methods: {
    async forgot () {
      this.state.errors = []
      this.state.success = []
      const RES = await this.$axios({
        method: 'POST',
        url: '/api/login/lostPassword',
        data: {
          email: this.state.email
        }
      })

      if (RES.statusCode !== 200) {
        this.state.errors.push(RES.data.error[0])
      } else {
        console.log(RES.data.data[0])
        this.state.success.push(RES.data.data[0])
      }
    }
  }
}
</script>

<style lang="stylus">

</style>
