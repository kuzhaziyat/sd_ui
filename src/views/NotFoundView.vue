<script lang="ts" setup>
import { useStore } from "@/entities";

const store = useStore();

store.commit("titles/SET_TITLE", "");
</script>

<template>
  <div class="not-found">
    <img :src="require(`@/share/assets/icons/logo404.svg`)" alt="logo404" />
    <p>Страница не найдена</p>
    <router-link :to="{ name: 'Home' }">
      <p>Вернуться на главную страницу</p>
    </router-link>
  </div>
</template>

<style lang="scss" scoped>
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2em;
  height: 100%;
  padding: 0;
  margin: 0;
  & a {
    color: var(--primary-color);
  }
}
</style>
