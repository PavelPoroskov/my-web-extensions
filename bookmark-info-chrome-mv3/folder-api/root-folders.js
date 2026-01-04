import {
  IS_BROWSER_FIREFOX,
} from '../constant/index.js';

class RootFolders {
  BOOKMARKS_BAR_FOLDER_ID = 'toolbar_____'
  BOOKMARKS_MENU_FOLDER_ID = 'menu________'
  OTHER_BOOKMARKS_FOLDER_ID = 'unfiled_____'

  IdList = [
    this.BOOKMARKS_BAR_FOLDER_ID,
    this.BOOKMARKS_MENU_FOLDER_ID,
    this.OTHER_BOOKMARKS_FOLDER_ID
  ]
  IdMap = Object.fromEntries(
    this.IdList
      .filter(Boolean)
      .map((id) => [id, true])
  )

  _isActual = IS_BROWSER_FIREFOX ? true : false
  isActual() {
    return this._isActual
  }

  async init() {
    this.BOOKMARKS_BAR_FOLDER_ID = undefined
    this.BOOKMARKS_MENU_FOLDER_ID = undefined
    this.OTHER_BOOKMARKS_FOLDER_ID = undefined
    this.IdList = []

    const [rootFolder] = await chrome.bookmarks.getTree()

    for (const rootSubfolder of rootFolder.children) {
      if (rootSubfolder.url) {
        continue
      }

      let addToList = true
      switch (rootSubfolder.title) {
        // Chrome
        case 'Bookmarks bar': {
          this.BOOKMARKS_BAR_FOLDER_ID = rootSubfolder.id
          break
        }
        case 'Other bookmarks': {
          this.OTHER_BOOKMARKS_FOLDER_ID = rootSubfolder.id
          break
        }

        // // Firefox
        // case 'Bookmarks Toolbar': {
        //   this.BOOKMARKS_BAR_FOLDER_ID = rootSubfolder.id
        //   break
        // }
        // case 'Bookmarks Menu': {
        //   this.BOOKMARKS_MENU_FOLDER_ID = rootSubfolder.id
        //   break
        // }
        // case 'Other Bookmarks': {
        //   this.OTHER_BOOKMARKS_FOLDER_ID = rootSubfolder.id
        //   break
        // }
        default: {
          addToList = false
        }
      }

      if (addToList) {
        this.IdList.push(rootSubfolder.id)
      }
    }

    this.IdMap = Object.fromEntries(
      this.IdList
        .filter(Boolean)
        .map((id) => [id, true])
    )

    this._isActual = true
  }
}

export const rootFolders = new RootFolders()
