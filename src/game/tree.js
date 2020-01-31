
const create = () => {
  return {
    stages: {},
    unstaged: [],
    all: []
  }
}

const add = (tree, node, stage = null) => {
  tree.all.push(node)
  if (stage && stage.id) {
    if (!tree.stages[stage.id]) {
      tree.stages[stage.id] = []
    }
    tree.stages[stage.id].push(node)
  } else {
    tree.unstaged.push(node)
  }
}

const remove = (tree, node) => {
  // tree.stages = tree.stages.map(stage => stage.filter(n => n !== node))
  tree.unstaged = tree.unstaged.filter(n => n !== node)
  tree.all = tree.all.filter(n => n !== node)
}

const update = (old, replacement) => {
  old.test = replacement.test
  old.force = replacement.force
  old.bounds = replacement.bounds
}

const nodes = (tree, stage) => (stage && stage.id) ? tree.unstaged.concat(tree.stages[stage.id] || []).concat(stage.nextStage ? tree.stages[stage.nextStage.id].concat(stage.nextStage.nextStage ? tree.stages[stage.nextStage.nextStage.id] : []) : []) : tree.all

export default {
  create,
  add,
  remove,
  update,
  nodes
}
