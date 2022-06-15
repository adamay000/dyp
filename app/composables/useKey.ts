import { onMounted, onBeforeUnmount } from 'vue'
import keycode from 'keycode'

export type KeyCode = keyof typeof keycode.codes

/**
 * keyupイベントを監視する
 * @example
 * KeyupObserver.getInstance().add(() => {
 *   // enterを押すたびに呼ばれる
 * }, ['enter'])
 */
class KeyupObserver {
  private static instance: KeyupObserver // eslint-disable-line no-use-before-define

  public static getInstance(): KeyupObserver {
    return this.instance || (this.instance = new KeyupObserver())
  }

  private readonly callback = new Set<(event: KeyboardEvent) => void>()

  private constructor() {
    document.addEventListener('keyup', (event: KeyboardEvent) => {
      this.callback.forEach((callback) => callback(event))
    })
  }

  public add(callback: (event: KeyboardEvent) => void) {
    this.callback.add(callback)
  }

  public remove(callback: (event: KeyboardEvent) => void) {
    this.callback.delete(callback)
  }
}

/**
 * keyupイベントを監視する
 * @example
 * useKeyup((key: KeyCode, event: KeyboardEvent) => {
 *   // enterを押すたびに呼ばれる
 * }, ['enter'])
 */
export const useKeyup = (originalCallback: (key: KeyCode, event: KeyboardEvent) => void, keys: Array<KeyCode> = []) => {
  if (process.server) {
    return
  }

  const callback = (event: KeyboardEvent) => {
    const pressedKey = keycode(keycode(event))

    const targetKey = keys.filter((key) => keycode(key) === pressedKey)[0]
    if (targetKey != null) {
      originalCallback(targetKey, event)
    }
  }

  onMounted(() => {
    KeyupObserver.getInstance().add(callback)
  })

  onBeforeUnmount(() => {
    KeyupObserver.getInstance().remove(callback)
  })
}
