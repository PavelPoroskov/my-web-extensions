import {
  CONTENT_SCRIPT_MSG_ID,
} from '../../constant/index.js'

export async function toggleYoutubeHeader() {
  const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  const [activeTab] = tabs;

  if (activeTab?.id) {
    const msg = {
      command: CONTENT_SCRIPT_MSG_ID.TOGGLE_YOUTUBE_HEADER,
    }
    await chrome.tabs.sendMessage(activeTab.id, msg)
      .catch(() => {
        // logCU('toggleYoutubeHeader() IGNORE', err)
      })
  }
}