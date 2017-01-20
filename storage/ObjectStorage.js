// @flow

import clone from './clone'

export default class ObjectStorage<E, P> {
  _idProperty: ?string
  _lastId: number = 0
  _records: Array<E> = []
  _idToRecord: Map<P, E> = new Map()

  constructor(idProperty: ?string) {
    this._idProperty = idProperty
  }

  list(
    filter?: (E) => boolean,
    sort?: (E, E) => number,
    offset?: number,
    limit?: number
  ): Promise<Array<E>> {
    let records = this._records
    if (filter) {
      records = records.filter(filter)
    }
    if (sort) {
      records = records.sort(sort)
    }
    if (offset) {
      records = records.slice(offset)
    }
    if (limit) {
      records = records.slice(0, limit)
    }

    return Promise.resolve(records.map(clone))
  }

  get(id: P): Promise<?E> {
    return Promise.resolve(this._idToRecord.get(id))
  }

  add(record: E): Promise<P> {
    let id: P
    if (this._idProperty) {
      let recordHash: { [property: string]: P } = (record: any)
      id = recordHash[this._idProperty]
    } else {
      let numericId = (++this._lastId: any)
      id = (numericId: P)
    }

    let clonedRecord = clone(record)
    this._records.push(clonedRecord)
    this._idToRecord.set(id, clonedRecord)

    return Promise.resolve(id)
  }

  update(record: E, id?: P): Promise<E> {}

  delete(record: E): Promise<void> {}
}
