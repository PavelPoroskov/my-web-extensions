const weekdaySet = new Set(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'])
export const isWeekday = (str) => weekdaySet.has(str)

