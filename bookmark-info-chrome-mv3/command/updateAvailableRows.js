import {
  extensionSettings,
  tagList,
} from '../data-structures/index.js'
import {
  INTERNAL_VALUES,
} from '../constant/index.js'

export async function updateAvailableRows(availableRows) {
  await extensionSettings.update({
    [INTERNAL_VALUES.TAG_LIST_AVAILABLE_ROWS]: availableRows,
  })
  await tagList.updateAvailableRows(availableRows)
}
