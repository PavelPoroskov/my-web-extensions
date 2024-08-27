import {
  OTHER_BOOKMARKS_FOLDER_ID,
} from '../special-folder.api.js'
import {
  flatBookmarks,
} from '../flat-structure-api.js'

// TODO only method onBookmarkCreated/Changed/Moved/Removed
//  inside if (node.url)

class SortFoldersService {
  folderList = []
  insertFolderMap = {}
  isUsingFlatFolderStructure = false

  bookmarkOnCreated = () => {}
  bookmarkOnChanged = () => {}
  bookmarkOnMoved = () => {}
  bookmarkOnRemoved = () => {}
  tabOnActivated = () => {}

  async start() {
    await flatBookmarks()

    const nodeList = await chrome.bookmarks.getChildren(OTHER_BOOKMARKS_FOLDER_ID)
  
    this.folderList = nodeList
      .filter(({ url }) => !url)
      .map(({ id, index: bkmIndex, title }, arrIndex) => ({ id, title, bkmIndex, arrIndex }))
  
    this.isUsingFlatFolderStructure = true

    this.bookmarkOnCreated = this.bookmarkOnCreatedActive
    this.bookmarkOnChanged = this.bookmarkOnChangedActive
    this.bookmarkOnMoved = this.bookmarkOnMovedActive
    this.bookmarkOnRemoved = this.bookmarkOnRemovedActive
    this.tabOnActivated = this.tabOnActivatedActive
  }
  async sort() {
    // if (!this.isUsingFlatFolderStructure) {
    //   return
    // }

    if (Object.keys(this.insertFolderMap).length === 0) {
      return
    }
    // get list from this.insertFolderMap
    //  remove from this.insertFolderMap
    // sort list
    // calculate new indexes for item
    // move item to new index
    // update indexes after
  }

  async bookmarkOnCreatedActive(node) {
    if (node.url) {
      await this.sort()
    } else {
      await this.sort()

      if (node.parentId === OTHER_BOOKMARKS_FOLDER_ID) {
        this.insertFolderMap[node.id] = node.title
      } else {
        // move to root
        // sort
      }
    }
  }
  async bookmarkOnChangedActive(node) {
    if (node.url) {
      const title = this.insertFolderMap[node.parentId]
      delete this.insertFolderMap[node.parentId]
      await this.sort()
  
      if (title) {
        this.insertFolderMap[node.parentId] = title
      }
    } else {
      await this.sort()

      if (node.parentId === OTHER_BOOKMARKS_FOLDER_ID) {
        this.insertFolderMap[node.id] = node.title
      }
    }
  }
  async bookmarkOnMovedActive(node, changeInfo) {
    if (node.url) {
      const title = this.insertFolderMap[node.parentId]
      delete this.insertFolderMap[node.parentId]
      await this.sort()
  
      if (title) {
        this.insertFolderMap[node.parentId] = title
      }
    } else {
      if (changeInfo.oldParentId === OTHER_BOOKMARKS_FOLDER_ID) {
        delete this.insertFolderMap[node.id]
      }
      await this.sort()
  
      if (changeInfo.parentId === OTHER_BOOKMARKS_FOLDER_ID) {
        this.insertFolderMap[node.id] = node.title
      } else {
        // move to root
        // sort
      }
    }
  }
  async bookmarkOnRemovedActive(node) {
    if (node.url) {
      const title = this.insertFolderMap[node.parentId]
      delete this.insertFolderMap[node.parentId]
      await this.sort()
  
      if (title) {
        this.insertFolderMap[node.parentId] = title
      }
    } else {
      delete this.insertFolderMap[node.id]
      await this.sort()
    }
  }

  async tabOnActivatedActive() {

  }
}

export const sortFoldersService = new SortFoldersService()
