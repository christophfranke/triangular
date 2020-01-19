const LEFT = 37
const RIGHT = 39

const keys = {}

const down = code => {
  keys[code] = true
}

const up = code => {
  keys[code] = false
}

window.addEventListener('keydown', e => down(e.keyCode))
window.addEventListener('keyup', e => up(e.keyCode))

const isDown = code => keys[code]

export default {
  isDown,
  LEFT,
  RIGHT
}
