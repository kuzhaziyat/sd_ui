<script lang="ts" setup>
  import { router, useStore } from "@/entities";
  import { computed, ref } from "vue";

  const store = useStore();
  const userInfo = store.state.user.info;
  const persInfo = store.state.personal.personalList.find((pers) => {
    return pers.id === userInfo.id;
  });
  const wraped = ref(false);
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

  function navigateToRoute(routeName: string, params?: any) {
    router.push({ name: routeName, params: params });
    store.commit("app/CHANGE_STATE_MENU", false);
  }
</script>

<template>
  <nav class="navigation">
    <div class="top-nav">
      <div class="navigation__logo">
        <router-link :to="{ name: 'Home' }">
          <img :src="require(`@/share/assets/icons/logo.svg`)" alt="logo" />
          <p v-if="!wraped">ServiceDesk</p>
        </router-link>
      </div>
      <ul class="navigation__links">
        <li v-for="(link, index) in links" :key="index">
          <router-link :to="link.path" v-if="link.role">
            <img :src="require(`@/share/assets/icons/${link.icon}`)" alt="" />
            <p v-if="!wraped">{{ link.name }}</p>
          </router-link>
        </li>
      </ul>
    </div>
    <div>
      <div class="wrap" @click="wraped = !wraped">
        <img :src="require(`@/share/assets/icons/arrowRightWhite.svg`)" v-if="wraped" />
        <img :src="require(`@/share/assets/icons/arrowLeftWhite.svg`)" v-if="!wraped" />
        <p v-if="!wraped">Свернуть</p>
      </div>
      <div class="messenger__resiver" v-if="userInfo" @click="navigateToRoute('MembersCard', { index: userInfo.id })">
        <div class="messenger__resiver__avatar">
          <img v-if="persInfo?.user.avatar" class="messenger__resiver__avatar__image" :src="persInfo.user?.avatar" />
          <p v-else class="messenger__resiver__avatar__image" :class="persInfo?.class">
            {{ `${persInfo?.lastName[0]}${persInfo?.firstName[0]}` }}
          </p>
        </div>
        <div class="member__name" v-if="!wraped">
          <p>{{ `${persInfo?.lastName} ${persInfo?.firstName[0]}. ${persInfo?.surName[0]}.` }}</p>
        </div>
      </div>
    </div>
  </nav>
</template>

<style lang="scss" scoped>
  .top-nav {
    display: flex;
    flex-direction: column;
    gap: 2em;
  }
  .messenger__resiver {
    cursor: pointer;
    padding: 1em;
    display: flex;
    gap: 1em;
    align-items: center;
    & p {
      margin: 0;
      color: var(--text-color);
      font-size: 1.5em;
    }
  }
  .messenger__resiver__avatar {
    & p,
    img {
      display: flex;
      margin: 0;
      padding: 0;
      padding: 0.4em;
      font-size: 1.5em;
      width: 1.5em;
      aspect-ratio: 1/1;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      object-fit: contain;
      background-color: #707070;
      border-radius: 50%;
    }
  }
  .navigation {
    padding: 1em;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background-color: var(--third-background-color);
  }
  .navigation__logo {
    padding: 0.6em;
    font-size: 2em;
    width: max-content;
    cursor: pointer;
    & a {
      display: flex;
      align-items: center;
      gap: 0.5em;
      text-decoration: none;
      & img {
        display: block;
        aspect-ratio: 1/1;
        width: 1.5em;
      }
      & p {
        margin: 0;
        color: var(--primary-color);
      }
    }
  }
  .navigation__links {
    padding-inline-start: 0;
    margin-block-start: 0;
    margin-block-end: 0;
    display: flex;
    flex-direction: column;
    gap: 1em;
    width: max-content;
    & li {
      list-style-type: none;
      margin-block-start: 0;
      margin-block-end: 0;

      & a {
        padding: 1em;
        text-decoration: none;
        color: var(--text-color);
        font-size: 1.5em;
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
          width: 1.5em;
          height: 1.5em;
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
  .wrap {
    padding: 1em;
    text-decoration: none;
    color: var(--text-color);
    font-size: 1.5em;
    display: flex;
    align-items: center;
    gap: 0.5em;
    border-radius: 0.4em;
    transition: transform 0.2s ease;
    cursor: pointer;
    &:active {
      transform: scale(0.95);
    }
    & p {
      margin: 0;
    }
    img {
      aspect-ratio: 1/1;
      width: 1.5em;
    }
  }
</style>
