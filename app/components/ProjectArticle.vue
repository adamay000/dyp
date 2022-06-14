<script lang="ts" setup>
import { computed, ref, onMounted } from 'vue'
import dayjs from 'dayjs'
import anime, { AnimeAnimParams } from 'animejs'
import { Contents } from '@/contents/definition'
import { useHero } from '@/composables/useHero'
import ImageList from '@/components/ImageList.vue'
import TagList from '@/components/TagList.vue'
import ImgWithLoading from '@/components/utilities/ImgWithLoading.vue'
import { useVisibilityDetector } from '@/composables/useVisibilityDetector'
import { AnimationWatcher } from '@/utilities/animationWatcher'
import { easeOut5 } from '@/utilities/math'

// TODO コンポーネント別ける。heroアニメーションの都合で難しいのでこのままでもいいかも

const { project, active, hasAnotherActive } = defineProps<{
  project: Contents['main']['projects'][0]
  active: boolean
  hasAnotherActive: boolean
}>()
const date = $(computed(() => dayjs(project.date).format('YYYY/MM')))

const emit = defineEmits<{
  (e: 'open', id: string): void
  (e: 'close'): void
}>()

const scrollRef = ref<HTMLElement>()
const linksRef = ref<HTMLElement>()
const imagesRef = ref<typeof ImageList>()
const tagListRef = ref<typeof TagList>()
const textRef = ref<HTMLElement>()
const positionRef = ref<HTMLElement>()
const detailHeaderRef = ref<HTMLElement>()
const stickyCheckerRef = ref<HTMLElement>()

/** 詳細表示時のタイトル要素がsticky状態になっていないかどうか */
const isNotStuck = $(useVisibilityDetector(stickyCheckerRef))
/** 詳細表示時のタイトル要素がsticky状態になっているかどうか */
const isStuck = $(
  computed(() => {
    return !isNotStuck
  })
)

onMounted(() => {
  // サムネイルのheroアニメーションの移動先のrefを設定する
  // 他のやり方があれば変えたいけど見つからなかったので無理やりもってきてる
  toThumbnailRef.value = imagesRef.value?.$refs?.heroRef?.[0]
})

const {
  heroDuration,
  play: playThumbnail,
  reverse: reverseThumbnail,
  fromRef: fromThumbnailRef,
  toRef: toThumbnailRef,
  heroRef: heroThumbnailRef,
  heroStyle: heroThumbnailStyle
} = useHero(240)

const {
  play: playHeroTitle,
  reverse: reverseHeroTitle,
  fromRef: fromTitleRef,
  toRef: toTitleRef,
  heroRef: heroTitleRef,
  heroStyle: heroTitleStyle
} = useHero(240, ({ direction, progress, isFromVisible, isToVisible }) => {
  // フォントサイズのtransitionアニメーション
  // 移動元は固定だが、移動先はsticky常態化どうかでscaleがついている場合があるので計算する

  const fromFontSize = fromTitleRef.value ? Number.parseFloat(window.getComputedStyle(fromTitleRef.value).fontSize) : 16
  const toFontSize =
    (toTitleRef.value ? Number.parseFloat(window.getComputedStyle(toTitleRef.value).fontSize) : 40) *
    // cssで定義したscaleの値
    (isStuck ? 0.75 : 1)

  if (isToVisible && isFromVisible) {
    heroTitleRef.value?.style.setProperty('font-size', `${fromFontSize + (toFontSize - fromFontSize) * progress}px`)
  } else if (isFromVisible) {
    heroTitleRef.value?.style.setProperty('font-size', `${fromFontSize}px`)
  } else if (isToVisible) {
    heroTitleRef.value?.style.setProperty('font-size', `${toFontSize}px`)
  }

  if (direction === 'reverse') {
    toTitleRef.value?.style.setProperty('transform', 'none')
  } else {
    toTitleRef.value?.style.removeProperty('transform')
  }
})

