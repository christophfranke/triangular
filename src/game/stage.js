import LA from './la'
import Collision from './collision'
import Tree from './tree'

const MIN_WIDTH = 200
const MAX_WIDTH = 2500
const LINE_MIN_LENGTH = 200
const LINE_MAX_LENGTH = 2500
const MAX_ANGLE_CHANGE = 0.3 * Math.PI
const SINGLE_PLAYER_LENGTH = 50000
const MAX_ATTEMPT = 3
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

const next = (game, forceLength) => {
  const { left, right, direction } = current(game)
  const { newDirection, length, width } = random(direction)

  return {
    length: forceLength || length,
    ...newLines(left, right, newDirection, forceLength || length, width)
  }
}

const test = (game, ...lines) => lines.every(oneLine => allLines(game).every(otherLine => !LA.intersect(oneLine, otherLine)))

const create = (game, forceLength) => {
  let attempt = 0
  while (attempt < MAX_ATTEMPT) {
    attempt += 1

    const { leftLine, rightLine, length } = next(game, forceLength)
    if (test(game, leftLine, rightLine)) {
      const result = {
        leftLine,
        rightLine,
        attempt,
        milage: lastStage(game).milage + length
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

    const { leftLine, rightLine, length } = next(game)
    if (test(game, leftLine, rightLine)) {
      stage.leftLine = leftLine
      stage.rightLine = rightLine
      stage.milage = lastStage(game).milage + length

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
    goal: true,
    milage: lastStage(game).milage,
    onEnter: player => {
      player.winner = true
      player.milage = lastStage(game).milage
      game.stopSoon = true
      game.stages.forEach(stage => {
        stage.owner = player
      })
      game.players.filter(p => p !== player).forEach(other => {
        other.alive = false
      })
      result.destruct()
    }
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
    milage: 0,
    players: [...game.players],
    visited: true
  }

  initialize(game, result)
  return result
}

const crossStageBorder = (stage, player) => {
  stage.fixed = true
  if (stage.players.includes(player)) {
    // leaving stage
    stage.players = stage.players.filter(p => p !== player)
    if (stage.players.length === 0 && !stage.visited) {
      stage.owner = player
    }
    stage.visited = true

    if (stage.onLeave) {
      stage.onLeave(player)
    }
  } else {
    // entering stage
    stage.players.push(player)
    stage.owner = null
    player.stage = stage

    if (stage.onEnter) {
      stage.onEnter(player)
    }
  }
}

const stageLines = stage => [stage.leftLine, stage.rightLine].concat(stage.extraLines || [])
let currentId = 1
const initialize = (game, stage) => {
  stage.id = currentId
  currentId += 1
  const lines = stageLines(stage)
  const collisionLines = lines.map(line => Collision.line(line.point1, line.point2))
  collisionLines.forEach(line => Tree.add(game.tree, line, stage))

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
    if (lastStage(game)) {
      lastStage(game).nextStage = stage
    }
    game.stages.push(stage)
  } else {
    stage.destruct()
  }
}

const DROP_DISTANCE = 3
const dropBehind = game => {
  const minIndex = game.stages.filter(stage => stage.players.length > 0).reduce((min, stage) => Math.min(game.stages.indexOf(stage), min), game.stages.length)
  if (minIndex - DROP_DISTANCE > 0) {
    const dropBefore = minIndex - DROP_DISTANCE
    game.stages.slice(0, dropBefore).forEach(stage => {
      stage.destruct()
    })
    game.stages = game.stages.slice(dropBefore)
  }
}

const CREATE_DISTANCE = 15
const createBeyond = game => {
  const maxIndex = game.stages.filter(stage => stage.players.length > 0).reduce((max, stage) => Math.max(game.stages.indexOf(stage), max), 0)
  if (maxIndex + CREATE_DISTANCE > game.stages.length) {
    const createCount = maxIndex + CREATE_DISTANCE - game.stages.length
    if (game.players.length === 1 && lastStage(game).milage + LINE_MAX_LENGTH >= SINGLE_PLAYER_LENGTH) {
      add(game, create(game, SINGLE_PLAYER_LENGTH - lastStage(game).milage))
      add(game, goal(game))
    } else {
      Array(createCount).fill(null).forEach(() => add(game))
    }
  }
}

const contains = (stage, point) => {
  const center = LA.lerp(LA.lerp(stage.leftLine.point1, stage.leftLine.point2, 0.5), LA.lerp(stage.rightLine.point1, stage.rightLine.point2, 0.5))
  const line = {
    point1: point,
    point2: center
  }

  return !(LA.intersect(line, stage.leftLine) || LA.intersect(line, stage.rightLine) || LA.intersect(line, {
    point1: stage.leftLine.point1,
    point2: stage.rightLine.point1
  }) || LA.intersect(line, {
    point1: stage.leftLine.point2,
    point2: stage.rightLine.point2
  }))
}

export default {
  allLines,
  cage,
  goal,
  add,
  dropBehind,
  createBeyond,
  contains,
  START_CAGE
}
