import LA from './la'
import Tree from './tree'

// the game will never get out of those bounds
const ABSOLUT_MIN = {
  x: -1,
  y: -1
}
const ABSOLUT_MAX = {
  x: 10000,
  y: 10000
}

const RANGE = 30
const SQ_RANGE = RANGE * RANGE
const BOUNCYNESS = 0.5
const intensity = distance => distance <= 0 ? RANGE : Math.min(RANGE / distance, RANGE)

const line = (point1, point2) => {
  const difference = LA.subtract(point2, point1)
  const normal = LA.normalize(LA.rotate90(difference))
  const offset = LA.product(point1, normal)
  const point1Offset = LA.product(point1, difference)
  const point2Offset = LA.product(point2, difference)

  const distance = position => {
    const positionOffset = LA.product(position, difference)
    if (positionOffset <= point1Offset) {
      return LA.distance(position, point1)
    }
    if (positionOffset >= point2Offset) {
      return LA.distance(position, point2)
    }

    return Math.abs(LA.product(position, normal) - offset)
  }

  const test = position => distance(position) < RANGE
  const force = position => {
    const positionOffset = LA.product(position, difference)
    if (positionOffset <= point1Offset) {
      return LA.multiply(intensity(LA.distance(position, point1)), LA.normalize(LA.subtract(position, point1)))
    }
    if (positionOffset >= point2Offset) {
      return LA.multiply(intensity(LA.distance(position, point2)), LA.normalize(LA.subtract(position, point2)))
    }

    const factor = LA.product(position, normal) - offset
    return LA.multiply(Math.sign(factor) * intensity(Math.abs(factor)), normal)
  }

  const min = {
    x: Math.min(ABSOLUT_MIN.x, point1.x, point2.x),
    y: Math.min(ABSOLUT_MIN.y, point1.y, point2.y)
  }

  const max = {
    x: Math.max(ABSOLUT_MAX.x, point1.x, point2.x),
    y: Math.max(ABSOLUT_MAX.y, point1.y, point2.y)
  }

  const bounds = () => ({
    min,
    max
  })

  return {
    test,
    force,
    bounds
  }
}

const dot = point => {
  const test = position => point !== position && LA.sqDistance(point, position) < SQ_RANGE
  const force = position => LA.multiply(intensity(LA.distance(position, point)), LA.normalize(LA.madd(position, -1, point)))

  const min = { ...point }
  const max = { ...point }
  const bounds = () => ({
    min,
    max
  })

  return {
    test,
    force,
    bounds
  }
}

const plane = (point, direction) => {
  const normal = LA.normalize(direction)
  const offset = LA.product(point, normal)

  const distance = position => LA.product(position, normal) - offset
  const test = position => distance(position) < RANGE
  const force = position => ({
    x: normal.x * intensity(distance(position)),
    y: normal.y * intensity(distance(position))
  })

  const min = { ...ABSOLUT_MIN }
  const max = { ...ABSOLUT_MAX }

  if (normal.x !== 0) {
    const x1 = (offset - normal.y * ABSOLUT_MIN.y) / normal.x
    const x2 = (offset - normal.y * ABSOLUT_MAX.y) / normal.x
    min.x = Math.max(min.x, Math.min(x1, x2))
    max.x = Math.min(max.x, Math.max(x1, x2))
  }

  if (normal.y !== 0) {
    const y1 = (offset - normal.x * ABSOLUT_MIN.x) / normal.y
    const y2 = (offset - normal.x * ABSOLUT_MAX.x) / normal.y
    min.y = Math.max(min.y, Math.min(y1, y2))
    max.y = Math.min(max.y, Math.max(y1, y2))
  }

  const bounds = () => ({
    min,
    max
  })

  return {
    test,
    force,
    bounds
  }
}

const create = (canvas, lines) => {
  // const { width, height } = canvas

  const tree = Tree.create()
  // Tree.add(tree, plane(LA.v(-5 * width, 0), LA.w(1, 0)))
  // Tree.add(tree, plane(LA.v(0, -5 * height), LA.w(0, 1)))
  // Tree.add(tree, plane(LA.v(5 * width, 0), LA.w(-1, 0)))
  // Tree.add(tree, plane(LA.v(0, 5 * height), LA.w(0, -1)))

  lines.forEach(l => {
    Tree.add(tree, line(l.point1, l.point2))
  })

  return tree
}

const collide = game => {
  game.players.filter(player => player.alive).forEach(player => {
    player.collision = Tree.nodes(game.tree, player.position)
      .filter(node => node.test(player.position))
      .map(node => node.force(player.position))
      .reduce(LA.add, LA.v())
  })

  game.players.filter(player => player.alive).forEach(player => {
    player.speed.x += BOUNCYNESS * player.collision.x
    player.speed.y += BOUNCYNESS * player.collision.y
    player.position.x += player.collision.x
    player.position.y += player.collision.y
  })
}

export default {
  line,
  dot,
  plane,
  collide,
  create,
  RANGE
}
