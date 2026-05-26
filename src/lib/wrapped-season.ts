/** Dec + Jan — peak “year-end story” season for Year Wrapped. */
export function isYearWrappedPeakSeason(date = new Date()): boolean {
  const month = date.getMonth()
  return month === 11 || month === 0
}
