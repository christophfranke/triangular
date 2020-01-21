import LA from './la'
import Collision from './collision'
import Tree from './tree'

const MIN_WIDTH = 100
const MAX_WIDTH = 1000
const LINE_MIN_LENGTH = 500
const LINE_MAX_LENGTH = 1000
const MAX_ANGLE_CHANGE = 0.3 * Math.PI
const MAX_ATTEMPT = 2
const START_CAGE = {
  min: LA.v(),
  max: LA.w(MAX_WIDTH)
}

const allLines = game => game.stages.flatMap(stage => [stage.leftLine, stage.rightLine].concat(stage.extraLines || []))

const lastStage = game => game.stages[game.stages.length - 1]
const leftRight = game => ({
  left: lastStage(game).leftLine.point2,
  right: lastStage(game).rightLine.point2
})
const current = game => {
  const { left, right } = leftRight(game)
  const direction = LA.rotate90(LA.normalize(LA.subtract(right, left)))

  return {
    left,
    right,
    direction
  }
}

const randomDirection = direction => LA.rotate(2 * MAX_ANGLE_CHANGE * Math.random() - MAX_ANGLE_CHANGE, direction)
const randomLength = () => LINE_MIN_LENGTH + (LINE_MAX_LENGTH - LINE_MIN_LENGTH) * Math.random()
const randomWidth = () => MIN_WIDTH + (MAX_WIDTH - MIN_WIDTH) * Math.random()
const random = direction => ({
  newDirection: randomDirection(direction),
  length: randomLength(),
  width: randomWidth()
})

const newLines = (left, right, newDirection, length, width) => {
  const center = LA.lerp(left, right, 0.5)

  // calculate new points
  const newCenter = LA.madd(center, length, newDirection)
  const newLeft = LA.madd(newCenter, 0.5 * width, LA.rotate90(newDirection))
  const newRight = LA.madd(newCenter, -0.5 * width, LA.rotate90(newDirection))

  // try left and right lines
  const leftLine = { point1: left, point2: newLeft }
  const rightLine = { point1: right, point2: newRight }

  return {
    leftLine,
    rightLine
  }
}

const next = game => {
  const { left, right, direction } = current(game)
  const { newDirection, length, width } = random(direction)

  return newLines(left, right, newDirection, length, width)
}

const test = (game, ...lines) => lines.every(oneLine => allLines(game).every(otherLine => !LA.intersect(oneLine, otherLine)))

const create = game => {
  let attempt = 0
  while (attempt < MAX_ATTEMPT) {
    attempt += 1

    const { leftLine, rightLine } = next(game)
    if (test(game, leftLine, rightLine)) {
      const result = {
        leftLine,
        rightLine,
        attempt
      }

      initialize(game, result)
      return result
    }
  }

  // go back a stage and try create a new one instead
  if (!lastStage(game).fixed) {
    updateLastStage(game)
    return create(game)
  }

  // last stage is fixed and no viable candidate found
  // means we are done here
  return goal(game)
}

const updateLastStage = game => {
  const stage = game.stages.pop()
  if (stage.fixed) {
    // should should never happen
    stage.attempt = MAX_ATTEMPT
  }

  stage.destruct()
  while (stage.attempt < MAX_ATTEMPT) {
    stage.attempt += 1

    const { leftLine, rightLine } = next(game)
    if (test(game, leftLine, rightLine)) {
      stage.leftLine = leftLine
      stage.rightLine = rightLine

      initialize(game, stage)
      game.stages.push(stage)
      return true // found new lines
    }
  }

  // did not find a valid solution
  if (!lastStage(game).fixed) {
    // review last stage
    updateLastStage(game)

    // and after that just create a new one
    const newStage = create(game)
    game.stages.push(newStage)
    return true // created new stage
  }

  // last stage is fixed,
  // stop looking and mark this one also fixed
  stage.fixed = true
  initialize(game, stage)
  game.stages.push(stage)
}

const goal = game => {
  const { left, right, direction } = current(game)

  const length = 100
  const width = 0

  const result = {
    ...newLines(left, right, direction, length, width),
    fixed: true,
    goal: true
  }

  initialize(game, result)
  return result
}

const cage = game => {
  const a = START_CAGE.min
  const b = LA.vector(START_CAGE.min.x, START_CAGE.max.y)
  const c = START_CAGE.max
  const d = LA.vector(START_CAGE.max.x, START_CAGE.min.y)

  const result = {
    leftLine: {
      point1: c,
      point2: d
    },
    rightLine: {
      point1: b,
      point2: a
    },
    extraLines: [{
      point1: b,
      point2: c
    }],
    fixed: true,
    players: [...game.players]
  }

  initialize(game, result)
  return result
}

const crossStageBorder = (stage, player) => {
  if (stage.players.includes(player)) {
    stage.players = stage.players.filter(p => p !== player)
  } else {
    stage.players.push(player)
  }
}

const initialize = (game, stage) => {
  const lines = [stage.leftLine, stage.rightLine].concat(stage.extraLines || [])
  const collisionLines = lines.map(line => Collision.line(line.point1, line.point2))
  collisionLines.forEach(line => Tree.add(game.tree, line))

  const triggerLines = [
    Collision.triggerLine(stage.leftLine.point1, stage.rightLine.point1, player => crossStageBorder(stage, player)),
    Collision.triggerLine(stage.leftLine.point2, stage.rightLine.point2, player => crossStageBorder(stage, player))
  ]
  triggerLines.forEach(line => Tree.add(game.tree, line))
  stage.players = stage.players || []

  stage.destruct = () => {
    collisionLines.forEach(line => Tree.remove(game.tree, line))
    triggerLines.forEach(line => Tree.remove(game.tree, line))
    stage.destruct = () => {}
  }
}

const add = (game, stageParam) => {
  const stage = stageParam || create(game)
  if (game.stages.length === 0 || !lastStage(game).goal) {
    game.stages.push(stage)
  } else {
    stage.destruct()
  }
}

export default {
  allLines,
  cage,
  goal,
  add,
  START_CAGE
}
