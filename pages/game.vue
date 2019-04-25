<template lang="pug">
.mole-body
  .container
    .columns
      .column.is-3-desktop.is-2-tablet
        h1.is-size-3 Actions
        .buttons
          button.button.is-success(
            @click="start",
            :disabled="state.startTime") Start
          button.button.is-danger(
            @click="stopInterval",
            :disabled="!state.startTime") Stop
          button.button.is-info(
            @click="state.isModalConfigActive = !state.isModalConfigActive",
            :disabled="state.startTime") Controls
      .column.is-6-desktop.is-8-tablet
        .scoreboard
          .columns.is-mobile.scoreboard-top
            .column.has-text-centered
              h2.is-size-7-mobile.has-text-weight-bold Hits
              span.is-size-1-desktop.is-size-4-mobile {{ state.score}}
            .column.has-text-centered
              h2.is-size-7-mobile.has-text-weight-bold Misses
              span.is-size-1-desktop.is-size-4-mobile {{ state.miss}}
            .column.has-text-centered
              h2.is-size-7-mobile.has-text-weight-bold Countdown
              span.is-size-1-desktop.is-size-4-mobile {{ timeLeft() }}
          .columns.is-mobile.scoreboard-bottom.is-multiline
            .column.is-4-mobile.has-text-centered
              h2.is-size-7-mobile.has-text-weight-bold 1st Place
              span.is-size-7 {{ getFirst }}
            .column.is-4-mobile.has-text-centered
              h2.is-size-7-mobile.has-text-weight-bold 2nd Place
              span.is-size-7 {{ getSecond }}
            .column.is-4-mobile.has-text-centered
              h2.is-size-7-mobile.has-text-weight-bold 3rd Place
              span.is-size-7 {{ getThird }}
            .column.is-4-mobile.has-text-centered
              h2.is-size-7-mobile.has-text-weight-bold 4th Place
              span.is-size-7 {{ getFourth }}
            .column.is-4-mobile.has-text-centered
              h2.is-size-7-mobile.has-text-weight-bold 5th Place
              span.is-size-7 {{ getFifth }}
      .column.is-3-desktop.is-2-tablet
        h1.is-size-3 Welcome {{ getUser.firstName }}
        .buttons
          nuxt-link.button.is-warning(to="/logout") Sign-out

  .hero.is-light
    .hero-body
      .container
        .columns
          .column.is-2
          .column.is-8
            .columns.is-multiline.is-mobile
              .column(:class="computeClassSize", v-for="(item, idx) in state.moles")
                mole-hill(
                  :key="idx",
                  v-bind="item",
                  @score="score",
                  @miss="miss")
  b-modal(
    :active.sync="state.isModalConfigActive",
    :width="640",
    scroll="keep")
    .box
      .field
        label.label Game Length
          span.help (in seconds)
        .control
          input.input.is-fullwidth.is-large.is-primary(
            v-model="state.maxTimeInSeconds",
            type="number",
            step="1",
            min="1",
            max="99999")
      .field
        label.label Speed
        .control
          input.input.slider.is-fullwidth.is-large.is-primary(
            v-model="state.speedInSeconds"
            step="0.1"
            min="0.5"
            max="3"
            value="1"
            type="range")
      .field
        label.label Total Moles
        .control
          select.select.is-fullwidth.is-large.is-primary(
            v-model="state.totalMoles")
            option(v-for="i in [9, 12, 16, 18, 24, 48, 60]", :key="i", :value="i") {{ i }} moles
      .field
        button.button.is-primary(@click="saveControls") Save
</template>

<script>
import Moment from 'moment'
import MoleHill from '~/components/MoleHill.vue'
import { mapGetters } from 'vuex'

const DefaultState = {
  isModalConfigActive: false,
  maxTimeInSeconds: 30,
  endTime: null,
  startTime: null,
  currentTime: Moment(new Date()).format("hh:mm:ss"),
  score: 0,
  miss: 0,
  interval: null,
  intervalClock: null,
  speedInSeconds: 1,
  maxMoles: 1,
  totalMoles: 12,
  activeMoles: [],
  moles: {
  }
}

