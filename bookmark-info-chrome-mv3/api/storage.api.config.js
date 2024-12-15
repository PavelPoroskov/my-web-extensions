export const STORAGE_TYPE = {
  LOCAL: 'LOCAL',
  SESSION: 'SESSION',
}

const USER_OPTION_META = {
  CLEAR_URL_ON_PAGE_OPEN: {
    default: true,
  },
  SHOW_PREVIOUS_VISIT: {
    default: false,
  },
  SHOW_BOOKMARK_TITLE: {
    default: false,
  },
  // TODO rename ADD_BOOKMARK_IS_ON -> TAG_LIST_USE
  TAG_LIST_USE: {
    default: true,
  },
  // TODO rename ADD_BOOKMARK_LIST_LIMIT -> TAG_LIST_LIST_LENGTH
  TAG_LIST_LIST_LENGTH: {
    default: 35,
  },
  // TODO rename ADD_BOOKMARK_TAG_LENGTH -> TAG_LIST_TAG_LENGTH
  TAG_LIST_TAG_LENGTH: {
    default: 15,
  },
  // TODO rename ADD_BOOKMARK_HIGHLIGHT_LAST -> TAG_LIST_HIGHLIGHT_LAST
  TAG_LIST_HIGHLIGHT_LAST: {
    default: 7,
  },
  // TODO rename FORCE_FLAT_FOLDER_STRUCTURE -> USE_FLAT_FOLDER_STRUCTURE
  USE_FLAT_FOLDER_STRUCTURE: {
    default: false,
  },
  HIDE_PAGE_HEADER_FOR_YOUTUBE: {
    default: false,
  },
  HIDE_TAG_HEADER_ON_PRINTING: {
    default: false,
  },
}

const INTERNAL_VALUES_META = {
  // TODO rename ADD_BOOKMARK_LIST_SHOW -> TAG_LIST_IS_OPEN
  TAG_LIST_IS_OPEN: {
    default: false,
    storage: STORAGE_TYPE.SESSION,
  },
  // TODO rename ADD_BOOKMARK_SESSION_STARTED -> TAG_LIST_SESSION_STARTED
  TAG_LIST_SESSION_STARTED: {
    default: false,
    storage: STORAGE_TYPE.SESSION,
  },
  // TODO rename ADD_BOOKMARK_RECENT_MAP -> TAG_LIST_RECENT_MAP
  TAG_LIST_RECENT_MAP: {
    default: {},
  },
  // TODO rename ADD_BOOKMARK_FIXED_MAP -> TAG_LIST_FIXED_MAP
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
