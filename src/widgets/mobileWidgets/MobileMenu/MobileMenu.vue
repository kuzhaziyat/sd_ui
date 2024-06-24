<script setup lang="ts">
  import { computed, ref } from "vue";
  import { useStore } from "@/entities";

  const store = useStore();
  const userInfo = store.state.user.info;

  const executorLinks = ref([
    {
      path: "/",
      name: "Обзор",
      exact: true,
      icon: `reviewIcon.svg`,
      role: true,
    },
    {
      path: "/requests",
      name: "Задачи",
      exact: true,
      icon: `halfBookIcon.svg`,
      role: true,
    },
    {
      path: "/chat",
      name: "Сообщения",
      exact: true,
      icon: `messageWhite.svg`,
      role: true,
    },
    {
      path: "/members",
      name: "Сотрудники",
      exact: true,
      icon: `oct.svg`,
      role: true,
    },
    {
      path: "/settings",
      name: "Настройки",
      exact: true,
      icon: `settings.svg`,
      role: userInfo.isAdmin || userInfo.isManager,
    },
  ]);

  const links = computed(() => store.getters["user/GET_ROLE"] || executorLinks.value);
</script>
<template>
  <div class="menu">
    <div v-for="(link, index) in links" :key="index">
      <router-link :to="link.path" v-if="link.role">
        <img :src="require(`@/share/assets/icons/${link.icon}`)" alt="" />
        <p>{{ link.name }}</p>
      </router-link>
    </div>
  </div>
</template>
<style lang="scss" scoped>
  .menu {
    position: sticky;
    bottom: 0;
    height: 3em;
    background-color: var(--menu-background);
    padding: 0.3em;
    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 1;
    & div {
      flex-basis: 30%;
      width: 3em;
      & a {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 1em;
        text-decoration: none;
        color: var(--text-color);
        font-size: 0.6em;
        display: flex;
        gap: 0.5em;
        border-radius: 0.4em;
        transition: transform 0.2s ease;
        &:active {
          transform: scale(0.95);
        }
        & p {
          margin: 0;
        }
        & img {
          aspect-ratio: 1/1;
          width: 2em;
        }
      }
    }
    & a:hover {
      background-color: var(--button-hover-color);
      border-radius: 0.4em;
    }
    & .router-link-active {
      background-color: var(--primary-color);
    }
    & .router-link-active:hover {
      background-color: var(--primary-hover-color);
    }
  }
</style>
