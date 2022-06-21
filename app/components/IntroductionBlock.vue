<script lang="ts" setup>
import { computed } from 'vue'
import dayjs from 'dayjs'
import { useContents } from '@/composables/useContents'
import TagList from '@/components/TagList.vue'

const { contents } = $(useContents())

const introduction = $(computed(() => contents.main.introduction))
const birth = $(
  computed(() => {
    const birthday = dayjs(introduction.birth)
    const age = dayjs().diff(birthday, 'year')
    return `${birthday.format('YYYY/MM/DD')} (${age}歳)`
  })
)
const careers = $(
  computed(() =>
    introduction.careers.map(({ date: originalDate, text }) => {
      const date = dayjs(originalDate).format('YYYY年MM月')
      // 1970年1月の場合は現在として扱う
      const isNow = originalDate.getFullYear() === 1970 && originalDate.getMonth() === 0
      return {
        date: isNow ? '現在' : date,
        text
      }
    })
  )
)
const favorites = $(computed(() => introduction.favorites.join('、')))
</script>

<template>
  <section class="c-introduction-block">
    <img :src="introduction.image" alt="author" class="author" />
    <div class="info">
      <h1 class="title">{{ introduction.author }}</h1>
      <p class="birth">{{ birth }}</p>
    </div>
    <TagList :tags="introduction.tags" class="tags" />
    <div class="careers career-list">
      <p class="title">経歴</p>
      <ul class="list">
        <li v-for="(career, i) in careers" :key="`career${i}`" class="item">
          <div class="date">{{ career.date }}</div>
          <div class="text">{{ career.text }}</div>
        </li>
      </ul>
    </div>
    <div class="hope hope-detail">
      <p class="title">やりたい仕事</p>
      <p class="text">{{ introduction.hope }}</p>
    </div>
    <div class="favorites favorite-list">
      <p class="title">好きなもの</p>
      <p class="text">{{ favorites }}</p>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.c-introduction-block {
  position: relative;
  min-height: 128px;
  padding-left: 152px;
  @media ($sp) {
    min-height: auto;
    padding-left: 0;
  }
  & > .author {
    position: absolute;
    top: 0;
    left: 0;
    width: 128px;
    height: 128px;
    border: 1px solid $color-border-primary;
    border-radius: 50%;
    @media ($sp) {
      width: 64px;
      height: 64px;
    }
  }
  & > .info {
    display: inline-block;
    text-align: right;
    @media ($sp) {
      min-height: 64px;
      padding-left: 80px;
    }
  }
  & > .info > .title {
    letter-spacing: 6px;
    font-size: 32px;
    font-weight: 300;
    @media ($sp) {
      font-size: 32px;
    }
    @include until(375px) {
      font-size: 24px;
    }
  }
  & > .info > .birth {
    margin-top: 16px;
    @media ($sp) {
      margin-top: 8px;
    }
  }
  & > .tags {
    margin-top: 16px;
  }
  & > .careers {
    margin-top: 24px;
  }
  & > .hope {
    margin-top: 24px;
  }
  & > .favorites {
    margin-top: 24px;
  }
}
.career-list {
  position: relative;
  padding-left: 54px;
  @media ($sp) {
    padding-left: 0;
  }
  & > .title {
    position: absolute;
    top: 12px;
    left: 0;
    font-size: 16px;
    @media ($sp) {
      position: static;
    }
  }
  & > .list {
    display: table;
    margin-top: -12px;
    margin-bottom: -12px;
    border-collapse: separate;
    border-spacing: 0 8px;
    @media ($sp) {
      margin-top: 4px;
      margin-bottom: -11px;
      border-spacing: 0 4px;
    }
  }
  & > .list > .item {
    display: table-row;
  }
  & > .list > .item > .date {
    display: table-cell;
    padding-right: 16px;
    text-align: right;
    white-space: nowrap;
    @media ($sp) {
      padding-right: 12px;
    }
  }
  & > .list > .item > .text {
    display: table-cell;
    line-height: 1.5;
    white-space: pre-line;
  }
}
.hope-detail {
  position: relative;
  padding-left: 118px;
  @media ($sp) {
    padding-left: 0;
  }
  & > .title {
    position: absolute;
    top: 4px;
    left: 0;
    font-size: 16px;
    @media ($sp) {
      position: static;
    }
  }
  & > .text {
    margin-top: -4px;
    margin-bottom: -4px;
    line-height: 1.5;
    white-space: pre-line;
    @media ($sp) {
      margin-top: 5px;
    }
  }
}
.favorite-list {
  position: relative;
  padding-left: 118px;
  @media ($sp) {
    padding-left: 0;
  }
  & > .title {
    position: absolute;
    top: 4px;
    left: 0;
    font-size: 16px;
    @media ($sp) {
      position: static;
    }
  }
  & > .text {
    margin-top: -4px;
    margin-bottom: -4px;
    line-height: 1.5;
    @media ($sp) {
      margin-top: 5px;
    }
  }
}
</style>
