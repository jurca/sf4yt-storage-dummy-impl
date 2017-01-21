// @flow

import ObjectStorage from './ObjectStorage'

export default class RecordStorage<E, P> {
  _idProperty: string
  _storage: ObjectStorage<E, P>

  constructor(idProperty: string) {
    this._idProperty = idProperty
    this._storage = new ObjectStorage(idProperty)

    Object.freeze(this)
  }

  find(primaryKey: P): Promise<?E> {
    let record = this._storage.get(primaryKey)
    return Promise.resolve(record)
  }

  query(
    filter: P|IDBKeyRange|Array<P|IDBKeyRange>|{ [property: string]: any }|(E, P) => boolean,
    order: string|Array<string>|(E, E) => number,
    offset?: number,
    limit?: number
  ): Promise<Array<E>> {
    if (
        filter instanceof Date ||
        filter instanceof IDBKeyRange ||
        !(filter instanceof Object)
    ) {
      filter = {
        [this._idProperty]: filter
      }
    }
    if (typeof filter !== 'function') {
      filter = compileFilter(filter)
    }

    if (typeof order === 'string') {
      order = [order]
    }
    if (order instanceof Array) {
      order = compileSorter(order)
    }

    let records = this._storage.list(filter, order, offset, limit)

    return Promise.resolve(records)
  }

  persist(record: E): Promise<E> {
    let recordHash: { [property: string]: P } = (record: any)
    let id: ?P = recordHash[this._idProperty]

    if (id) {
      this._storage.update(record)
    } else {
      recordHash[this._idProperty] = this._storage.getNextId()
      this._storage.add(record)
    }

    return Promise.resolve(record)
  }

  remove(record: E): Promise<void> {
    let recordHash: { [property: string]: P } = (record: any)
    let id: P = recordHash[this._idProperty]
    this._storage.delete(id)
    return Promise.resolve()
  }
}

function compileFilter<E>(
  template: { [property: string]: any }
): (E) => boolean {
  return entity => {
    let entityHash: { [property: string]: any } = (entity: any)
    for (let property of Object.keys(template)) {
      let entityValue = entityHash[property]
      if (entityValue instanceof Date) {
        entityValue = entityValue.valueOf()
      } else if (entityValue instanceof Array) {
        entityValue = entityValue.map(value =>
          value instanceof Date ? value.valueOf() : value
        )
      }

      let templateValue = template[property]
      if (templateValue instanceof Date) {
        templateValue = templateValue.valueOf()
      } else if (templateValue instanceof Array) {
        templateValue = templateValue.map(value =>
          value instanceof Date ? value.valueOf() : value
        )
      }

      if (templateValue instanceof IDBKeyRange) {
        let lowerBound = templateValue.lower
        let upperBound = templateValue.upper
        if (lowerBound instanceof Date) {
          lowerBound = lowerBound.valueOf()
        }
        if (upperBound instanceof Date) {
          upperBound = upperBound.valueOf()
        }

        let match = false
        if (!templateValue.lowerOpen) {
          match = match || lowerBound === entityValue
        }
        if (!templateValue.upperOpen) {
          match = match || upperBound === entityValue
        }
        match = match || (lowerBound < entityValue && entityValue < upperBound)
        if (!match) {
          return false
        }
      } else if (templateValue instanceof Array) {
        if (!templateValue.includes(entityValue)) {
          return false
        }
      } else if (entityValue instanceof Array) {
        if (!entityValue.includes(templateValue)) {
          return false
        }
      } else {
        if (templateValue !== entityValue) {
          return false
        }
      }
    }

    return true
  }
}

function compileSorter<E>(paths: Array<string>): (E, E) => number {
  let getters = paths.map(path => path.replace(/^!/, '')).map(createGetter)
  let reverse = paths.map(path => /^!/.test(path))

  return (e1, e2) => {
    for (let i = 0; i < getters.length; i++) {
      let getter = getters[i]
      let reversePart = reverse[i]
      let value1 = getter(e1)
      let value2 = getter(e2)

      if (value1 < value2) {
        return reversePart ? 1 : -1
      } else if (value1 > value2) {
        return reversePart ? -1 : 1
      }
    }

    return 0
  }
}

function createGetter<O>(path: string): (O) => any {
  let part = path.split('.')

  return object => {
    let currentValue: any = object
    for (let fieldName of part) {
      if (!(currentValue instanceof Object)) {
        return currentValue
      }
      currentValue = currentValue[fieldName]
    }
    return currentValue
  }
}
