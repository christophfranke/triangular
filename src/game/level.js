import LA from './la'

const MIN_WIDTH = 100
const MAX_WIDTH = 1000
const STAGES_PER_LEVEL = 100
const LINE_MIN_LENGTH = 500
const LINE_MAX_LENGTH = 1000
const MAX_ANGLE_CHANGE = 0.3 * Math.PI
const MAX_ATTEMPT = 10
const MAX_ITERATION = 100000
const START_CAGE = {
  min: LA.v(),
  max: LA.w(MAX_WIDTH)
}

const create = levels => {
  const allLines = () => stages.flatMap(stage => [stage.leftLine, stage.rightLine]).concat(levels.flatMap(level => level.lines))
  let left = levels[levels.length - 1].left
  let right = levels[levels.length - 1].right
  let direction = LA.rotate90(LA.normalize(LA.subtract(right, left)))
  let center = LA.lerp(left, right, 0.5)

  const stages = []
  let attempt = 0
  let i = 0
  while (stages.length < STAGES_PER_LEVEL && i < MAX_ITERATION) {
    i += 1
    // create random rotation, length and width
    const newDirection = LA.rotate(2 * MAX_ANGLE_CHANGE * Math.random() - MAX_ANGLE_CHANGE, direction)
    const length = LINE_MIN_LENGTH + (LINE_MAX_LENGTH - LINE_MIN_LENGTH) * Math.random()
    const width = MIN_WIDTH + (MAX_WIDTH - MIN_WIDTH) * Math.random()

    // calculate new points
    const newCenter = LA.madd(center, length, newDirection)
    const newLeft = LA.madd(newCenter, 0.5 * width, LA.rotate90(newDirection))
    const newRight = LA.madd(newCenter, -0.5 * width, LA.rotate90(newDirection))

    const leftLine = { point1: left, point2: newLeft }
    const rightLine = { point1: right, point2: newRight }
    if (allLines().every(line => !LA.intersect(line, leftLine) && !LA.intersect(line, rightLine))) {
      direction = newDirection
      center = newCenter
      left = newLeft
      right = newRight

      stages.push({
        leftLine,
        rightLine,
        direction,
        center,
        left,
        right,
        attempt
      })

      attempt = 0
    } else {
      attempt += 1

      if (attempt > MAX_ATTEMPT && stages.length > 1) {
        stages.pop()
        const stage = stages[stages.length - 1]
        direction = stage.direction
        center = stage.center
        left = stage.left
        right = stage.right
        attempt = stage.attempt
      }
    }
  }

  const lines = stages.flatMap(stage => [stage.leftLine, stage.rightLine])

  return {
    lines,
    left,
    right
  }
}

const cage = () => {
  const a = START_CAGE.min
  const b = LA.vector(START_CAGE.min.x, START_CAGE.max.y)
  const c = START_CAGE.max
  const d = LA.vector(START_CAGE.max.x, START_CAGE.min.y)
  return {
    lines: [{
      point1: a,
      point2: b
    }, {
      point1: b,
      point2: c
    }, {
      point1: c,
      point2: d
    }],
    left: d,
    right: a
  }
}

export default {
  create,
  cage,
  START_CAGE
}
