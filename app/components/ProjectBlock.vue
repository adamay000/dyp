<script lang="ts" setup>
import { computed, watch } from 'vue'
import { useContents } from '@/composables/useContents'
import { disableScroll, enableScroll } from '@/utilities/scrollBlock'

const { contents } = $(useContents())

const projects = $(computed(() => contents.main.projects))

/** 詳細表示中のプロジェクトのID */
let activeProjectId = $ref<string | null>(null)
/** いずれかのプロジェクトを詳細表示しているかどうか */
const isActive = $computed(() => activeProjectId !== null)
/** 詳細表示中のプロジェクトの一つ前のプロジェクトのID */
const prevId = $computed<string | null>(() => {
  const currentIndex = projects.findIndex(({ id }) => id === activeProjectId)
  if (currentIndex === -1) {
    return null
  }
  return projects[currentIndex - 1]?.id || null
})
/** 詳細表示中のプロジェクトの一つ次のプロジェクトのID */
const nextId = computed<string | null>(() => {
  const currentIndex = projects.findIndex(({ id }) => id === activeProjectId)
  if (currentIndex === -1) {
    return null
  }
  return projects[currentIndex + 1]?.id || null
})

/** 指定したプロジェクトを詳細表示する */
const handleOpen = (id: string) => {
  activeProjectId = id
}
/** 詳細表示しているプロジェクトを閉じる */
const handleClose = () => {
  activeProjectId = null
}

// 詳細表示時はオーバーレイが表示させるのでページはスクロールできないようにする
watch(
  () => activeProjectId,
  (value) => {
    if (value === null) {
      enableScroll()
    } else {
      disableScroll()
    }
  }
)
</script>

<template>
  <section class="c-project-block">
    <ul class="list">
      <li v-for="project in projects" :key="project.id" class="item">
        <ProjectArticle
          :project="project"
          :active="activeProjectId === project.id"
          :has-another-active="isActive && activeProjectId !== project.id"
          @open="handleOpen"
          @close="handleClose"
        />
      </li>
    </ul>
    <Transition name="project-background">
      <div v-if="isActive" class="project-background" @click="handleClose" />
    </Transition>
    <Transition name="project-navigator">
      <div v-if="isActive" class="project-navigator">
        <div class="inner">
          <button class="close" @click="handleClose">閉じる</button>
          <button :disabled="prevId === null" class="button -prev" @click="handleOpen(prevId!)">
            <span class="hitarea" />
            <span class="text">PREV</span>
          </button>
          <button :disabled="nextId === null" class="button -next" @click="handleOpen(nextId!)">
            <span class="hitarea" />
            <span class="text">NEXT</span>
          </button>
        </div>
      </div>
    </Transition>
  </section>
</template>

<style lang="scss" scoped>
.c-project-block {
  & > .list {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    width: 100%;
    margin-top: -60px;
    @media ($tablet) {
      margin-top: -40px;
    }
    @media ($sp) {
      margin-top: -16px;
    }
  }
  & > .list > .item {
    display: block;
    width: calc((100% - 60px) / 3);
    margin-top: 60px;
    @include until(1600px) {
      width: calc((100% - 60px) / 2);
    }
    @media ($tablet) {
      width: calc((100% - 40px) / 2);
      margin-top: 40px;
    }
    @media ($sp) {
      width: 100%;
      margin-top: 16px;
    }
  }
}

.project-background {
  cursor: pointer;
  position: fixed;
  z-index: $z-modal-background;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: $color-modal-background;
  &-enter-active,
  &-leave-active {
    transition: opacity 240ms ease-in-out;
  }
  &-enter-from,
  &-leave-to {
    opacity: 0;
  }
}
.project-navigator {
  position: fixed;
  z-index: $z-detail-navigator;
  top: 50%;
  right: 0;
  left: 0;
  width: 100%;
  padding: 0 $detail-margin-pc;
  @media ($tablet) {
    padding: 0 $detail-margin-tablet;
  }
  @media ($sp) {
    top: 0;
    padding: 0;
  }
  & > .inner {
    position: relative;
    max-width: $detail-width-pc;
    margin: 0 auto;
    @media ($sp) {
      height: 45px;
      background: $color-background-secondary;
      border-bottom: 1px solid $color-border-primary;
    }
  }
  & > .inner > .close {
    display: none;
    @media ($sp) {
      display: block;
      cursor: pointer;
      width: 100%;
      height: 100%;
      text-align: center;
      font-size: 13px;
      color: $color-text-primary;
    }
  }
  & > .inner > .button {
    position: absolute;
    top: -22px;
    width: 44px;
    height: 44px;
    border: 1px solid $color-background-secondary;
    border-radius: 50%;
    font-size: 10px;
    @media ($sp) {
      top: 0;
      width: 80px;
      background: $color-background-secondary;
      border: 0;
      border-radius: 0;
      transition: background 240ms ease-in-out;
    }
  }
  & > .inner > .button:disabled {
    border: 1px solid rgba($color-background-secondary, 0.5);
    @media ($sp) {
      background: $color-background-tertiary;
      border: 0;
    }
  }
  & > .inner > .button::before {
    content: '';
    position: absolute;
    top: 1px;
    right: 1px;
    bottom: 1px;
    left: 1px;
    width: 40px;
    height: 40px;
    background: $color-background-secondary;
    border-radius: 50%;
    @media ($sp) {
      content: none;
    }
  }
  & > .inner > .button:disabled::before {
    opacity: 0.5;
  }
  & > .inner > .button::after {
    content: '';
    position: absolute;
    top: 15px;
    width: 12px;
    height: 12px;
    border-top: 2px solid $color-text-secondary;
    border-right: 2px solid $color-text-secondary;
    @media ($sp) {
      border-color: $color-text-tertiary;
    }
  }
  & > .inner > .button:disabled::after {
    border-top: 2px solid $color-text-tertiary;
    border-right: 2px solid $color-text-tertiary;
  }
  & > .inner > .button.-prev {
    left: -58px;
    @media ($tablet) {
      left: -52px;
    }
    @media ($sp) {
      left: 0;
    }
  }
  & > .inner > .button.-prev::after {
    left: 17px;
    transform: scaleY(1.5) rotate(225deg);
    @media ($sp) {
      left: 13px;
    }
  }
  & > .inner > .button.-next {
    right: -58px;
    @media ($tablet) {
      right: -52px;
    }
    @media ($sp) {
      right: 0;
    }
  }
  & > .inner > .button.-next::after {
    left: 12px;
    transform: scaleY(1.5) rotate(45deg);
    @media ($sp) {
      right: 13px;
      left: auto;
    }
  }
  & > .inner > .button > .hitarea {
    position: absolute;
    top: -18px;
    right: -18px;
    bottom: -18px;
    left: -18px;
    @media ($sp) {
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
    }
  }
  & > .inner > .button > .text {
    position: absolute;
    right: 0;
    bottom: -18px;
    left: 0;
    text-align: center;
    font-size: 10px;
    color: $color-text-inverse;
    @media ($sp) {
      top: 15px;
      bottom: auto;
      font-size: 13px;
      color: $color-text-tertiary;
    }
  }
  & > .inner > .button.-prev > .text {
    @media ($sp) {
      right: 15px;
      left: auto;
    }
  }
  & > .inner > .button.-next > .text {
    @media ($sp) {
      right: auto;
      left: 15px;
    }
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
