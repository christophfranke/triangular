const add = (v, w) => ({
  x: v.x + w.x,
  y: v.y + w.y
})

const madd = (a, beta, b) => ({
  x: a.x + beta * b.x,
  y: a.y + beta * b.y
})

const multiply = (alpha, v) => ({
  x: alpha * v.x,
  y: alpha * v.y
})

const subtract = (v, w) => ({
  x: v.x - w.x,
  y: v.y - w.y
})

const normalize = v => ({
  x: v.x / distance(v),
  y: v.y / distance(v)
})

const product = (v, w = v) => v.x * w.x + v.y * w.y
const vector = (x = 0, y = 0) => ({ x, y })

const sqDistance = (v, w = { x: 0, y: 0 }) => product(subtract(w, v))
const distance = (v, w) => Math.sqrt(sqDistance(v, w))

export default {
  add,
  madd,
  multiply,
  distance,
  sqDistance,
  normalize,
  product,
  v: vector,
  w: vector
}
