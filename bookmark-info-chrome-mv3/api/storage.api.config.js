export const STORAGE_TYPE = {
  LOCAL: 'LOCAL',
  SESSION: 'SESSION',
}

const STORAGE_KEY_PROTO = {
  CLEAR_URL_ON_PAGE_OPEN: {
    default: true,
    isUserOption: true,
  },
  SHOW_PREVIOUS_VISIT: {
    default: false,
    isUserOption: true,
  },
  SHOW_BOOKMARK_TITLE: {
    default: false,
    isUserOption: true,
  },
  ADD_BOOKMARK_IS_ON: {
    default: true,
    isUserOption: true,
  },
  ADD_BOOKMARK_LIST_SHOW: {
    default: false,
    storage: STORAGE_TYPE.SESSION,
  },
  ADD_BOOKMARK_LIST_LIMIT: {
    default: 35,
    isUserOption: true,
  },
  ADD_BOOKMARK_TAG_LENGTH: {
    default: 15,
    isUserOption: true,
  },
  ADD_BOOKMARK_HIGHLIGHT_LAST: {
    default: 5,
    isUserOption: true,
  },
  ADD_BOOKMARK_SESSION_STARTED: {
    storage: STORAGE_TYPE.SESSION,
    default: false,
  },
  ADD_BOOKMARK_RECENT_MAP: {
    default: {},
  },
  ADD_BOOKMARK_FIXED_MAP: {
    default: {},
  },
  BROWSER_START_TIME: {
    storage: STORAGE_TYPE.SESSION,
  },
  FORCE_FLAT_FOLDER_STRUCTURE: {
    default: false,
    isUserOption: true,
  },
  HIDE_PAGE_HEADER_FOR_YOUTUBE: {
    default: false,
    isUserOption: true,
  },
  HIDE_TAG_HEADER_ON_PRINTING: {
    default: false,
    isUserOption: true,
  },
}

export const STORAGE_KEY_META = Object.fromEntries(
  Object.entries(STORAGE_KEY_PROTO)
    .map(([key, obj]) => [key, {
      ...obj,
      storageKey: obj.storageKey || key,
      storage: obj.storage || STORAGE_TYPE.LOCAL
    }])
)

export const USER_OPTION_KEY_LIST = Object.entries(STORAGE_KEY_META)
  .filter(([, { isUserOption }]) => isUserOption)
  .map(([key]) => key)

export const USER_OPTION_STORAGE_KEY_LIST = USER_OPTION_KEY_LIST.map((key) => STORAGE_KEY_META[key].storageKey)

export const STORAGE_KEY = Object.fromEntries(
  Object.keys(STORAGE_KEY_META).map((key) => [key, key])
)

export const ADD_BOOKMARK_LIST_MAX = 50


