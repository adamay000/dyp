<script lang="ts" setup>
import { ref, watch, nextTick } from 'vue'
import { throttle } from 'throttle-debounce'
import anime from 'animejs'
import ImgWithLoading from '@/components/utilities/ImgWithLoading.vue'
import { useResize } from '@/composables/useResize'
import { clamp, easeInOut3, easeOut3 } from '@/utilities/math'

const { images, animate = false } = defineProps<{
  images: Array<string>
  animate: boolean
}>()

const rootRef = ref<HTMLElement>()
const heroRef = ref<HTMLElement>()
const imagesRef = ref<HTMLElement>()

// props.animateが変更されたタイミングでアニメーションを発火する
watch(
  () => animate,
  async (nextAnimate, prevAnimate) => {
    // imagesRefの要素の表示が切り替わる場合があるので待つ
    await nextTick()

    if (!nextAnimate || prevAnimate || !imagesRef.value) {
      return
    }

    // 再表示時にはスクロール位置を元に戻す
    imagesRef.value.scrollTo(0, 0)
    updateScrollButton()

    // 順番に表示させる(stagger animation)
    anime({
      targets: [...imagesRef.value.querySelectorAll('img')].slice(1),
      easing: () => easeOut3,
      duration: 480,
      delay: anime.stagger(120, { start: 240 }),
      opacity: [0, 1],
      scale: [1.2, 1]
    })
    // gifアイコンは少し遅れて表示させる
    anime({
      targets: [...imagesRef.value.querySelectorAll('.gif')],
      easing: () => easeOut3,
      duration: 480,
      delay: 480,
      opacity: [0, 1]
    })
  },
  { immediate: true }
)

/** 左方向のスクロールボタンの表示 */
let isPreviousVisible = $ref(false)
/** 右方向のスクロールボタンの表示 */
let isNextVisible = $ref(false)
const updateScrollButton = throttle(60, () => {
  const scrollParent = imagesRef.value
  if (!scrollParent) {
    isPreviousVisible = false
    isNextVisible = false
    return
  }

  const { clientWidth, scrollWidth, scrollLeft } = scrollParent
  const maxScrollLeft = scrollWidth - clientWidth
  const isScrollable = maxScrollLeft > 0

  if (!isScrollable) {
    isPreviousVisible = false
    isNextVisible = false
    return
  }

  isPreviousVisible = scrollLeft > 0
  isNextVisible = scrollLeft < maxScrollLeft
})

useResize(updateScrollButton)

/**
 * 指定した方向にスクロールさせる
 * @param direction - 左なら-1、右なら1
 */
const scroll = (direction: 1 | -1) => {
  const scrollParent = imagesRef.value
  if (!scrollParent) {
    return
  }

  const { clientWidth, scrollWidth, scrollLeft } = scrollParent
  const maxScrollLeft = scrollWidth - clientWidth
  const fromScrollLeft = scrollLeft
  const toScrollLeft = clamp(fromScrollLeft + direction * clientWidth * 0.8, 0, maxScrollLeft)
  const diffScrollLeft = toScrollLeft - fromScrollLeft
  anime({
    target: {},
    easing: 'linear',
    duration: 240,
    update: ({ progress }) => {
      const p = easeInOut3(progress / 100)
      scrollParent.scrollTo({
        left: fromScrollLeft + diffScrollLeft * p
      })
    }
  })
}

/** 左方向にスクロールさせる */
const handlePrevious = () => {
  scroll(-1)
}

/** 右方向にスクロールさせる */
const handleNext = () => {
  scroll(1)
}
</script>

