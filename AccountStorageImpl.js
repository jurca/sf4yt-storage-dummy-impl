// @flow

import type { Account } from 'sf4yt-storage/model/Account'
import AccountState from 'sf4yt-storage/model/AccountState'
import type { AccountStorage } from 'sf4yt-storage/AccountStorage'
import clone from './storage/clone'
import RecordStorage from './storage/RecordStorage'

export default class AccountStorageImpl {
  _accounts: RecordStorage<Account, string>

  constructor(accounts: RecordStorage<Account, string>) {
    this._accounts = accounts

    Object.freeze(this)
  }

  getAccounts(): Promise<Array<Account>> {
    return this._accounts.query(_ => true, "title")
  }

  async addAccount(account: Account): Promise<Account> {
    if (await this._accounts.find(account.id)) {
      throw new Error(
        `There already is an account with the ${account.id} ID in the storage`
      )
    }

    return this._accounts.persist(account)
  }

  async enableAccount(account: Account): Promise<Account> {
    let storedAccount = await this._accounts.find(account.id)
    if (!storedAccount) {
      throw new Error(
        `The specified account (ID ${account.id}) is not in the storage`
      )
    }

    storedAccount.state = AccountState.ACTIVE
    return this._accounts.persist(storedAccount)
  }

  async disableAccount(account: Account): Promise<Account> {
    let storedAccount = await this._accounts.find(account.id)
    if (!storedAccount) {
      throw new Error(
        `The specified account (ID ${account.id}) is not in the storage`
      )
    }

    storedAccount.state = AccountState.DISABLED
    return this._accounts.persist(storedAccount)
  }

  removeAccount(account: Account): Promise<void> {
    return this._accounts.remove(account)
  }
}

let implementsCheck: Class<AccountStorage> = AccountStorageImpl
