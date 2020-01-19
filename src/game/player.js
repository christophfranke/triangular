import Input from './input'

const THRUST = 0.1
const TURN = 0.0175 * 2 * Math.PI
const DRAG = 0.01
const STABILITY = 0.9

const create = canvas => {
  const position = {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height
  }

  const direction = 2 * Math.PI * Math.random()
  const speed = {
    x: 0,
    y: 0
  }

  return {
    position,
    direction,
    speed
  }
}

const madd = (a, beta, b) => ({
  x: a.x + beta * b.x,
  y: a.y + beta * b.y
})
const distance = (pos1, pos2 = { x: 0, y: 0 }) => {
  const diff = madd(pos1, -1, pos2)
  return Math.sqrt(diff.x * diff.x + diff.y * diff.y)
}
const normalize = v => ({
  x: v.x / distance(v),
  y: v.y / distance(v)
})

const RANGE = 50
const MAX_INTENSITY = RANGE
const FACTOR = 0.3
const intensity = diff => diff < 0 ? MAX_INTENSITY : Math.min(RANGE / diff, MAX_INTENSITY)
const collide = game => {
  game.players.forEach(player => {
    const blocks = []
    if (player.position.x < RANGE) {
      blocks.push({
        force: {
          x: 1,
          y: 0
        },
        intensity: intensity(player.position.x)
      })
    }

    if (player.position.x > game.renderer.canvas.width - RANGE) {
      blocks.push({
        force: {
          x: -1,
          y: 0
        },
        intensity: intensity(game.renderer.canvas.width - player.position.x)
      })
    }

    if (player.position.y < RANGE) {
      blocks.push({
        force: {
          x: 0,
          y: 1
        },
        intensity: intensity(player.position.y)
      })
    }

    if (player.position.y > game.renderer.canvas.height - RANGE) {
      blocks.push({
        force: {
          x: 0,
          y: -1
        },
        intensity: intensity(game.renderer.canvas.height - player.position.y)
      })
    }

    game.players.filter(other => player !== other).forEach(other => {
      if (distance(player.position, other.position) < RANGE) {
        blocks.push({
          force: normalize({
            x: (player.position.x - other.position.x),
            y: (player.position.y - other.position.y)
          }),
          intensity: intensity(distance(player.position, other.position))
        })
      }
    })

    player.collision = {
      x: 0,
      y: 0
    }
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

const move = game => {
  game.players.forEach(player => {
    player.position.x += player.speed.x
    player.position.y += player.speed.y

    collide(game)

    const normProjection = (player.speed.x * player.speed.y) !== 0
      ? (Math.cos(player.direction) * player.speed.x + Math.sin(player.direction) * player.speed.y) /
        Math.sqrt(player.speed.x * player.speed.x + player.speed.y * player.speed.y) : 1

    const dragFactor = Input.isDown(Input.LEFT) && Input.isDown(Input.RIGHT) ? 5 : STABILITY - normProjection

    player.speed.x *= (1.0 - dragFactor * DRAG)
    player.speed.y *= (1.0 - dragFactor * DRAG)

    if (!(Input.isDown(Input.LEFT) && Input.isDown(Input.RIGHT))) {
      player.speed.x += Math.cos(player.direction) * THRUST
      player.speed.y += Math.sin(player.direction) * THRUST
    }

    if (Input.isDown(Input.LEFT)) {
      player.direction -= TURN
    }
    if (Input.isDown(Input.RIGHT)) {
      player.direction += TURN
    }
  })
}

export default {
  create,
  move
}
