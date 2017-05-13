// @flow

import type { Subscription } from 'sf4yt-storage/model/Subscription'
import SubscriptionState from 'sf4yt-storage/model/SubscriptionState'
import type { IncognitoSubscriptionStorage } from 'sf4yt-storage/IncognitoSubscriptionStorage'
import clone from './storage/clone'
import RecordStorage from './storage/RecordStorage'

export default class IncognitoSubscriptionStorageImpl {
  _records: RecordStorage<Subscription, number|string>

  constructor(records: RecordStorage<Subscription, number|string>) {
    this._records = records

    Object.freeze(this)
  }

  getIncognitoSubscriptions(): Promise<Array<Subscription>> {
    return this._records.query({
      isIncognito: true
    })
  }

  async addIncognitoSubscription(
    subscription: Subscription
  ): Promise<Subscription> {
    if (await this._isSubscriptionPresent(subscription)) {
      throw new Error(
        `The specified incognito subscription to the playlist with ID ` +
        `${subscription.playlist.id} is already present in the storage`
      )
    }

    return this._records.persist(subscription)
  }

  async enableIncognitoSubscription(
    subscription: Subscription
  ): Promise<Subscription> {
    const storedSubscription = await this._records.find(subscription.id)
    if (!storedSubscription) {
      throw new Error(
        `The specified incognito subscription to the playlist with ID ` +
        `${subscription.playlist.id} is not present in the storage`
      )
    }

    storedSubscription.state = SubscriptionState.ACTIVE
    await this._records.persist(storedSubscription)

    return clone(storedSubscription)
  }

  async disableIncognitoSubscription(
    subscription: Subscription
  ): Promise<Subscription> {
    const storedSubscription = await this._records.find(subscription.id)
    if (!storedSubscription) {
      throw new Error(
        `The specified incognito subscription to the playlist with ID ` +
        `${subscription.playlist.id} is not present in the storage`
      )
    }

    storedSubscription.state = SubscriptionState.DISABLED
    await this._records.persist(storedSubscription)

    return clone(storedSubscription)
  }

  removeIncognitoSubscription(
    subscription: Subscription
  ): Promise<void> {
    return this._records.remove(subscription)
  }

  async _isSubscriptionPresent(subscription: Subscription): Promise<boolean> {
    let filter = {
      type: subscription.type,
      playlistId: subscription.playlist.id
    }

    let storedSubscription = await this._records.query(filter)
    return !!storedSubscription
  }
}

let implementsCheck: Class<IncognitoSubscriptionStorage> = IncognitoSubscriptionStorageImpl
