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
