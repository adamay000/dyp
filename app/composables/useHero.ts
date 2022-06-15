import { reactive, ref, onMounted, UnwrapNestedRefs, CSSProperties } from 'vue'
import { ZIndexProperty } from 'csstype'
import anime from 'animejs'
import { useVisibilityDetector } from '@/composables/useVisibilityDetector'
import { AnimationWatcher } from '@/utilities/animationWatcher'
import { easeInOut3 } from '@/utilities/math'

/** アニメーション中の要素の座標 */
interface HeroRect {
  top: number
  left: number
  width: number
  height: number
}

/** アニメーションさせる要素に適用するスタイル */
interface HeroStyle extends Partial<CSSProperties> {
  display: 'block' | 'none'
  position: 'fixed'
  zIndex: ZIndexProperty
  top: string
  left: string
  width: string
  height: string
  opacity: string
}

/** 移動元の要素を元に座標を設定する */
function setPosition(position: UnwrapNestedRefs<HeroRect>, baseElement?: HTMLElement) {
  const rect = baseElement?.getBoundingClientRect()
  if (!rect || rect.width === 0 || rect.height === 0) {
    return false
  }

  position.top = rect.top
  position.left = rect.left
  position.width = rect.width
  position.height = rect.height

  return true
}

/** アニメーション中の要素の座標を更新する
 * @param position - 座標を保持している変数
 * @param progress - アニメーションの進捗率(0-1)
 * @param fromElement - 移動元の要素
 * @param toElement - 移動先の要素
 */
function updatePosition(
  position: UnwrapNestedRefs<HeroRect>,
  progress: number,
  fromElement?: HTMLElement,
  toElement?: HTMLElement
) {
  const fromRect = fromElement?.getBoundingClientRect()
  if (!fromRect || fromRect.width === 0 || fromRect.height === 0) {
    return false
  }
  const toRect = toElement?.getBoundingClientRect()
  if (!toRect || toRect.width === 0 || toRect.height === 0) {
    return false
  }

  position.top = fromRect.top + (toRect.top - fromRect.top) * progress
  position.left = fromRect.left + (toRect.left - fromRect.left) * progress
  position.width = fromRect.width + (toRect.width - fromRect.width) * progress
  position.height = fromRect.height + (toRect.height - fromRect.height) * progress

  return true
}

/** heroアニメーション<br>
 * 移動元と移動先の要素は別のelementとして存在していて、<br>
 * さらに別に移動中の要素もある(トータルで3つの同じ要素が存在することになる)
 */
