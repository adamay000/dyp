<script lang="ts" setup>
import { ref, watchEffect } from 'vue'
import SkeletonLoading from '@/components/utilities/SkeletonLoading.vue'
import { useVisibilityDetector } from '@/composables/useVisibilityDetector'

const { src, alt } = defineProps<{
  src: string
  alt?: string
}>()

const rootRef = ref<HTMLElement>()
let isReady = $ref(false)
let isError = $ref(false)
let lastSrc = $ref('')

const isVisible = $(useVisibilityDetector(rootRef))

const clear = () => {
  isReady = false
  isError = false
}

const load = () => {
  if (lastSrc === src || src === '') {
    return
  }
  const loadingSrc = src
  lastSrc = src

  const image = new Image()
  image.src = src

  // キャッシュされていて読み込み済みの場合は読み込みを監視しない
  if (image.complete && Boolean(image.src)) {
    isReady = true
    isError = false
    return
  }

  isReady = false
  isError = false

  image.onload = () => {
    // srcが変更されていたら何もしない
    if (loadingSrc !== src) return
    isReady = true
    isError = false
  }
  image.onerror = () => {
    // srcが変更されていたら何もしない
    if (loadingSrc !== src) return
    isReady = false
    isError = true
  }
}

watchEffect(() => {
  if (!isVisible) {
    return
  }

  if (!src) {
    clear()
    return
  }

  load()
})
</script>

<template>
  <div ref="rootRef" v-bind="$attrs" class="c-img-with-loading">
    <Transition name="loading-fade">
      <img v-if="isReady" :src="src" :alt="alt" class="image loading-fade" />
      <div v-else-if="isError" key="error" class="error loading-fade">読み込みに失敗しました</div>
      <SkeletonLoading v-else key="loading" class="loading loading-fade" />
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
.c-img-with-loading {
  position: relative;
  width: 100%;
  height: 100%;
  & > .image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
  & > .loading {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }
  & > .error {
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    padding: 8px;
    background: $color-background-secondary;
    text-align: center;
    line-height: 18px;
    font-size: 14px;
    color: $color-text-secondary;
  }
}
.loading-fade {
  &-enter-active,
  &-leave-active {
    transition: opacity 240ms ease-in-out 0s;
  }
  &-enter-from {
    opacity: 0;
  }
  &-enter-to {
    opacity: 1;
  }
  &-leave-from {
    opacity: 1;
  }
  &-leave-to {
    opacity: 0;
  }
}
</style>
