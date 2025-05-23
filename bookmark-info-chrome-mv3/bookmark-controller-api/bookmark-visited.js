import {
  DATED_TEMPLATE_OPENED,
  DATED_TEMPLATE_VISITED,
} from '../folder-api/index.js';
import {
  getDatedBookmarkList,
  removeDatedBookmarksForTemplate,
} from './bookmark-dated.js';
import {
  createBookmark,
} from './bookmark-create.js';

export async function createBookmarkOpened({ url, title }) {
  const list = await getDatedBookmarkList({ url, template: DATED_TEMPLATE_VISITED })

  if (0 < list.length) {
    return
  }

  await createBookmark({ url, title, parentTitle: DATED_TEMPLATE_OPENED })
}

export async function createBookmarkVisited({ url, title }) {
  await createBookmark({ url, title, parentTitle: DATED_TEMPLATE_VISITED })

  // visited replaces opened
  await removeDatedBookmarksForTemplate({ url, template: DATED_TEMPLATE_OPENED })
}