const {
  play: playHeroDate,
  reverse: reverseHeroDate,
  fromRef: fromDateRef,
  toRef: toDateRef,
  heroRef: heroDateRef,
  heroStyle: heroDateStyle
} = useHero(240)

const {
  play: playHeroGithub,
  reverse: reverseHeroGithub,
  fromRef: fromGithubRef,
  toRef: toGithubRef,
  heroRef: heroGithubRef,
  heroStyle: heroGithubStyle
} = useHero(240)

const { playAnimation, reverseAnimation } = (() => {
  if (process.server) {
    return {
      playAnimation: () => {},
      reverseAnimation: () => {}
    }
  }
  const animationWatcher = new AnimationWatcher()
  const animationDuration = 480
  const animation = anime.timeline({
    autoplay: false
  })
  onMounted(() => {
    const options: AnimeAnimParams = {
      easing: () => easeOut5,
      duration: animationDuration
    }
    animation
      .add({
        ...options,
        targets: [tagListRef.value?.$el],
        delay: heroDuration,
        opacity: [0, 1],
        translateX: [8, 0]
      })
      .add(
        {
          ...options,
          targets: [...(linksRef.value?.querySelectorAll('li') ?? [])].filter(Boolean),
          delay: anime.stagger(120, { start: heroDuration }),
          opacity: [0, 1],
          translateX: [4, 0]
        },
        0
      )
      .add(
        {
          ...options,
          targets: [positionRef.value, textRef.value].filter(Boolean),
          delay: anime.stagger(120, { start: heroDuration }),
          opacity: [0, 1],
          translateX: [4, 0]
        },
        0
      )
    animation.complete = () => animationWatcher.resolve()
  })
  return {
    playAnimation: () => {
      const promise = animationWatcher.create()
      if (animation.direction === 'reverse') animation.reverse()
      animation.play()
      return promise
    },
    reverseAnimation: () => {
      const promise = animationWatcher.create()
      if (animation.direction === 'normal') animation.reverse()
      animation.play()
      return promise
    }
  }
})()

const enter = async (_: unknown, done: () => void) => {
  scrollRef.value?.scrollTo(0, 0)
  await Promise.all([playThumbnail(), playHeroTitle(), playHeroDate(), playHeroGithub(), playAnimation()])
  done()
}

const leave = async (_: unknown, done: () => void) => {
  await Promise.all([
    reverseThumbnail(),
    reverseHeroTitle(),
    reverseHeroDate(),
    reverseHeroGithub(),
    reverseAnimation()
  ])
  done()
}
</script>

