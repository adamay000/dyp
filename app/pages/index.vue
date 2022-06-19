<script lang="ts" setup>
import { computed } from 'vue'
import { useHead } from '@vueuse/head'
import { useContents } from '@/composables/useContents'

const { contents } = $(useContents())

useHead({
  title: computed(() => `${contents.main.introduction.author}'s portfolio`)
})
</script>

<template>
  <div class="page-wrapper">
    <div class="content">
      <IntroductionBlock class="introduction" />
      <p class="projecttitle">PROJECTS</p>
      <ProjectBlock class="projects" />
      <PrivacyPolicy />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.page-wrapper {
  & > .content {
    max-width: 2400px;
    margin: 0 auto;
    padding: 80px 32px;
    @media ($tablet) {
      padding: 60px 32px;
    }
    @media ($sp) {
      padding: 16px;
    }
  }
  & > .content > .introduction {
    max-width: 960px;
    margin: 0 auto;
  }
  & > .content > .projecttitle {
    margin-top: 80px;
    letter-spacing: 12px;
    font-size: 60px;
    font-weight: 700;
    color: $color-text-quaternary;
    @media ($sp) {
      display: none;
    }
  }
  & > .content > .projects {
    margin-top: 16px;
    @media ($sp) {
      margin-top: 60px;
    }
  }
  & > .content > .privacy {
    margin-top: 40px;
  }
}
</style>
