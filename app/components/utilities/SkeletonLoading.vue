<script lang="ts" setup></script>

<template>
  <div class="c-skeleton-loading">
    <span class="luster" />
  </div>
</template>

<style lang="scss" scoped>
.c-skeleton-loading {
  display: block;
  overflow: hidden;
  cursor: wait;
  position: relative;
  background: transparent $color-skeleton-background 0 0 no-repeat padding-box;
  & > .luster {
    position: absolute;
    z-index: 1;
    top: 0;
    right: 150%;
    bottom: 0;
    width: 100%;
    animation: loading 4096ms ease-in-out infinite 1024ms;
  }
  & > .luster::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 80%;
    background: transparent $color-skeleton-luster 0 0 no-repeat padding-box;
    transform: translate3d(0, 0, 0);
  }
}
@keyframes loading {
  0% {
    transform: translate3d(0, 0, 0);
  }
  30% {
    transform: translate3d(300%, 0, 0);
  }
  100% {
    transform: translate3d(300%, 0, 0);
  }
}
</style>
