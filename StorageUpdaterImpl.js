// @flow

import type {StorageUpdater} from 'sf4yt-storage/StorageUpdater'
import type {StorageDataSource} from 'sf4yt-storage/StorageDataSource'
import type {Account} from 'sf4yt-storage/model/Account'
import RecordStorage from './storage/RecordStorage'

export default class StorageUpdaterImpl {
  _accounts: RecordStorage<Account, string>
  _dataSource: StorageDataSource

  constructor(
    accounts: RecordStorage<Account, string>,
    dataSource: StorageDataSource
  ) {
    this._accounts = accounts
    this._dataSource = dataSource

    Object.freeze(this)
  }

  async resolveAccount(accountId: string): Promise<void> {
    const resolvedAccount = await this._dataSource.resolveAccount(accountId)
    await this._accounts.persist(resolvedAccount)
  }

  updateSubscriptions(): Promise<void> {}

  updateVideoViews(ttl: number): Promise<void> {}

  syncWatchedVideos(account: Account): Promise<void> {}
}

let implementsCheck: Class<StorageUpdater> = StorageUpdaterImpl
