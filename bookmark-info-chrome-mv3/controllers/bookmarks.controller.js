import {
  updateActiveTab,
} from '../api/main-api.js'
import {
  log,
} from '../api/debug.js'

export const bookmarksController = {
  onCreated() {
    log('bookmark.onCreated');
    updateActiveTab();
  },
  onChanged() {
    log('bookmark.onChanged');
    updateActiveTab();
  },
  onMoved() {
    log('bookmark.onMoved');
    updateActiveTab();
  },
  onRemoved() {
    log('bookmark.onRemoved');
    updateActiveTab();
  },
}