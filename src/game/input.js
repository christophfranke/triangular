const LEFT = 37
const RIGHT = 39

const keys = {}
const mouse = { x: 0, y: 0 }

const down = code => {
  keys[code] = true
}

const up = code => {
  keys[code] = false
}

const move = (x, y) => {
  mouse.x = x
  mouse.y = y
}

window.addEventListener('keydown', e => down(e.key))
window.addEventListener('keyup', e => up(e.key))
window.addEventListener('mousemove', e => move(e.clientX, e.clientY))

const isDown = code => keys[code]

export default {
  isDown,
  mouse,
  LEFT,
  RIGHT
}
