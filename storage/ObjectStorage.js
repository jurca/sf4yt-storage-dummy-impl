// @flow

import clone from './clone'

const EMPTY_RECORD = Object.freeze(Object.create(null))

export default class ObjectStorage<E, P> {
  _idProperty: ?string
  _lastId: number = 0
  _records: Array<E> = []
  _idToRecordIndex: Map<P, number> = new Map()

  constructor(idProperty: ?string) {
    this._idProperty = idProperty
  }

  list(
    filter?: (E) => boolean,
    sort?: (E, E) => number,
    offset?: number,
    limit?: number
  ): Array<E> {
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

    return records.map(clone)
  }

  get(id: P): ?E {
    let index: ?number = this._idToRecordIndex.get(id)
    if (typeof index === 'number') {
      return this._records[index]
    }

    return undefined
  }

  add(record: E): P {
    let id: P
    if (this._idProperty) {
      let recordHash: { [property: string]: P } = (record: any)
      id = recordHash[this._idProperty]
    } else {
      id = this.getNextId()
    }

    let clonedRecord = clone(record)
    this._records.push(clonedRecord)
    this._idToRecordIndex.set(id, this._records.length)

    return id
  }

  getNextId(): P {
    let numericId = (++this._lastId: any)
    return (numericId: P)
  }

  update(record: E, id?: P): E {
    let recordId: P
    if (this._idProperty) {
      let recordHash: { [property: string]: P } = (record: any)
      recordId = recordHash[this._idProperty]
      if (!recordId) {
        throw new Error('Missing the record ID')
      }
    } else {
      if (!id) {
        throw new Error('Missing the record ID')
      }
      recordId = id
    }

    let index: ?number = this._idToRecordIndex.get(recordId)
    if (typeof index === 'number') {
      this._records[index] = clone(record)
    } else {
      this.add(record)
    }

    return record
  }

  delete(id: P): void {
    let index: ?number = this._idToRecordIndex.get(id)
    if (typeof index !== 'number') {
      return
    }

    let emptyRecord = (EMPTY_RECORD: any)
    this._records[index] = emptyRecord;
    this._idToRecordIndex.delete(id)
  }
}
