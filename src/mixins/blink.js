export default {
  data () {
    return {
      intervalId: null,
      showBlink: true
    }
  },

  mounted () {
    this.intervalId = setInterval(() => {
      this.showBlink = !this.showBlink
    }, 1000)
  },

  destroyed () {
    clearTimeout(this.intervalId)
  }
}
