import { page } from '../api-mid/index.js'

export async function toggleYoutubeHeader() {
  const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  const [activeTab] = tabs;

  if (activeTab?.id) {
    await page.toggleYoutubeHeaderInPage(activeTab.id)
  }
}
