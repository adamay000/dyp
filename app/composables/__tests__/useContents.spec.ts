import { isDateString } from '@/composables/useContents'

describe('isDateString()', () => {
  test('returns true if the given value is date string', () => {
    expect(isDateString('1970')).toBeTruthy()
    expect(isDateString('1970/01')).toBeTruthy()
    expect(isDateString('1970/01/01')).toBeTruthy()
    expect(isDateString('1970-01-01')).toBeTruthy()
    expect(isDateString('1970-01-01')).toBeTruthy()
    expect(isDateString('1970-01-01')).toBeTruthy()
  })

  test('returns false if the given value is not date string', () => {
    expect(isDateString(null)).toBeFalsy()
    expect(isDateString(undefined)).toBeFalsy()
    expect(isDateString(0)).toBeFalsy()
    expect(isDateString('a')).toBeFalsy()
    expect(isDateString(true)).toBeFalsy()
    expect(isDateString('19700101')).toBeFalsy()
  })
})
