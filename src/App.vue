<script lang="ts" setup>
  import { computed } from "vue";
  import MainLayout from "@/layouts/MainLayout.vue";
  import LoginLayout from "@/layouts/LoginLayout.vue";
  import { useRoute } from "vue-router";

  const route = useRoute();

  const layouts = {
    main: MainLayout,
    login: LoginLayout,
  };

  const layout = computed(() => route.meta.layout || "login");
</script>

<template>
  <component :is="layouts[layout]">
    <router-view></router-view>
  </component>
</template>

<style lang="scss">
  html,
  body {
    height: 100%;
  }

  #app {
    display: flex;
    flex-direction: column;
    height: 100%;
    background-color: var(--background-color);
  }
</style>
