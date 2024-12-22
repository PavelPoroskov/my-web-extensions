import {
  toggleYoutubeHeaderInPage,
} from '../content-script.api.js'

export async function toggleYoutubeHeader() {
  const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  const [activeTab] = tabs;

  if (activeTab?.id) {
    await toggleYoutubeHeaderInPage(activeTab.id)
  }
}