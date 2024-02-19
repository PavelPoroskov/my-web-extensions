import {
  updateActiveTab,
} from '../main-api.js'
import {
  log,
} from '../utils.js'

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