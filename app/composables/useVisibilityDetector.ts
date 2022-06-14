import { ref, Ref, onMounted, onBeforeUnmount } from 'vue'

interface Detector {
  (isVisible: boolean): void
}

interface IOCallback {
  (entry: IntersectionObserverEntry): void
}

/**
 * IntersectionObserverを利用して要素が画面内に入ったかどうかを検知する
 * @example
 * UseVisibilityDetector.getInstance().add(document.querySelector('#target'), ({ isIntersecting }) => {
 *   if (isIntersecting) {
 *     // 画面内
 *   } else {
 *     // 画面外
 *   }
 * })
 */
class UseVisibilityDetector {
  private static instance: UseVisibilityDetector // eslint-disable-line no-use-before-define

  public static getInstance(): UseVisibilityDetector {
    return this.instance || (this.instance = new UseVisibilityDetector())
  }

  private readonly observer: IntersectionObserver

  private readonly callback = new Map<Element, IOCallback>()

  private constructor(options?: IntersectionObserverInit) {
    this.observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        this.callback.get(entry.target)?.(entry)
      }
    }, options)
  }

  public add(element: HTMLElement, detector: IOCallback) {
    // 同じ要素の監視はさせない
    // 重複してても問題ない気もするので消してもいいかも
    if (this.observer.takeRecords().some(({ target }) => target === element)) {
      console.warn('Element is already observed.', element)
    }
    this.callback.set(element, detector)
    this.observer.observe(element)
  }

  public remove(element: HTMLElement) {
    this.observer.unobserve(element)
    this.callback.delete(element)
  }
}

/**
 * 指定した要素が画面内にいるかどうかの状態を取得する
 * @example
 * const isVisible = useVisibilityDetector(elementRef)
 * @example
 * useVisibilityDetector(elementRef, (isVisible) => {
 *   // 状態が変わるたびに呼ばれる
 * })
 */
export const useVisibilityDetector = (elementRef: Ref<HTMLElement | undefined>, detector?: Detector) => {
  const isVisible = ref(false)
  if (process.server) {
    return isVisible
  }

  let element: HTMLElement

  onMounted(() => {
    if (elementRef.value) {
      element = elementRef.value
      UseVisibilityDetector.getInstance().add(elementRef.value, ({ isIntersecting }) => {
        isVisible.value = isIntersecting
        detector?.(isIntersecting)
      })
    }
  })

  onBeforeUnmount(() => {
    if (element) {
      UseVisibilityDetector.getInstance().remove(element)
    }
  })

  return isVisible
}
