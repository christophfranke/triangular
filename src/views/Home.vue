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
    toggle () {
      if (this.game) {
        Game.stop(this.game)
        this.game = null
      } else {
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
