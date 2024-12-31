export const STORAGE_TYPE = {
  LOCAL: 'LOCAL',
  SESSION: 'SESSION',
}

const TAG_LIST_OPEN_MODE = {
  GLOBAL: 'GLOBAL',
  PER_PAGE: 'PER_PAGE',
  CLOSE_AFTER_ADD: 'CLOSE_AFTER_ADD',
}
export const TAG_LIST_PINNED_TAGS_POSITION_OPTIONS = {
  TOP: 'TOP',
  WITH_RECENT: 'WITH_RECENT',
}

const USER_OPTION_META = {
  CLEAR_URL_ON_PAGE_OPEN: {
    default: true
  },
  HIDE_PAGE_HEADER_FOR_YOUTUBE: {
    default: false
  },
  HIDE_TAG_HEADER_ON_PRINTING: {
    default: false
  },
  SHOW_BOOKMARK_TITLE: {
    default: false
  },
  SHOW_PREVIOUS_VISIT: {
    default: false
  },
  TAG_LIST_HIGHLIGHT_LAST: {
    default: 7
  },
  TAG_LIST_LIST_LENGTH: {
    default: 35
  },
  TAG_LIST_OPEN_MODE: {
    default: TAG_LIST_OPEN_MODE.PER_PAGE,
  },
  TAG_LIST_PINNED_TAGS_POSITION: {
    default: TAG_LIST_PINNED_TAGS_POSITION_OPTIONS.TOP,
  },
  TAG_LIST_TAG_LENGTH: {
    default: 15
  },
  USE_FLAT_FOLDER_STRUCTURE: {
    default: false
  },
  USE_PARTIAL_URL_SEARCH: {
    default: false
  },
  USE_TAG_LIST: {
    default: true
  },
}

const INTERNAL_VALUES_META = {
  TAG_LIST_IS_OPEN: {
    default: false,
    storage: STORAGE_TYPE.SESSION,
  },
  TAG_LIST_SESSION_STARTED: {
    default: false,
    storage: STORAGE_TYPE.SESSION,
  },
  TAG_LIST_RECENT_MAP: {
    default: {},
  },
  TAG_LIST_FIXED_MAP: {
    default: {},
  },
  BROWSER_START_TIME: {
    storage: STORAGE_TYPE.SESSION,
  },
}

const userOptionSet = new Set(Object.keys(USER_OPTION_META))
const internalValuesSet = new Set(Object.keys(INTERNAL_VALUES_META))
const intersectSet = userOptionSet.intersection(internalValuesSet)

if (intersectSet.size > 0) {
  throw new Error(`User options and internal keys has intersection: ${Array.from(intersectSet.keys())}`)
}

// it is used inside getOptions()/setOptions() only
export const STORAGE_KEY_META = Object.fromEntries(
  Object.entries({ ...USER_OPTION_META, ...INTERNAL_VALUES_META })
    .map(([key, obj]) => [key, {
      ...obj,
      storageKey: obj.storageKey || key,
      storage: obj.storage || STORAGE_TYPE.LOCAL
    }])
)

// it is used to read one option value in program code
export const USER_OPTION = Object.fromEntries(
  Object.keys(USER_OPTION_META).map((key) => [key, key])
)
// it is used in extensionSettings to read ALL user options from storage to program
export const USER_OPTION_KEY_LIST = Object.keys(USER_OPTION_META)

// it is used in storage controller to detect user options was changed
export const USER_OPTION_STORAGE_KEY_LIST = USER_OPTION_KEY_LIST.map((key) => STORAGE_KEY_META[key].storageKey)

export const INTERNAL_VALUES = Object.fromEntries(
  Object.keys(INTERNAL_VALUES_META).map((key) => [key, key])
)

// rename ADD_BOOKMARK_LIST_MAX -> TAG_LIST_MAX_LIST_LENGTH
export const TAG_LIST_MAX_LIST_LENGTH = 50
