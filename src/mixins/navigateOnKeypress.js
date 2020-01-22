export default map => {
  const target = e => typeof map === 'string' ? map : map[e.code]

  return {
    methods: {
      keypress (e) {
        if (target(e)) {
          this.$router.push(target(e))
        }
      }
    },

    mounted () {
      window.addEventListener('keydown', this.keypress)
    },

    destroyed () {
      window.removeEventListener('keydown', this.keypress)
    }
  }
}
