<template>
  <div class="background">
    <!-- eslint-disable-next-line no-irregular-whitespace -->
    <h1>[tɹia​ŋ​ɡuː​laːɐ̯]</h1>
      <router-link to="/config">
       <h2 class="blink" v-show="showBlink">Press any key to play</h2>
     </router-link>
  </div>
</template>

<script>
import Blink from '@/mixins/blink'
import NavigateOnKeypress from '@/mixins/navigateOnKeypress'

export default {
  name: 'Home',
  mixins: [Blink, NavigateOnKeypress('/config')]
}
</script>

<style lang="scss" scoped>
.background {
  width: 100vw;
  height: 100vh;
  background-color: black;
}
a {
  color: white;
  text-decoration: none;
}
h1 {
  position: absolute;
  top: 25vh;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 10vw;
  pointer-events: none;
  color: white;
}
.blink {
  position: absolute;
  left: 0;
  right: 0;
  text-align: center;
  bottom: 10vh;
  font-size: 1.5vw;
  cursor: pointer;
}
</style>
