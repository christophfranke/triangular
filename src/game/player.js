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

const RANGE = 100
const MAX_INTENSITY = 100
const FACTOR = 0.5
const collide = game => {
  const player = game.player
  const blocks = []
  if (player.position.x < RANGE) {
    blocks.push({
      speed: 0,
      force: {
        x: 1,
        y: 0
      },
      intensity: Math.min(RANGE / player.position.x, MAX_INTENSITY)
    })
  }

  if (player.position.x > game.renderer.canvas.width - RANGE) {
    blocks.push({
      speed: 0,
      force: {
        x: -1,
        y: 0
      },
      intensity: Math.min(RANGE / (game.renderer.canvas.width - player.position.x), MAX_INTENSITY)
    })
  }

  if (player.position.y < RANGE) {
    blocks.push({
      speed: 0,
      force: {
        x: 0,
        y: 1
      },
      intensity: Math.min(RANGE / player.position.y, MAX_INTENSITY)
    })
  }

  if (player.position.y > game.renderer.canvas.height - RANGE) {
    blocks.push({
      speed: 0,
      force: {
        x: 0,
        y: -1
      },
      intensity: Math.min(RANGE / (game.renderer.canvas.height - player.position.y), MAX_INTENSITY)
    })
  }

  blocks.forEach(block => {
    player.position.x += FACTOR * block.force.x * block.intensity
    player.position.y += FACTOR * block.force.y * block.intensity
    player.speed.x += FACTOR * block.force.x * block.intensity
    player.speed.y += FACTOR * block.force.y * block.intensity
  })
}

const move = game => {
  game.player.position.x += game.player.speed.x
  game.player.position.y += game.player.speed.y

  collide(game)

  const normProjection = (game.player.speed.x * game.player.speed.y) !== 0
    ? (Math.cos(game.player.direction) * game.player.speed.x + Math.sin(game.player.direction) * game.player.speed.y) /
      Math.sqrt(game.player.speed.x * game.player.speed.x + game.player.speed.y * game.player.speed.y) : 1

  const dragFactor = Input.isDown(Input.LEFT) && Input.isDown(Input.RIGHT) ? 5 : STABILITY - normProjection

  game.player.speed.x *= (1.0 - dragFactor * DRAG)
  game.player.speed.y *= (1.0 - dragFactor * DRAG)

  if (!(Input.isDown(Input.LEFT) && Input.isDown(Input.RIGHT))) {
    game.player.speed.x += Math.cos(game.player.direction) * THRUST
    game.player.speed.y += Math.sin(game.player.direction) * THRUST
  }

  if (Input.isDown(Input.LEFT)) {
    game.player.direction -= TURN
  }
  if (Input.isDown(Input.RIGHT)) {
    game.player.direction += TURN
  }
}

export default {
  create,
  move
}