<template>
  <article class="c-project-article" :class="{ '-active': active }">
    <div class="list" @click="emit('open', project.id)">
      <div class="thumbnail">
        <div ref="fromThumbnailRef" class="image">
          <ImgWithLoading :src="project.thumbnail" :alt="project.title" :style="{ width: '100%', height: '100%' }" />
        </div>
      </div>
      <div class="summary project-summary">
        <h1 ref="fromTitleRef" class="title hero-title">{{ project.title }}</h1>
        <p ref="fromDateRef" class="date hero-date">{{ date }}</p>
        <a
          v-if="project.github !== null"
          :href="project.github"
          rel="nofollow noopener noreferrer"
          target="_blank"
          class="github"
          @click.stop
        >
          <img ref="fromGithubRef" src="@/assets/images/github.png" alt="github" class="icon" />
        </a>
      </div>
    </div>
    <Transition name="project-detail" @enter="enter" @leave="leave">
      <article v-show="active" class="project-detail">
        <img
          ref="heroThumbnailRef"
          :src="project.thumbnail"
          alt=""
          class="hero-thumbnail"
          :class="{ '-behind': hasAnotherActive }"
          :style="heroThumbnailStyle"
        />
        <p ref="heroTitleRef" class="hero-title" :style="heroTitleStyle">
          {{ project.title }}
        </p>
        <p ref="heroDateRef" class="hero-date" :style="heroDateStyle">{{ date }}</p>
        <img
          v-if="project.github !== null"
          ref="heroGithubRef"
          src="@/assets/images/github.png"
          alt="github"
          :style="heroGithubStyle"
        />
        <div ref="scrollRef" class="scroll" @click.self="emit('close')">
          <div class="content project-content">
            <span ref="stickyCheckerRef" />
            <header ref="detailHeaderRef" class="header" :class="{ '-stuck': isStuck }">
              <p ref="toDateRef" class="hero-date">{{ date }}</p>
              <h1
                ref="toTitleRef"
                class="title hero-title"
                :class="{ '-hasgithub': project.github !== null, '-stuck': isStuck }"
              >
                {{ project.title }}
              </h1>
              <a
                v-if="project.github !== null"
                :href="project.github"
                rel="nofollow noopener noreferrer"
                target="_blank"
                class="github"
              >
                <img ref="toGithubRef" src="@/assets/images/github.png" alt="github" class="icon" />
              </a>
            </header>
            <ul v-if="project.links.length > 0" ref="linksRef" class="links">
              <li v-for="{ url, comment } in project.links" :key="url" class="item">
                <a :href="url" rel="nofollow noopener noreferrer" target="_blank">{{ comment }}</a>
              </li>
            </ul>
            <ImageList
              ref="imagesRef"
              :images="[project.thumbnail, ...project.images]"
              :animate="active"
              class="images"
            />
            <TagList ref="tagListRef" :tags="project.tags" class="tags" />
            <dl v-if="project.position !== null" ref="positionRef" class="position">
              <dt class="title">担当</dt>
              <dd class="text">{{ project.position }}</dd>
            </dl>
            <p ref="textRef" class="text">
              {{ project.text }}
            </p>
          </div>
        </div>
      </article>
    </Transition>
  </article>
</template>

