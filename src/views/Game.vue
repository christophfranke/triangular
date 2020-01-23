<template>
  <div class="home">
    <canvas ref="canvas"></canvas>
    <div class="info speed" v-if="game">current {{ speed }} px/s</div>
    <div class="info average" v-if="game">average {{ averageSpeed }} px/s</div>
    <div class="info max" v-if="game">maximum {{ maxSpeed }} px/s</div>
    <div class="info milage" v-if="game">milage {{ milage }} px</div>
  </div>
</template>

<script>
import Game from '@/game'
const isFullscreen = () => !window.screenTop && !window.screenY

export default {
  name: 'home',
  data () {
    return {
      game: null,
      speed: 0,
      maxSpeed: 0,
      milage: 0,
      tick: 0,
      fullscreen: false
    }
  },

  computed: {
    averageSpeed () {
      return Math.round(60 * this.milage / this.tick)
    }
  },

  methods: {
    openFullscreen () {
      if (this.fullscreen) {
        return Promise.resolve()
      }

      const elem = document.documentElement
      if (elem.requestFullscreen) {
        elem.requestFullscreen()
      } else if (elem.mozRequestFullScreen) { /* Firefox */
        elem.mozRequestFullScreen()
      } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
        elem.webkitRequestFullscreen()
      } else if (elem.msRequestFullscreen) { /* IE/Edge */
        elem.msRequestFullscreen()
      }

      return new Promise(resolve => {
        const resolveAndRemove = () => {
          if (isFullscreen()) {
            resolve()
            document.removeEventListener('fullscreenchange', resolveAndRemove)
            document.removeEventListener('mozfullscreenchange', resolveAndRemove)
            document.removeEventListener('webkitfullscreenchange', resolveAndRemove)
            document.removeEventListener('msfullscreenchange', resolveAndRemove)
          }
        }

        this.fullscreen = true
        document.addEventListener('fullscreenchange', resolveAndRemove)
        document.addEventListener('mozfullscreenchange', resolveAndRemove)
        document.addEventListener('webkitfullscreenchange', resolveAndRemove)
        document.addEventListener('msfullscreenchange', resolveAndRemove)
      })
    },

    keyStopGame (e) {
      if (e.code === 'Escape') {
        Game.stop(this.game)
        this.$router.push('/')
      }
    },

    fullscreenStopGame () {
      if (!isFullscreen()) {
        if (this.game) {
          Game.stop(this.game)
        }
        this.$router.push('/')
      }
    }
  },

  async mounted () {
    if (!this.$store.getters.players.length) {
      this.$router.push('/')
    }

    window.addEventListener('fullscreenchange', this.fullscreenStopGame)
    window.addEventListener('keydown', this.keyStopGame)

    try {
      await this.openFullscreen()
    } catch (e) {
      this.$router.push('/')
    }

    this.game = Game.start(this.$refs.canvas, this.$store.getters.players)

    const observeGame = () => {
      if (this.game) {
        const player = this.game.players[0]
        if (player) {
          this.speed = this.game.players[0].displaySpeed
          this.maxSpeed = this.speed ? Math.max(this.maxSpeed, this.speed) : this.maxSpeed

          if (player.alive) {
            this.tick = this.game && this.game.tick
            this.milage = this.game && this.game.players[0] && this.game.players[0].milage
          }
        }
      }

      if (this) {
        requestAnimationFrame(observeGame)
      }

      if (this.game && !this.game.running && this.$refs.canvas) {
        this.game = Game.start(this.$refs.canvas, this.$store.getters.players)
        this.maxSpeed = 0
      }
    }

    observeGame()
  },

  destroyed () {
    window.removeEventListener('keydown', this.keyStopGame)
    window.removeEventListener('fullscreenchange', this.fullscreenStopGame)
  }
}
</script>

<style lang="scss" scoped>
canvas {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
  min-height: 100vh;
  min-width: 100vw;
  cursor: none;
}
.info {
  position: absolute;
  left: 10px;
  color: red;
  font-size: 20px;
}
.speed {
  top: 10px;
}
.average {
  top: 30px;
}
.max {
  top: 50px;
}
.milage {
  top: 70px;
}
</style>
