import {
  INTERNAL_VALUES,
} from '../constant/index.js'
import {
  setOptions,
  // makeLogFunction,
} from '../api-low/index.js'
import { migration20250520 } from './migration20250520.js'
import { migration20250706 } from './migration20250706.js'
import { migration20260104 } from './migration20260104.js'
import { migration20260105 } from './migration20260105.js'


export async function migration({ from }) {
  let actualFormat
  let stepFormat

  actualFormat = from

  stepFormat = 20250520
  if (actualFormat < stepFormat) {
    await migration20250520()

    actualFormat = stepFormat
    await setOptions({
      [INTERNAL_VALUES.DATA_FORMAT]: actualFormat,
    })
  }

  stepFormat = 20250706
  if (actualFormat < stepFormat) {
    await migration20250706()

    actualFormat = stepFormat
    await setOptions({
      [INTERNAL_VALUES.DATA_FORMAT]: actualFormat,
    })
  }

  stepFormat = 20260104
  if (actualFormat < stepFormat) {
    await migration20260104()

    actualFormat = stepFormat
    await setOptions({
      [INTERNAL_VALUES.DATA_FORMAT]: actualFormat,
    })
  }

  stepFormat = 20260105
  if (actualFormat < stepFormat) {
    await migration20260105()

    actualFormat = stepFormat
    await setOptions({
      [INTERNAL_VALUES.DATA_FORMAT]: actualFormat,
    })
  }
}