<template>
  <ul v-if="images.length" ref="rootRef" class="c-image-list">
    <TransitionGroup name="scroll-button">
      <button
        v-show="isPreviousVisible"
        key="previous"
        class="previous scroll-button -previous"
        @click="handlePrevious"
      />
      <button v-show="isNextVisible" key="next" class="next scroll-button -next" @click="handleNext" />
    </TransitionGroup>
    <div ref="imagesRef" class="scroll" @scroll.passive="updateScrollButton">
      <li v-for="(image, i) in images" :key="image" class="item">
        <div v-if="i === 0" ref="heroRef" class="image">
          <ImgWithLoading :src="image" alt="" :style="{ width: '100%', height: '100%' }" />
        </div>
        <div v-else class="image">
          <ImgWithLoading :src="image" alt="" :style="{ width: '100%', height: '100%' }" />
        </div>
        <span v-if="/\.gif$/i.test(image)" class="gif">gif</span>
      </li>
    </div>
  </ul>
</template>

<style lang="scss" scoped>
.c-image-list {
  overflow: hidden;
  position: relative;
  height: 125px;
  margin: 0 (-$detail-margin-pc);
  @media ($tablet) {
    margin: 0 (-$detail-margin-tablet);
  }
  @media ($sp) {
    margin: 0 (-$detail-margin-sp);
  }
  &::before,
  &::after {
    content: '';
    position: absolute;
    z-index: 1;
    top: -2px;
    bottom: -2px;
    width: $detail-margin-pc;
    @media ($tablet) {
      width: $detail-margin-tablet;
    }
    @media ($sp) {
      width: $detail-margin-sp;
    }
  }
  &::before {
    left: 0;
    background: linear-gradient(
      to left,
      rgba($color-background-secondary, 0),
      rgba($color-background-secondary, 1) 40%
    );
  }
  &::after {
    right: 0;
    background: linear-gradient(
      to right,
      rgba($color-background-secondary, 0),
      rgba($color-background-secondary, 1) 40%
    );
  }
  & > .previous,
  & > .next {
    position: absolute;
    z-index: 2;
    top: 0;
    @media ($sp) {
      display: none;
    }
  }
  & > .previous {
    left: 0;
  }
  & > .next {
    right: 0;
  }
  & > .scroll {
    overflow-x: auto;
    overflow-y: hidden;
    height: 165px;
    padding: 0 $detail-margin-pc;
    white-space: nowrap;
    @media ($tablet) {
      padding: 0 $detail-margin-tablet;
    }
    @media ($sp) {
      padding: 0 $detail-margin-sp;
    }
  }
  & > .scroll > .item {
    display: inline-block;
    position: relative;
    width: 200px;
    height: 125px;
  }
  & > .scroll > .item + .item {
    margin-left: 16px;
  }
  & > .scroll > .item > .image {
    width: 100%;
    height: 100%;
    border: 1px solid rgba(0 0 0 / 0.1);
  }
  & > .scroll > .item > .gif {
    position: absolute;
    bottom: 4px;
    left: 4px;
    padding: 2px 4px;
    background: $color-background-secondary;
    border: 1px solid $color-border-primary;
    letter-spacing: 1px;
    font-size: 10px;
    color: $color-text-secondary;
  }
}

.scroll-button {
  cursor: pointer;
  width: 60px;
  height: 100%;
  &::before,
  &::after {
    content: '';
    position: absolute;
    bottom: 50%;
    width: 3px;
    height: 20px;
    background: $color-background-tertiary;
    border-radius: 6px;
  }
  &.-previous::before,
  &.-previous::after {
    left: 18px;
  }
  &.-next::before,
  &.-next::after {
    right: 18px;
  }
  &.-previous::before {
    transform: translateY(50%) translate3d(0, -8px, 0) rotate(30deg);
  }
  &.-previous::after {
    transform: translateY(50%) translate3d(0, 8px, 0) rotate(-30deg);
  }
  &.-next::before {
    transform: translateY(50%) translate3d(0, -8px, 0) rotate(-30deg);
  }
  &.-next::after {
    transform: translateY(50%) translate3d(0, 8px, 0) rotate(30deg);
  }
  &-enter-active,
  &-leave-active {
    transition: opacity 240ms ease-in-out;
  }
  &-enter-from,
  &-leave-to {
    opacity: 0;
  }
}
</style>
