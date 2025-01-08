import { page } from '../api/page.api.js'

export async function toggleYoutubeHeader() {
  const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  const [activeTab] = tabs;

  if (activeTab?.id) {
    await page.toggleYoutubeHeaderInPage(activeTab.id)
  }
}
