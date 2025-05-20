import {
  INTERNAL_VALUES,
} from '../constant/index.js'
import {
  setOptions,
  // makeLogFunction,
} from '../api-low/index.js'
import { migration20250520 } from './migration20250520.js'

export async function migration({ from }) {
  let actualFormat = from

  const v20250520 = 20250520
  if (actualFormat < v20250520) {
    await migration20250520()

    actualFormat = v20250520
    await setOptions({
      [INTERNAL_VALUES.DATA_FORMAT]: actualFormat,
    })
  }
}
