import {
  getOptions,
  setOptions,
} from '../api-low/index.js'
import {
  INTERNAL_VALUES,
} from '../constant/index.js'

function transformValue(value) {
  if (typeof value ==='string') {
    return {
      parentTitle: value,
      dateAdded: Date.now(),
    }
  }

  return value
}

export async function migration20250706() {
  const savedObj = await getOptions([
    INTERNAL_VALUES.TAG_LIST_FIXED_MAP,
  ]);

  const oldFixedTagObj = savedObj[INTERNAL_VALUES.TAG_LIST_FIXED_MAP] || {}

  const newFixedTagObject = Object.fromEntries(
    Object.entries(oldFixedTagObj).map(([parentId, value]) => [parentId, transformValue(value)])
  )

  await setOptions({
    [INTERNAL_VALUES.TAG_LIST_FIXED_MAP]: newFixedTagObject,
  })
}
