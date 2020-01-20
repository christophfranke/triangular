const madd = (a, beta, b) => ({
  x: a.x + beta * b.x,
  y: a.y + beta * b.y
})

const add = (v, w) => ({
  x: v.x + w.x,
  y: v.y + w.y
})

const distance = (pos1, pos2 = { x: 0, y: 0 }) => {
  const diff = madd(pos1, -1, pos2)
  return Math.sqrt(diff.x * diff.x + diff.y * diff.y)
}

const normalize = v => ({
  x: v.x / distance(v),
  y: v.y / distance(v)
})

const product = (v, w) => v.x * w.x + v.y * w.y
const vector = (x = 0, y = 0) => ({ x, y })

export default {
  add,
  madd,
  distance,
  normalize,
  product,
  v: vector,
  w: vector
}
