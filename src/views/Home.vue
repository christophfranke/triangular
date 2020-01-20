<template>
  <div class="home">
    <canvas ref="canvas" @click="toggle"></canvas>
  </div>
</template>

<script>
import Game from '@/game'

export default {
  name: 'home',
  data () {
    return {
      game: null
    }
  },

  methods: {
    openFullscreen () {
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
        document.addEventListener('fullscreenchange', resolve)
        document.addEventListener('mozfullscreenchange', resolve)
        document.addEventListener('webkitfullscreenchange', resolve)
        document.addEventListener('msfullscreenchange', resolve)
      })
    },

    closeFullscreen () {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      } else if (document.mozCancelFullScreen) { /* Firefox */
        document.mozCancelFullScreen()
      } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
        document.webkitExitFullscreen()
      } else if (document.msExitFullscreen) { /* IE/Edge */
        document.msExitFullscreen()
      }
    },

    async toggle () {
      if (this.game) {
        Game.stop(this.game)
        this.game = null
        // this.closeFullscreen()
      } else {
        // await this.openFullscreen()
        this.game = Game.start(this.$refs.canvas)
      }
    }
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
}
</style>
