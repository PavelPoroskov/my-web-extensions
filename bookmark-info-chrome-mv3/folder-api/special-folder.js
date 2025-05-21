import {
  IS_BROWSER_FIREFOX,
} from '../constant/index.js';

export const ROOT_FOLDER_ID = IS_BROWSER_FIREFOX ? 'root________' : '0'
export const BOOKMARKS_BAR_FOLDER_ID = IS_BROWSER_FIREFOX ? 'toolbar_____' : '1'
export const BOOKMARKS_MENU_FOLDER_ID = IS_BROWSER_FIREFOX ? 'menu________' : undefined
export const OTHER_BOOKMARKS_FOLDER_ID = IS_BROWSER_FIREFOX ? 'unfiled_____' : '2'
export const MOBILE_BOOKMARKS_FOLDER_ID = IS_BROWSER_FIREFOX ? 'mobile______' : undefined

// eslint-disable-next-line no-unused-vars
const BUILTIN_BROWSER_FOLDER_MAP = Object.fromEntries(
  [
    ROOT_FOLDER_ID,
    BOOKMARKS_BAR_FOLDER_ID,
    OTHER_BOOKMARKS_FOLDER_ID,

    BOOKMARKS_MENU_FOLDER_ID,
    MOBILE_BOOKMARKS_FOLDER_ID,
  ].filter(Boolean)
    .map((id) => [id, true])
)
export const BUILTIN_BROWSER_ROOT_FOLDER_MAP = Object.fromEntries(
  [
    BOOKMARKS_BAR_FOLDER_ID,
    BOOKMARKS_MENU_FOLDER_ID,
    OTHER_BOOKMARKS_FOLDER_ID
  ].filter(Boolean)
    .map((id) => [id, true])
)

export const DATED_ROOT_NEW = '@D new'
export const DATED_ROOT_OLD = '@D old'
export const UNCLASSIFIED_TITLE = 'zz-bookmark-info--unclassified'

const mapSpecialTitle = new Set([
  DATED_ROOT_NEW,
  DATED_ROOT_OLD,
  UNCLASSIFIED_TITLE,
])

export function isSpecialFolderTitle(title) {
  return mapSpecialTitle.has(title)
}
