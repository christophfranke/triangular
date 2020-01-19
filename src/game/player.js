import Input from './input'

const ACCELERATION = 0.1
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

const move = game => {
  game.player.position.x += game.player.speed.x
  game.player.position.y += game.player.speed.y

  const normProjection = (game.player.speed.x * game.player.speed.y) !== 0
    ? (Math.cos(game.player.direction) * game.player.speed.x + Math.sin(game.player.direction) * game.player.speed.y) /
      Math.sqrt(game.player.speed.x * game.player.speed.x + game.player.speed.y * game.player.speed.y) : 1

  const dragFactor = Input.isDown(Input.LEFT) && Input.isDown(Input.RIGHT) ? 5 : STABILITY - normProjection

  game.player.speed.x *= (1.0 - dragFactor * DRAG)
  game.player.speed.y *= (1.0 - dragFactor * DRAG)

  if (!(Input.isDown(Input.LEFT) && Input.isDown(Input.RIGHT))) {
    game.player.speed.x += Math.cos(game.player.direction) * ACCELERATION
    game.player.speed.y += Math.sin(game.player.direction) * ACCELERATION
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
