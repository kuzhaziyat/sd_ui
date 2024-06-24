<script setup lang="ts">
  import { useRouter } from "vue-router";

  const router = useRouter();
  function returnWindow() {
    router.back();
  }
</script>
<template>
  <p @click="returnWindow()">Назад</p>
  <img @click="returnWindow()" :src="require(`@/share/assets/icons/arrowReturnIcon.svg`)" />
</template>
<style lang="scss" scoped>
  p {
    display: none;
    margin: 0;
    color: var(--primary-color);
    font-size: 0.8em;
  }
  img {
    width: 1.5em;
  }
</style>