export const useHero = (
  duration: number,
  onProgress?: (params: {
    progress: number
    isFromVisible: boolean
    isToVisible: boolean
    direction: 'normal' | 'reverse'
  }) => void
) => {
  const currentPosition: HeroRect = {
    top: 0,
    left: 0,
    width: 0,
    height: 0
  }

  const heroStyle = reactive<HeroStyle>({
    display: 'none',
    position: 'fixed',
    zIndex: 99999,
    top: '0px',
    left: '0px',
    width: '0px',
    height: '0px',
    opacity: '0'
  })

  const fromRef = ref<HTMLElement>()
  const toRef = ref<HTMLElement>()
  const heroRef = ref<HTMLElement>()

  if (process.server) {
    return {
      fromRef,
      toRef,
      heroRef,
      heroStyle,
      play: () => {},
      reverse: () => {},
      heroDuration: duration
    }
  }

  onMounted(() => {
    heroRef.value?.style.setProperty('pointer-events', 'none')
  })

  // 移動先か移動元が画面内に表示されていない場合はアニメーションさせないようにしたい
  // IntersectionObserverで監視して画面内に表示されているかどうかを持っておく
  const isFromVisible = $(useVisibilityDetector(fromRef))
  const isToVisible = $(useVisibilityDetector(toRef))

  const animationWatchers = new AnimationWatcher()
  const animation = anime.timeline({ autoplay: false }).add({
    targets: {},
    easing: 'linear',
    duration,
    complete: () => {
      animationWatchers.resolve()
    },
    changeComplete: () => {
      animationWatchers.resolve()
    },
    update: ({ progress }) => {
      const p = easeInOut3(progress / 100)

      // 移動中は移動元と移動先の要素を非表示にする
      fromRef.value?.style.setProperty('opacity', p > 0 ? '0' : '1')
      toRef.value?.style.setProperty('opacity', p < 1 ? '0' : '1')

      // 移動中のみ表示させる
      if (p === 0 || p === 1) {
        heroStyle.display = 'none'
      } else {
        heroStyle.display = 'block'

        // 移動元と移動先の要素が両方画面内にある場合は通常のアニメーションをさせる
        if (isFromVisible && isToVisible) {
          updatePosition(currentPosition, p, fromRef.value, toRef.value)
          heroStyle.opacity = '1'
        } else {
          // 移動先だけが表示されている場合は、translateのアニメーションはさせずに移動先の位置でフェードインさせる
          if (!isFromVisible && isToVisible) {
            updatePosition(currentPosition, 0, toRef.value, toRef.value)
            heroStyle.opacity = `${p}`
          }
          // 移動元だけが表示されている場合は、translateのアニメーションはさせずに移動元の位置でフェードインさせる
          if (isFromVisible && !isToVisible) {
            updatePosition(currentPosition, 0, fromRef.value, fromRef.value)
            heroStyle.opacity = `${1 - p}`
          }
        }
        heroStyle.top = `${currentPosition.top}px`
        heroStyle.left = `${currentPosition.left}px`
        heroStyle.width = `${currentPosition.width}px`
        heroStyle.height = `${currentPosition.height}px`
      }

      onProgress?.({
        progress: p,
        isFromVisible,
        isToVisible,
        direction: animation.direction === 'normal' ? 'normal' : 'reverse'
      })

      // 'complete'のコールバックはreverseアニメーションの終了時(leaveが終わった時)には呼ばれないことがある
      // (おそらくnormalアニメーションの途中でreverse()メソッドが呼ばれないといけない？)
      // そのため'complete'だけでなく'update'のコールバックでもアニメーションの終了を検知する
      if (
        (animation.direction === 'reverse' && progress === 0) ||
        (animation.direction === 'normal' && progress === 100)
      ) {
        animationWatchers.resolve()
      }
    }
  })

  const checkRef = () => {
    // 移動元と移動先の要素にrefが設定されてないorマウントしてない場合はアニメーションさせない
    if (!fromRef.value) {
      console.warn('Failed to play hero animation because fromRef is not mounted.')
      return false
    }
    if (!toRef.value) {
      console.warn('Failed to play hero animation because toRef is not mounted.')
      return false
    }
    if (!heroRef.value) {
      console.warn('Failed to play hero animation because heroRef is not mounted.')
      return false
    }
    return true
  }

  /** from->to方向のアニメーション */
  const play = () => {
    if (!checkRef()) {
      return
    }

    if (animation.progress === 0 && !setPosition(currentPosition, fromRef.value)) {
      console.warn('Failed to play hero animation because fromRef is not visible.')
      return
    }

    const promise = animationWatchers.create()
    if (animation.direction === 'reverse') animation.reverse()
    animation.play()
    return promise
  }

  /** to->from方向のアニメーション */
  const reverse = () => {
    if (!checkRef()) {
      return
    }

    if (animation.progress === 1 && !setPosition(currentPosition, toRef.value)) {
      console.warn('Failed to play hero animation because toRef is not visible.')
      return
    }

    const promise = animationWatchers.create()
    if (animation.direction === 'normal') animation.reverse()
    animation.play()
    return promise
  }

  return {
    fromRef,
    toRef,
    heroRef,
    heroStyle,
    play,
    reverse,
    heroDuration: duration
  }
}