export default {
  name: 'Home',
  meta: {
    roles: ['user']
  },
  components: {
    'mole-hill': MoleHill
  },
  data () {
    return {
      leaderboard: [],
      state: DefaultState
    }
  },
  computed: {
    ...mapGetters(['getScreen', 'getUser', 'getMobileUserAgent']),
    computeClassSize () {
      switch (this.state.totalMoles) {
        case 9:
          return 'is-one-third'

        case 16:
        case 12:
          return 'is-one-quarter'

        case 24:
        case 18:
          return 'is-2'
      }
      return 'is-1'
    },
    getFirst () {
      return this.leaderboard.length && this.leaderboard[0].user.firstName
    },
    getSecond () {
      return this.leaderboard.length && this.leaderboard[1].user.firstName
    },
    getThird () {
      return this.leaderboard.length && this.leaderboard[2].user.firstName
    },
    getFourth () {
      return this.leaderboard.length && this.leaderboard[3].user.firstName
    },
    getFifth () {
      return this.leaderboard.length && this.leaderboard[4].user.firstName
    }
  },
  mounted () {
    this.resetState()
    this.loadLeaderboard()
    this.intervalClock = setInterval(this.time, 1000)
  },
  beforeDestroy() {
    clearInterval(this.interval)
    clearInterval(this.intervalClock)
  },
  methods: {
    async loadLeaderboard () {
      const RES = await this.$axios({
        method: 'GET',
        url: '/api/leaderboard'
      })

      if (RES.statusCode === 200) {
        this.$set(this, 'leaderboard', RES.data.data[0].leaderboard)
      }
    },
    async recordScore () {
      const RES = await this.$axios({
        method: 'post',
        url: '/api/leaderboard',
        data: {
          userId: this.getUser.id,
          score: this.state.score,
          miss: this.state.miss,
          timeInSeconds: this.state.maxTimeInSeconds
        }
      })

      if (RES.statusCode === 200) {
        this.$set(this, 'leaderboard', RES.data.data[0].leaderboard)
      }
    },
    time () {
      this.state.currentTime = Moment(new Date()).format("hh:mm:ss")
    },
    saveControls () {
      this.state.isModalConfigActive = !this.state.isModalConfigActive
      this.state.moles = {}
      this.repaintMoles()
    },
    repaintMoles () {
      for (let i = 0; i < this.state.totalMoles; i++) {
        this.$set(this.state.moles, `${i + 1}`, {
          isMoleHidden: true
        })
      }
    },
    resetState () {
      this.state = DefaultState

      this.repaintMoles()
    },
    timeLeft () {
      return this.state.maxTimeInSeconds - Moment().diff(this.state.startTime, 'second') || 0
    },
    miss () {
      this.state.miss++
    },
    score () {
      let vm = this

      vm.$toast.open({
        duration: 250,
        message: `Hit! Congrats on Whacking that Mole!`,
        type: 'is-success',
        queue: false
      })
      vm.state.score++

      for (let i = 0; i < vm.state.activeMoles.length; i++) {
        let removeMole = vm.state.activeMoles[0]
        vm.state.moles[`${removeMole}`].isMoleHidden = true
        vm.state.activeMoles.shift()
      }
    },
    getRandomInt(min, max) {
      min = Math.ceil(min)
      max = Math.floor(max)

      return Math.floor(Math.random() * (max - min)) + min
    },
    computeScore () {
      this.stopInterval()
      this.state.endTime = null
      this.state.startTime = null
      this.state.activeMoles = []
      this.recordScore()
    },
    stopInterval () {
      let vm = this
      clearInterval(vm.state.interval)

      for (let i = 0; i < vm.state.activeMoles.length; i++) {
        let removeMole = vm.state.activeMoles[0]
        vm.state.moles[`${removeMole}`].isMoleHidden = true
        vm.state.activeMoles.shift()
      }

      vm.state.startTime = null
    },
    start () {
      this.state.startTime = Moment()
      this.state.endTime = Moment().add({
        second: this.state.maxTimeInSeconds
      })
      this.changeInterval()
    },
    changeInterval () {
      let vm = this

      vm.state.score = 0
      vm.state.miss = 0

      clearInterval(vm.state.interval)
      vm.state.interval = setInterval (() => {
        /*
          Will hit same mole 1/12th of the time and
          no mole will appear by design.
         */
        let popMole = vm.getRandomInt(1, 12)
        vm.state.moles[`${popMole}`].isMoleHidden = false
        vm.state.activeMoles.push(popMole)

        if (vm.state.activeMoles.length > vm.state.maxMoles) {
          let removeMole = vm.state.activeMoles[0]
          vm.state.moles[`${removeMole}`].isMoleHidden = true
          vm.state.activeMoles.shift()
        }

        if (Moment().diff(vm.state.endTime, 'second') > 0) {
          vm.computeScore()
        }
      }, vm.state.speedInSeconds * 1000)
    }
  }
}
</script>

<style lang="sass">
.scoreboard
  font-family: 'Orbitron', sans-serif
  background: url('/scoreboard.svg') no-repeat top center
  background-size: cover
  object-fit: cover
  overflow: hidden
  color: white
  background-size: 100%

.scoreboard-top
  margin-top: 120px

@media only screen and (max-width: 1023px)
  .scoreboard-top
    margin-top: 70px

@media only screen and (width: 768px)
  .scoreboard-top
    margin-top: 140px

@media only screen and (max-width: 400px)
  .scoreboard-top
    margin-top: 16vw

.scoreboard-bottom
  padding-bottom: 10px


</style>
