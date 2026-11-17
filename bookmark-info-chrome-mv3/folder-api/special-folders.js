
import { isDatedTitleForTemplate } from './folder-title-dated.js'

export const BOOKMARKS_BAR_FOLDER_TITLE = 'Bookmarks bar' // Chrome
// export const BOOKMARKS_MENU_FOLDER_TITLE = 'Bookmarks Menu' // Firefox
export const OTHER_BOOKMARKS_FOLDER_TITLE = 'Other bookmarks' // Chrome

export const DATED_ROOT_NEW_FOLDER_TITLE = '@D new'
export const DATED_ROOT_OLD_FOLDER_TITLE = '@D old'
export const DATED_ROOT_SERVICE_FOLDER_TITLE = '@D service'
export const UNCLASSIFIED_TITLE = '@ unclassified'
// export const CONTINUE_TITLE = 'continue'

export const DATED_TEMPLATE_OPENED = 'opened @D'
export const DATED_TEMPLATE_VISITED = 'visited @D'
// export const DATED_TEMPLATE_SELECTED = 'selected @D'
export const DATED_TEMPLATE_DONE = 'DONE @D'

export function isVisitedDatedTemplate(templateTitle) {
  return templateTitle == DATED_TEMPLATE_VISITED
    || templateTitle == DATED_TEMPLATE_OPENED
}

export function isVisitedDatedTitle(title) {
  return (
    (title.startsWith('visited ') && isDatedTitleForTemplate({ title, template: DATED_TEMPLATE_VISITED }))
    || (title.startsWith('opened ') && isDatedTitleForTemplate({ title, template: DATED_TEMPLATE_OPENED }))
  )
}
