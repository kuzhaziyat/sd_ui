<script lang="ts" setup>
  import { Events } from "@/widgets";
</script>

<template>
  <div class="container">
    <router-view></router-view>
    <Events />
  </div>
</template>

<style lang="scss" scoped>
  .container {
    width: 100%;
    min-height: 100%;
    display: flex;
    background-color: var(--background-color);
  }
</style>
