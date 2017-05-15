// @flow

import type { Video } from 'sf4yt-storage/model/Video'
import type { VideoStorage } from 'sf4yt-storage/VideoStorage'
import RecordStorage from './storage/RecordStorage'

export default class VideoStorageImpl {
  _records: RecordStorage<Video, string>

  constructor(recordStorage: RecordStorage<Video, string>) {
    this._records = recordStorage

    Object.freeze(this)
  }

  getVideos(
      query: ?string,
      since: Date,
      until: Date,
      maxVideos: number,
      includeWatched: boolean
  ): Promise<Array<Video>> {
    let filter: {publishedAt: IDBKeyRange, watched?: boolean} = {
      publishedAt: IDBKeyRange.bound(since, until)
    }
    if (!includeWatched) {
      filter.watched = false
    }
    return this._records.query(filter, '!publishedAt', 0).then(videos => {
      if (!query) {
        return videos.slice(0, maxVideos)
      }

      return videos.filter(
        video => video.title.includes(((query: any): string))
      ).slice(0, maxVideos)
    })
  }

  markAsWatched(video: Video): Promise<Video> {
    video.watched = true
    return this._records.persist(video)
  }
}

let implementsCheck1: Class<VideoStorage> = VideoStorageImpl

// it looks like flow does not have complete type declarations for IndexedDB :(
declare class IDBKeyRange {
  static bound(lower: any, upper: any): IDBKeyRange
}
