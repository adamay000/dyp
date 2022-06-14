import { onMounted, onBeforeUnmount } from 'vue'
import { throttle } from 'throttle-debounce'

/**
 * resizeイベントを監視する
 * @example
 * ResizeObserver.getInstance().add(() => {
 *   // resizeのたびに呼ばれる
 * })
 */
class ResizeObserver {
  private static instance: ResizeObserver // eslint-disable-line no-use-before-define

  public static getInstance(): ResizeObserver {
    return this.instance || (this.instance = new ResizeObserver())
  }

  private readonly callback = new Set<Function>()

  private constructor() {
    window.addEventListener(
      'resize',
      throttle(60, () => {
        this.callback.forEach((callback) => callback())
      })
    )
  }

  public add(callback: Function) {
    this.callback.add(callback)
  }

  public remove(callback: Function) {
    this.callback.delete(callback)
  }
}

/**
 * resizeイベントを監視する<br>
 * throttleは60ms
 * @example
 * useResize(() => {
 *   // resizeのたびに呼ばれる
 * })
 */
export const useResize = (callback: Function) => {
  if (process.server) {
    return
  }

  onMounted(() => {
    ResizeObserver.getInstance().add(callback)
  })

  onBeforeUnmount(() => {
    ResizeObserver.getInstance().remove(callback)
  })
}
