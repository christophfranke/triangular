import Input from './input'
import Collision from './collision'
import Tree from './tree'
import LA from './la'
import Util from './util'
import Stage from './stage'
import AI from './ai'

const THRUST = 0.2
const TURN = 0.0175 * 2 * Math.PI
const DRAG = 0.06
const VEHICLE_FRACTION = 0.97
const BREAK_DRAG = 2.0
const MAX_COLLISION_POWER = 50
const DIE_FROM_COLLISION = true

const PLAYERS = [{
  color: {
    r: 255,
    g: 0,
    b: 0
  },
  left: '1',
  right: 'q'
}, {
  color: {
    r: 0,
    g: 255,
    b: 255
  },
  left: 'x',
  right: 'c'
}, {
  color: {
    r: 255,
    g: 255,
    b: 0
  },
  left: 'b',
  right: 'n'
}, {
  color: {
    r: 0,
    g: 255,
    b: 0
  },
  left: 'ArrowLeft',
  right: 'ArrowRight'
}, {
  color: {
    r: 255,
    g: 0,
    b: 255
  },
  left: '0',
  right: 'p'
}]

const create = (tree, player) => {
  const position = LA.add(Stage.START_CAGE.min, LA.random(Stage.START_CAGE.max.x - Stage.START_CAGE.min.x, Stage.START_CAGE.max.y - Stage.START_CAGE.min.y))

  const direction = 1.5 * Math.PI
  const speed = {
    x: 0,
    y: 0
  }

  const dot = Collision.dot(position)
  Tree.add(tree, dot)

  return {
    position,
    direction,
    speed,
    dot,
    alive: true,
    type: player.type || 'input',
    ...player
  }
}

const milage = player => {
  if (player.stage) {
    const center = LA.lerp(player.stage.leftLine.point1, player.stage.rightLine.point1, 0.5)
    const normal = LA.normalize(LA.rotate90(LA.subtract(player.stage.rightLine.point1, player.stage.leftLine.point1)))
    const relativeMilage = LA.product(LA.subtract(player.position, center), normal)

    return Math.round(player.stage.milage + relativeMilage)
  } else {
    return 0
  }
}

const color = (player, alpha = 1) => Util.rgba(player.color.r, player.color.g, player.color.b, alpha)

const dieFromCollision = game => {
  game.players.forEach(player => {
    player.alive = player.alive && (!player.collision || player.collision.intensity <= MAX_COLLISION_POWER)
  })

  game.players.filter(player => !player.alive && player.dot).forEach(player => {
    Tree.remove(game.tree, player.dot)
    player.dot = null
  })

  // dead players slowly die from collision
  game.players.filter(player => !player.alive).forEach(player => {
    player.collision.intensity *= 0.95
  })
}

const updatePlayerInput = (game, player) => {
  if (player.type === 'input') {
    player.input = {
      left: Input.isDown(player.left),
      right: Input.isDown(player.right)
    }
  }

  if (player.type === 'ai') {
    player.input = AI.calculateInput(game, player)
  }
}

const nextSpeed = player => {
  const breaking = player.alive && player.input.left && player.input.right

  // the vehicle is aerodynamic, that means that the drag is much stronger when you go backwards
  const normProjection = player.alive && (player.speed.x * player.speed.y) !== 0
    ? (Math.cos(player.direction) * player.speed.x + Math.sin(player.direction) * player.speed.y) /
      Math.sqrt(player.speed.x * player.speed.x + player.speed.y * player.speed.y) : 0

  // press left and right is a step on the break (increases drag dramatically)
  const dragFactor = VEHICLE_FRACTION - normProjection + (breaking ? BREAK_DRAG : 0)

  player.speed.x *= (1.0 - dragFactor * DRAG)
  player.speed.y *= (1.0 - dragFactor * DRAG)

  // do not thrust when on break
  if (player.alive && !breaking) {
    player.speed.x += Math.cos(player.direction) * THRUST
    player.speed.y += Math.sin(player.direction) * THRUST
  }
}

const nextDirection = player => {
  if (player.alive && player.input.left) {
    player.direction -= TURN
  }
  if (player.alive && player.input.right) {
    player.direction += TURN
  }
}

const move = game => {
  // update collision tree
  game.players.filter(player => player.dot).forEach(player => {
    Tree.update(player.dot, Collision.dot(player.position))
  })

  game.players.forEach(player => {
    player.displaySpeed = Math.round(LA.distance(player.speed) * 60)
  })

  if (DIE_FROM_COLLISION) {
    dieFromCollision(game)
  }

  game.players.forEach(player => {
    updatePlayerInput(game, player)
    nextDirection(player)
    nextSpeed(player)
  })
  // apply all the forces that arise from collision
  Collision.collide(game)

  // move all players
  Collision.move(game)

  game.players.forEach(player => {
    player.milage = milage(player)
    player.points = game.stages.filter(stage => stage.owner === player).length
  })
}

export default {
  create,
  move,
  color,
  nextSpeed,
  nextDirection,
  milage,
  MAX_COLLISION_POWER,
  PLAYERS
}
