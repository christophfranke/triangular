const add = (v, w) => ({
  x: v.x + w.x,
  y: v.y + w.y
})

const madd = (a, m, b) => ({
  x: a.x + m * b.x,
  y: a.y + m * b.y
})

const multiply = (m, v) => ({
  x: m * v.x,
  y: m * v.y
})

const subtract = (v, w) => ({
  x: v.x - w.x,
  y: v.y - w.y
})

const normalize = v => ({
  x: v.x / distance(v),
  y: v.y / distance(v)
})

const rotate = (alpha, v) => ({
  x: Math.cos(alpha) * v.x - Math.sin(alpha) * v.y,
  y: Math.sin(alpha) * v.x + Math.cos(alpha) * v.y
})

const rotate90 = v => ({
  x: -v.y,
  y: v.x
})

const product = (v, w = v) => v.x * w.x + v.y * w.y
const vector = (x = 0, y = 0) => ({ x, y })

const sqDistance = (v, w = { x: 0, y: 0 }) => product(subtract(w, v))
const distance = (v, w) => Math.sqrt(sqDistance(v, w))

const random = (x, y) => ({
  x: Math.random() * x,
  y: Math.random() * y
})

export default {
  add,
  madd,
  subtract,
  multiply,
  distance,
  sqDistance,
  normalize,
  product,
  rotate,
  rotate90,
  random,
  v: vector,
  w: vector
}
