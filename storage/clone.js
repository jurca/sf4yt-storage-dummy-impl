
export default function clone(data) {
  if (!(data instanceof Object)) {
    return data
  }

  let clone = Object.assign({}, data)
  for (let property of Object.keys(data)) {
    let value = data[property];
    if (value instanceof Object) {
      clone[property] = clone(data[property])
    }
  }

  return clone
}
