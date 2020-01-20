
const create = () => {
  return {
    nodes: []
  }
}

const add = (tree, node) => {
  tree.nodes.push(node)
}

const remove = (tree, node) => {
  tree.nodes = tree.nodes.filter(other => node !== other)
}

const update = (old, replacement) => {
  old.test = replacement.test
  old.force = replacement.force
  old.bounds = replacement.bounds
}

const nodes = (tree, position) => tree.nodes

export default {
  create,
  add,
  remove,
  update,
  nodes
}
