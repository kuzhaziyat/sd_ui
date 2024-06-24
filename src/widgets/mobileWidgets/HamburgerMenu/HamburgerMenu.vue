<script setup lang="ts">
  import { computed, ref } from "vue";
  import { router, useStore } from "@/entities";
  import { doRequest } from "@/helpers";

  const store = useStore();
  const userInfo = store.state.user.info;
  const persInfo = store.state.personal.personalList.find((pers) => {
    return pers.id === userInfo.id;
  });
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
  function logout() {
    store.commit("componentLoader/TOGGLE_STATE");
    localStorage.clear();
    doRequest("/auth/logout", { method: "GET" }).then((response) => window.location.reload());
  }
  function toggleMenu() {
    store.commit("app/CHANGE_STATE_MENU", false);
  }
  function navigateToRoute(routeName: string, params?: any) {
    router.push({ name: routeName, params: params });
    store.commit("app/CHANGE_STATE_MENU", false);
  }
</script>
<template>
  <div class="mobile-menu" :class="{ visible: store.state.app.mobileMenu }">
    <div>
      <div class="top-menu">
        <p><strong>Меню</strong></p>
        <button @click="toggleMenu()"><img :src="require(`@/share/assets/icons/closeIconWhite.svg`)" alt="logo" /></button>
      </div>
      <div class="main-menu">
        <div v-for="(link, index) in links" :key="index">
          <router-link :to="link.path" @click="toggleMenu()" v-if="link.role">
            <img :src="require(`@/share/assets/icons/${link.icon}`)" alt="" />
            <p>{{ link.name }}</p>
          </router-link>
        </div>
        <div>
          <a @click="logout()">
            <img :src="require(`@/share/assets/icons/outButton.svg`)" alt="" />
            <p>Выход</p>
          </a>
        </div>
      </div>
    </div>
    <div class="messenger__resiver" v-if="userInfo" @click="navigateToRoute('MembersCard', { index: userInfo.id })">
      <div class="messenger__resiver__avatar">
        <img v-if="persInfo?.user.avatar" class="messenger__resiver__avatar__image" :src="persInfo.user?.avatar" />
        <p v-else class="messenger__resiver__avatar__image" :class="persInfo?.class">
          {{ `${persInfo?.lastName[0]}${persInfo?.firstName[0]}` }}
        </p>
      </div>
      <div class="member__name">
        <p>{{ `${persInfo?.lastName} ${persInfo?.firstName[0]}. ${persInfo?.surName[0]}.` }}</p>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
  .messenger__resiver {
    padding: 1em;
    display: flex;
    gap: 1em;
    align-items: center;
    & p {
      margin: 0;
      color: var(--text-color);
      font-size: 1em;
    }
  }
  .messenger__resiver__avatar {
    & p,
    img {
      display: flex;
      margin: 0;
      padding: 0;
      padding: 0.5em;
      font-size: 1em;
      width: 2em;
      aspect-ratio: 1/1;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      object-fit: contain;
      background-color: #707070;
      border-radius: 50%;
    }
  }
  a {
    display: flex;
    align-items: center;
    text-decoration: none;
    color: var(--text-color);
    padding: 0.75em 0.5em;
    font-size: 1em;
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
    &:hover {
      background-color: var(--button-hover-color);
      border-radius: 0.4em;
    }
  }

  .router-link-active {
    background-color: var(--primary-color);
  }
  .router-link-active:hover {
    background-color: var(--primary-hover-color);
  }

  .mobile-menu {
    position: fixed;
    background-color: var(--menu-background);
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    z-index: 10000;
    opacity: 0;
    visibility: hidden;
    transition: opacity 1s ease, visibility 0.3s linear 0s;
    .top-menu {
      margin: 0 2em;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 1.3em;
      color: var(--text-color);
      & button {
        border-style: none;
        background-color: var(--background-highlight-color);
        padding: 0;
        border-radius: 0.5em;
        transition: transform 0.2s ease;
        & img {
          width: 1em;
        }
        &:active {
          transform: scale(0.8);
        }
      }
    }
    .main-menu {
      margin: 0.5em 2em;
      width: var(--mobile-content-size);
      display: flex;
      flex-direction: column;
      gap: 1em;
      align-items: start;
      & div {
        width: 100%;
      }
    }
  }
  .visible {
    opacity: 1;
    visibility: visible;
    transition: opacity 0.3s ease, visibility 0s linear;
  }
</style>