<style lang="scss" scoped>
.c-project-article {
  cursor: pointer;
  position: relative;
  width: 100%;
  height: 0;
  padding-top: calc(61.8% + 60px);
  &.-active {
    cursor: default;
  }
  & > .list {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 60px;
    left: 0;
  }
  & > .list::before {
    content: '';
    pointer-events: none;
    position: absolute;
    z-index: 1;
    top: 1px;
    right: 1px;
    bottom: 1px;
    left: 1px;
    border: 1px solid #ffffff;
  }
  & > .list::after {
    content: '';
    pointer-events: none;
    position: absolute;
    z-index: 1;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    border: 1px solid rgba(#000000, 0.5);
  }
  & > .list > .thumbnail {
    overflow: hidden;
    position: absolute;
    z-index: -1;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
  & > .list > .thumbnail > .image {
    width: 100%;
    height: 100%;
    transition: transform 480ms ease-in-out;
  }
  & > .list:hover > .thumbnail > .image {
    @media ($pc) {
      transform: scale(1.04);
    }
  }
  & > .list > .summary {
    position: absolute;
    right: 0;
    bottom: -60px;
    left: 0;
  }
}

.project-summary {
  height: 60px;
  padding: 16px 2px;
  @media ($tablet) {
    padding: 12px 2px;
  }
  @media ($sp) {
    padding: 8px 2px;
  }
  & > .title {
    margin-bottom: 8px;
    padding-right: 32px;
    font-size: 16px;
    @media ($tablet) {
      font-size: 14px;
    }
    @media ($sp) {
      font-size: 14px;
    }
  }
  & > .github {
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    top: 4px;
    right: -4px;
    width: 44px;
    height: 44px;
    text-align: right;
    @media ($tablet) {
      top: 0;
      width: 40px;
      height: 40px;
    }
    @media ($sp) {
      top: 0;
      width: 40px;
      height: 40px;
    }
  }
  & > .github > .icon {
    width: 24px;
    height: 24px;
  }
}

.hero-thumbnail {
  &.-behind {
    z-index: -1 !important;
  }
}

.hero-title {
  font-family: $font-japanese;
  transform-origin: 0 0;
  transition: transform 240ms ease-in-out;
  &.-stuck {
    transform: scale(0.75);
  }
}

.hero-date {
  font-size: 13px;
  color: $color-text-tertiary;
  @media ($tablet) {
    font-size: 12px;
  }
  @media ($sp) {
    font-size: 12px;
  }
}

.project-detail {
  & > .scroll {
    display: flex;
    overflow: auto;
    cursor: pointer;
    position: fixed;
    z-index: $z-detail;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    padding: $detail-margin-pc;
    @media ($tablet) {
      padding: $detail-margin-tablet;
    }
    @media ($sp) {
      display: block;
      margin-top: 44px;
      padding: 0;
    }
  }
  & > .scroll > .content {
    margin: auto;
    @media ($sp) {
      margin: 0;
    }
  }
  &-enter-active > .scroll > .content,
  &-leave-active > .scroll > .content {
    transition: opacity 240ms ease-in-out;
  }
  &-enter-from > .scroll > .content,
  &-leave-to > .scroll > .content {
    opacity: 0;
  }
}

.project-content {
  cursor: default;
  width: 100%;
  max-width: $detail-width-pc;
  padding: ($detail-margin-pc - 24px) $detail-margin-pc $detail-margin-pc;
  background: $color-background-secondary;
  @media ($tablet) {
    padding: ($detail-margin-tablet - 24px) $detail-margin-tablet $detail-margin-tablet;
  }
  @media ($sp) {
    padding: $detail-margin-sp $detail-margin-sp ($detail-margin-sp * 4);
  }
  & > .header {
    position: sticky;
    z-index: 2;
    top: -$detail-margin-pc;
    padding: 24px 0 0;
    background: $color-background-secondary;
    @media ($tablet) {
      top: -$detail-margin-tablet;
    }
    @media ($sp) {
      top: -12px;
    }
  }
  & > .header.-stuck::before {
    content: '';
    position: absolute;
    z-index: -2;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    box-shadow: 0 2px 16px 2px $color-border-primary;
  }
  & > .header.-stuck::after {
    content: '';
    position: absolute;
    z-index: -1;
    top: 0;
    right: -$detail-margin-tablet;
    bottom: 0;
    left: -$detail-margin-tablet;
    background: $color-background-secondary;
    @media ($sp) {
      right: -$detail-margin-sp;
      left: -$detail-margin-sp;
    }
  }

  & > .header > .title {
    margin-top: 4px;
    font-size: 40px;
    font-family: $font-japanese;
    @media ($sp) {
      font-size: 24px;
    }
  }
  & > .header > .title.-hasgithub {
    padding-right: 56px;
  }
  & > .header > .github {
    position: absolute;
    top: 32px;
    right: 0;
  }
  & > .header > .github > .icon {
    width: 40px;
    height: 40px;
    @media ($sp) {
      width: 24px;
      height: 24px;
    }
  }
  & > .links {
    margin-top: 8px;
    margin-bottom: -4px;
    line-height: 1.5;
    font-size: 16px;
  }
  & > .links > .item::after {
    content: '';
    display: inline-block;
    width: 16px;
    height: 16px;
    margin-left: 8px;
    background: url('@/assets/images/blank.png') 0 0 / contain no-repeat;
    vertical-align: text-bottom;
    opacity: 0.5;
  }
  & > .images {
    position: relative;
    z-index: 1;
    margin-top: 16px;
  }
  & > .tags {
    margin: 20px -8px 0;
  }
  & > .position {
    margin-top: 16px;
    margin-bottom: 4px;
    line-height: 1.5;
    white-space: pre-line;
    font-size: 14px;
  }
  & > .position > .title {
    display: inline-block;
    width: 48px;
    margin-right: -48px;
  }
  & > .position > .text {
    display: inline-block;
    padding-left: 48px;
    vertical-align: top;
  }
  & > .text {
    margin-top: 16px;
    margin-bottom: -4px;
    line-height: 1.5;
    white-space: pre-line;
    font-size: 16px;
  }
}
</style>
