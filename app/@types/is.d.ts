// @types/isは別のパッケージの定義なので使わない
declare module 'is' {
  interface Is {
    equal(value1: unknown, value2: unknown): boolean
    string(value: unknown): boolean
    object(value: unknown): boolean
    array(value: unknown): boolean
  }
  const is: Is
  export default is
}
