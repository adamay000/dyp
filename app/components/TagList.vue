<script lang="ts" setup>
const { tags } = defineProps<{
  tags: Array<string>
}>()
</script>

<template>
  <ul class="c-tag-list">
    <li v-for="tag in tags" :key="tag" class="tag">
      {{ tag }}
    </li>
  </ul>
</template>

<style lang="scss" scoped>
.c-tag-list {
  margin-bottom: -2px;
  & > .tag {
    display: inline-block;
    margin-right: 2px;
    margin-bottom: 2px;
    padding: 4px 12px;
    background: $color-tag-background;
    border-radius: 16px;
    font-size: 13px;
    color: $color-tag-text;
    @media ($sp) {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
    }
  }
}
</style>
