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
      <ProjectBlock />
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
}
</style>
