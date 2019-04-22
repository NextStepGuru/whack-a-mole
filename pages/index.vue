<template lang="pug">
.mole-body
  .container
    section.section
      .columns
        .column.has-text-centered
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
        .column.has-text-centered
          h2 Score
          span {{ state.score}}
        .column.has-text-centered
          h2 Click Misses
          span {{ state.miss}}
        .column.has-text-centered
          h2 Time Left
          span {{ timeLeft() }} seconds

  .hero.is-success
    .hero-body
      .container
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

const DefaultState = {
  isModalConfigActive: false,
  maxTimeInSeconds: 10,
  endTime: null,
  startTime: null,
  score: 0,
  miss: 0,
  interval: null,
  speedInSeconds: 1,
  maxMoles: 1,
  totalMoles: 60,
  activeMoles: [],
  moles: {
  }
}

export default {
  name: 'Home',
  components: {
    'mole-hill': MoleHill
  },
  data () {
    return {
      state: DefaultState
    }
  },
  computed: {
    computeClassSize () {
      switch (this.state.totalMoles) {
        case 9:
          return 'is-one-third'

        case 12:
        case 16:
        case 24:
          return 'is-one-quarter'

        case 18:
          return 'is-2'
      }
      return 'is-1'
    }
  },
  mounted () {
    this.resetState()
  },
  methods: {
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
      this.state.score++
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
      this.state.score = 0
      this.state.miss = 0
      this.state.activeMoles = []
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

        if (Moment().diff(this.state.endTime, 'second') > 0) {
          this.computeScore()
        }
      }, this.state.speedInSeconds * 1000)
    }
  }
}
</script>
