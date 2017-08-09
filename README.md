# sf4yt-storage-dummy-impl

Dummy implementation of the Storage interfaces for the Subscription Feed for
YouTube Chrome extension, used for prototyping patterns, testing and debugging.
This is not meant to be used in the final product.

## Findings so far

- This is still way too complex to develop and maintain conveniently,
  especially the `StorageUpdater.updateSubscriptions` method.
- The problem is data consistency. Since the final Chrome extension is supposed
  to be handle multiple Google accounts and "incognito" subscriptions on top of
  that, records need to be normalized in the storage to ensure data consistency
  (multiple Google accounts and even incognito subscriptions can be subsribed
  to the same playlist).
- The `chrome.identity.getAccounts` API is still available only in the dev
  channel (2017-08-09). I am starting to suspect that this will not change as
  it has little use outside of developing on the Chrome platform. Still, there
  are the incognito subscriptions. I can prevent multiple incognito
  subscriptions being duplicates each other, but it can still conflict with
  subscriptions read form a Google account (this is actually wanted, the "real"
  subscription may appear after an incognito subscription has been added, and
  removing the conflicting incognito subscription would probably lead to poor
  UX - it would for me, anyway).
- So, obviously, I would need something like a relational database with foreign
  keys to maintain the data consistency easily; and all I have is an indexed
  document database (Indexed DB).
- Managing data consistency can be done at several placed (TBD):
  - within the storage implementation - the code complexity would be awful, not
    to mention unit-testing the whole thing.
  - a new layer between the indexed-db.es6 and idb-entity - the problem with
    this setup is that the entity manager in idb-entity would not known that
    the nested objects are actually linked records and need to be managed as
    entities to ensure consistency between the record instances in memory.
  - integrating the logic into indexed-db.ess6 - this would result in the same
    issues as a new layer between indexed-db.es6 and idb-entity, plus it would
    increase the complexity of the indexed-db.es6 library (absolutely no).
  - modifying the idb-entity to handle record references (foreign keys) - this
    would increase the complexity of the idb-entity, something I have no
    interest in doing.
  - a new library sitting atop of idb-entity - I'll be free to do this any way
    I need and want, however, it would be impossible to use without the
    idb-entity library even in cases when an entity manager is not needed or
    wanted. It would not be as general-purpose solution, but it might be the
    easiest to implement (partially because of the convenient API provided by
    the idb-entity). Indexed DB itself does not seem to have that much heavy
    usage so even indexed-db.es6 is probably a too powerful tool compared to
    simpler solutions like DB.js for most use cases (e.g. service workers) -
    therefore it might be needless to prepare a more community-friendly
    solution. I guess I'm using the platform in a way it was never intended to
    be used (yet again).
- Even without the data consistency issues, the
  `StorageUpdater.updateSubscriptions` method would still remain complex it was
  intended to be doing all its work in a single transaction, but it involves
  calls to the Google APIs, so it could block the UI for too long.
  - The complexity can be handled by splitting the code into several private
    methods (public methods would introduce chronological dependencies between
    the methods).
  - The logic apparently can - and should - be split into several transactions
    and - possibly - no Google API calls during any transaction with some extra
    consistency checking by hand.
