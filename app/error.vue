<script lang="ts" setup>
import { computed } from 'vue'

const { error } = defineProps<{
  error: {
    statusCode: string
  }
}>()

const errorText = $(
  computed(() => {
    if (error.statusCode === '404') {
      return 'Page Not Found'
    }

    return 'Something went wrong'
  })
)

const handleError = () => clearError({ redirect: '/' })
</script>

<template>
  <div class="page-wrapper">
    <p class="message">{{ errorText }}</p>
    <button class="button" @click="handleError">Back to home</button>
  </div>
</template>

<style lang="scss" scoped>
.page-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  width: 100vw;
  height: 100vh;
  &::before {
    content: '';
    position: absolute;
    z-index: -1;
    top: 50%;
    right: 0;
    left: 0;
    height: 320px;
    margin-top: -160px;
    background: $color-background-secondary;
  }
  & > .message {
    font-size: 36px;
  }
  & > .button {
    display: block;
    margin-top: 32px;
    font-size: 24px;
  }
}
</style>
