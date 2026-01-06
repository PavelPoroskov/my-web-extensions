import {
  getTitleDetails,
  getTitleWithDirectives,
} from './folder-directives.js'

const dateFormatter = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric'})
const weekdayFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'short' })
const futureDate = new Date('01/01/2125')
const oneDayMs = 24*60*60*1000
const weekdaySet = new Set(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'])

export const DATED_TEMPLATE_VISITED = 'visited @D'
export const DATED_TEMPLATE_OPENED = 'opened @D'

export const isWeekday = (str) => weekdaySet.has(str)

const inRange = ({ n, from, to }) => {
  if (!Number.isInteger(n)) {
    return false
  }

  if (from != undefined && !(from <= n)) {
    return false
  }

  if (to != undefined && !(n <= to)) {
    return false
  }

  return true
}

export const isDate = (str) => {
  const partList = str.split('-')

  if (!(partList.length == 3)) {
    return false
  }

  const D = parseInt(partList.at(-3), 10)
  const M = parseInt(partList.at(-2), 10)
  const Y = parseInt(partList.at(-1), 10)

  return inRange({ n: D, from: 1, to: 31 }) && inRange({ n: M, from: 1, to: 12 }) && inRange({ n: Y, from: 2025 })
}

export function isDatedFolderTemplate(folderTitle) {
  const { onlyTitle }  = getTitleDetails(folderTitle)

  return onlyTitle.endsWith(' @D') && 3 < folderTitle.length
}

export function getDatedTitle(folderTitle) {
  const { onlyTitle, objDirectives }  = getTitleDetails(folderTitle)
  const fixedPart = onlyTitle.slice(0, -3).trim()

  const today = new Date()
  const sToday = dateFormatter.format(today).replaceAll('/', '-')
  const sWeekday = weekdayFormatter.format(today)

  const days = Math.floor((futureDate - today)/oneDayMs)
  const order = new Number(days).toString(36).padStart(3,'0')

  objDirectives['o'] = order

  return getTitleWithDirectives({
    onlyTitle: `${fixedPart} ${sToday} ${sWeekday}`,
    objDirectives
  })
}

export function compareDatedTitle(a,b) {
  const { onlyTitle: onlyTitleA, objDirectives: objDirectivesA }  = getTitleDetails(a)
  const orderA = objDirectivesA['o']

  const { onlyTitle: onlyTitleB, objDirectives: objDirectivesB }  = getTitleDetails(b)
  const orderB = objDirectivesB['o']

  return (orderA || '').localeCompare(orderB || '') || (onlyTitleA || '').localeCompare(onlyTitleB || '')
}

export function makeCompareDatedTitleWithFixed(a) {
  const { onlyTitle: onlyTitleA, objDirectives: objDirectivesA }  = getTitleDetails(a)
  const orderA = objDirectivesA['o']

  return function compareDatedTitleWithFixed(b) {
    const { onlyTitle: onlyTitleB, objDirectives: objDirectivesB }  = getTitleDetails(b)
    const orderB = objDirectivesB['o']

    return (orderA || '').localeCompare(orderB || '') || (onlyTitleA || '').localeCompare(onlyTitleB || '')
  }
}

export function isDatedFolderTitle(str) {
  const { onlyTitle, objDirectives }  = getTitleDetails(str)

  const partList = onlyTitle.split(' ')

  if (objDirectives['o'] && !(3 <= partList.length)) {
    return false
  }

  const result = isWeekday(partList.at(-1)) && isDate(partList.at(-2)) && !!partList.at(-3)

  return result
}

export function isDatedTitleForTemplate({ title, template }) {
  if (!isDatedFolderTemplate(template)) {
    return false
  }
  if (!isDatedFolderTitle(title)) {
    return false
  }

  const { onlyTitle: onlyTitleTitle }  = getTitleDetails(title)
  const fixedPartFromTitle = onlyTitleTitle.split(' ').slice(0, -2).join(' ')

  const { onlyTitle: onlyTitleTemplate }  = getTitleDetails(title)
  const fixedPartFromTemplate = onlyTitleTemplate.slice(0, -3).trim()

  return fixedPartFromTitle == fixedPartFromTemplate
}

export function getDatedTemplate(title) {
  const { onlyTitle }  = getTitleDetails(title)
  const fixedPartFromTitle = onlyTitle.split(' ').slice(0, -2).join(' ')

  return `${fixedPartFromTitle} @D`
}

export function isVisitedDatedTemplate(templateTitle) {
  return templateTitle == DATED_TEMPLATE_VISITED
    || templateTitle == DATED_TEMPLATE_OPENED
}

export function isVisitedDatedTitle(title) {
  return (
    (title.startsWith('visited ') && isDatedTitleForTemplate({ title, template: DATED_TEMPLATE_VISITED }))
    || (title.startsWith('opened ') && isDatedTitleForTemplate({ title, template: DATED_TEMPLATE_OPENED }))
  )
}
