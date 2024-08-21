import {
  clearUrlInTab,
  removeQueryParams,
} from '../clean-url-api.js'

export async function clearUrlInActiveTab() {
  const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  const [activeTab] = tabs;

  if (activeTab?.id && activeTab?.url) {
    const cleanUrl = removeQueryParams(activeTab.url);

    if (activeTab.url !== cleanUrl) {
      await clearUrlInTab({ tabId: activeTab.id, cleanUrl })
    }
  }
}