import {
  updateActiveTab,
} from '../api/main-api.js'
import {
  log,
} from '../api/debug.js'

export const BkmsController = {
  onCreated: () => {
    log('bkm.onCreated');
    updateActiveTab();
  },
  onChanged: () => {
    log('bkm.onChanged');
    updateActiveTab();
  },
  onMoved: () => {
    log('bkm.onMoved');
    updateActiveTab();
  },
  onRemoved: () => {
    log('bkm.onRemoved');
    updateActiveTab();
  },
}