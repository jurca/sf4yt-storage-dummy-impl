// @flow

import type {StorageUpdater} from 'sf4yt-storage/StorageUpdater'
import type {StorageDataSource} from 'sf4yt-storage/StorageDataSource'
import type {Account} from 'sf4yt-storage/model/Account'
import AccountState from 'sf4yt-storage/model/AccountState.js'
import type {Subscription} from 'sf4yt-storage/model/Subscription'
import RecordStorage from './storage/RecordStorage'

export default class StorageUpdaterImpl {
  _accounts: RecordStorage<Account, string>
  _subscriptions: RecordStorage<Subscription, number|string>
  _dataSource: StorageDataSource

  constructor(
    accounts: RecordStorage<Account, string>,
    subscriptions: RecordStorage<Subscription, number|string>,
    dataSource: StorageDataSource
  ) {
    this._accounts = accounts
    this._subscriptions = subscriptions
    this._dataSource = dataSource

    Object.freeze(this)
  }

  async resolveAccount(accountId: string): Promise<void> {
    const resolvedAccount = await this._dataSource.resolveAccount(accountId)
    await this._accounts.persist(resolvedAccount)
  }

  async updateSubscriptions(): Promise<void> {
    const accounts = await this._accounts.query(
      account => !account.channel && account.state !== AccountState.DISABLED,
      "id"
    )
    for (const account of accounts) {
      const fetchedSubscriptions = await this._dataSource.fetchSubscriptions(
          account
      )
      const knownSubscriptions = await this._subscriptions.query("", "id")
      for (const fetchedSubscription of fetchedSubscriptions) {
        const knownSubscription = knownSubscriptions.find(
          subscription => subscription.playlist === fetchedSubscription.playlist
        )
        if (knownSubscription) {
          // TODO: update the playlist and channel with the current data
        } else {
          await this._subscriptions.persist(fetchedSubscription);
        }
      }
      for (const knownSubscription of knownSubscriptions) {
        const wasFetched = !!knownSubscriptions.find(
          subscription => subscription.playlist === knownSubscription.playlist
        )
        if (!wasFetched) {
          await this._subscriptions.remove(knownSubscription)
        }
      }
    }

    // TODO: update incognito subscriptions (including embedded playlists and channels)
    // TODO: fetch new videos for all playlists
  }

  updateVideoViews(ttl: number): Promise<void> {}

  syncWatchedVideos(account: Account): Promise<void> {}
}

let implementsCheck: Class<StorageUpdater> = StorageUpdaterImpl
