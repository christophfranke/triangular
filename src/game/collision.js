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
const FACTOR = 1
const intensity = diff => diff <= 0 ? RANGE : Math.min(RANGE / diff, RANGE)

const line = (pos1, pos2) => {
  return {
    type: 'line',
    pos1,
    pos2
  }
}

const dot = pos => {
  return {
    type: 'dot',
    pos
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

const create = canvas => {
  const { width, height } = canvas

  const tree = Tree.create()
  Tree.add(tree, plane(LA.v(0, 0), LA.w(1, 0)))
  Tree.add(tree, plane(LA.v(0, 0), LA.w(0, 1)))
  Tree.add(tree, plane(LA.v(width, 0), LA.w(-1, 0)))
  Tree.add(tree, plane(LA.v(0, height), LA.w(0, -1)))

  return tree
}

const collide = game => {
  game.players.forEach(player => {
    player.collision = Tree.nodes(game.tree, player.position, RANGE)
      .filter(node => node.test(player.position))
      .map(node => node.force(player.position))
      .reduce(LA.add, LA.v())
  })

  game.players.forEach(player => {
    const blocks = []
    // if (player.position.x < RANGE) {
    //   blocks.push({
    //     force: {
    //       x: 1,
    //       y: 0
    //     },
    //     intensity: intensity(player.position.x)
    //   })
    // }

    // if (player.position.x > game.renderer.canvas.width - RANGE) {
    //   blocks.push({
    //     force: {
    //       x: -1,
    //       y: 0
    //     },
    //     intensity: intensity(game.renderer.canvas.width - player.position.x)
    //   })
    // }

    // if (player.position.y < RANGE) {
    //   blocks.push({
    //     force: {
    //       x: 0,
    //       y: 1
    //     },
    //     intensity: intensity(player.position.y)
    //   })
    // }

    // if (player.position.y > game.renderer.canvas.height - RANGE) {
    //   blocks.push({
    //     force: {
    //       x: 0,
    //       y: -1
    //     },
    //     intensity: intensity(game.renderer.canvas.height - player.position.y)
    //   })
    // }

    game.players.filter(other => player !== other)
      .map(other => other.position)
      .filter(other => LA.distance(player.position, other) < RANGE)
      .forEach(other => {
        blocks.push({
          force: LA.normalize({
            x: (player.position.x - other.x),
            y: (player.position.y - other.y)
          }),
          intensity: intensity(LA.distance(player.position, other))
        })
      })

    blocks.forEach(block => {
      player.collision.x += FACTOR * block.force.x * block.intensity
      player.collision.y += FACTOR * block.force.y * block.intensity
    })
  })

  game.players.forEach(player => {
    player.speed.x += player.collision.x
    player.speed.y += player.collision.y
    player.position.x += player.collision.x
    player.position.y += player.collision.y
  })
}

export default {
  line,
  dot,
  plane,
  collide,
  create
}