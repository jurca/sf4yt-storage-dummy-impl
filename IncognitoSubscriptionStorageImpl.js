// @flow

import type { Subscription } from 'sf4yt-storage/model/Subscription'
import SubscriptionState from 'sf4yt-storage/model/SubscriptionState'
import type { IncognitoSubscriptionStorage } from 'sf4yt-storage/IncognitoSubscriptionStorage'
import clone from './storage/clone'

// TODO: refactoring
// TODO: distinguish between channel and playlist subscriptions

export default class IncognitoSubscriptionStorageImpl {
  _subscriptions: Map<number, Subscription>
  _lastId: number

  constructor() {
    this._lastId = 0
    this._subscriptions = new Map()
  }

  getIncognitoSubscriptions(): Promise<Array<Subscription>> {
    return Promise.resolve(Array.from(this._subscriptions.values()).map(clone))
  }

  addIncognitoSubscription(subscription: Subscription): Promise<Subscription> {
    if (this._isSubscriptionPresent(subscription)) {
      throw new Error(
        `The specified incognito subscription to the playlist with ID ` +
        `${subscription.playlist.id} is already present in the storage`
      )
    }

    this._subscriptions.set(++this._lastId, clone(subscription))
    return Promise.resolve(subscription)
  }

  enableIncognitoSubscription(
    subscription: Subscription
  ): Promise<Subscription> {
    let storedSubscription = Array.from(this._subscriptions.values()).filter(
      sub => sub.playlist.id === subscription.playlist.id
    )[0]
    if (!storedSubscription) {
      throw new Error(
        `The specified incognito subscription to the playlist with ID ` +
        `${subscription.playlist.id} is not present in the storage`
      )
    }

    storedSubscription.state = SubscriptionState.ACTIVE

    return Promise.resolve(clone(storedSubscription))
  }

  disableIncognitoSubscription(
    subscription: Subscription
  ): Promise<Subscription> {
    let storedSubscription = Array.from(this._subscriptions.values()).filter(
      sub => sub.playlist.id === subscription.playlist.id
    )[0]
    if (!storedSubscription) {
      throw new Error(
        `The specified incognito subscription to the playlist with ID ` +
        `${subscription.playlist.id} is not present in the storage`
      )
    }

    storedSubscription.state = SubscriptionState.DISABLED

    return Promise.resolve(clone(storedSubscription))
  }

  removeIncognitoSubscription(
    subscription: Subscription
  ): Promise<void> {
    for (let [id, sub] of this._subscriptions) {
      if (sub.playlist.id === subscription.playlist.id) {
        this._subscriptions.delete(id)
        return Promise.resolve()
      }
    }

    return Promise.resolve()
  }

  _isSubscriptionPresent(subscription: Subscription): boolean {
    return !!Array.from(this._subscriptions.values()).filter(
      sub => sub.playlist.id === subscription.playlist.id
    )[0]
  }
}

let implementsCheck: Class<IncognitoSubscriptionStorage> = IncognitoSubscriptionStorageImpl
