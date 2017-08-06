// @flow

import type {StorageUpdater} from 'sf4yt-storage/StorageUpdater'
import type {StorageDataSource} from 'sf4yt-storage/StorageDataSource'

export default class StorageUpdaterImpl {
  _dataSource: StorageDataSource

  constructor(dataSource: StorageDataSource) {
    this._dataSource = dataSource

    Object.freeze(this)
  }

  async resolveAccount(accountId: string): Promise<void> {
    const resolvedAccount = this._dataSource.resolveAccount(accountId)
    // TODO
  }

  updateSubscriptions(): Promise<void> {}

  updateVideoViews(ttl: number): Promise<void> {}

  syncWatchedVideos(account: Account): Promise<void> {}
}

let implementsCheck: Class<StorageUpdater> = StorageUpdaterImpl
