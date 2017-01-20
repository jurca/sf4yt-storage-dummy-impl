// @flow

import type { Account } from 'sf4yt-storage/model/Account'
import AccountState from 'sf4yt-storage/model/AccountState'
import type { AccountStorage } from 'sf4yt-storage/AccountStorage'
import clone from './storage/clone'

export default class AccountStorageImpl {
  _accounts: Map<string, Account>

  constructor() {
    this._accounts = new Map()
  }

  getAccounts(): Promise<Array<Account>> {
    return Promise.resolve(Array.from(this._accounts.values()).map(clone))
  }

  addAccount(account: Account): Promise<Account> {
    if (this._accounts.has(account.id)) {
      throw new Error(
        `There already is an account with ID ${account.id} in the storage`
      )
    }

    this._accounts.set(account.id, clone(account))
    return Promise.resolve(account)
  }

  enableAccount(account: Account): Promise<Account> {
    let storedAccount = this._accounts.get(account.id)
    if (!storedAccount) {
      throw new Error(
        `The specified account (ID ${account.id}) is not in the storage`
      )
    }

    storedAccount.state = AccountState.ACTIVE
    return Promise.resolve(clone(storedAccount))
  }

  disableAccount(account: Account): Promise<Account> {
    let storedAccount = this._accounts.get(account.id)
    if (!storedAccount) {
      throw new Error(
        `The specified account (ID ${account.id}) is not in the storage`
      )
    }

    storedAccount.state = AccountState.DISABLED
    return Promise.resolve(clone(storedAccount))
  }

  removeAccount(account: Account): Promise<void> {
    this._accounts.delete(account.id)

    return Promise.resolve()
  }
}

let implementsCheck: Class<AccountStorage> = AccountStorageImpl
