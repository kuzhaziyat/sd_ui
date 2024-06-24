<script setup lang="ts">
  import { PropType, computed, ref } from "vue";
  import { router, useStore } from "@/entities";
  import { returnButton, contextMenu } from "@/share/UI";

  const store = useStore();
  const emit = defineEmits(["action"]);

  const title = computed(() => store.state.titles.title);

  const topContext = ref(0);
  const leftContext = ref(0);
  const showContext = ref(false);

  function contextOpen(e: MouseEvent) {
    topContext.value = e.pageY || e.clientY;
    leftContext.value = e.pageX || e.clientX;
    if (window.screen.availWidth - leftContext.value < 200) {
      leftContext.value = leftContext.value - 170;
    }
    showContext.value = true;
  }
  function contextClose() {
    topContext.value = 0;
    leftContext.value = 0;
    showContext.value = false;
  }

  const executorLinks = ref([
    {
      path: "/calendar",
      name: "Календарь",
      exact: true,
      icon: `calendarIcon.svg`,
      role: true,
    },
  ]);

  function link() {
    if (title.value === `Обзор`) {
      return executorLinks.value[0];
    } else
      return {
        path: "",
        name: "",
        exact: "",
        icon: "",
        role: false,
      };
  }
  function showReturnButton() {
    if (store.state.app.returnMobile) {
      return true;
    } else return false;
  }
  function toggleMenu() {
    store.commit("app/CHANGE_STATE_MENU", true);
  }
  function navigateToRoute(routeName: string, params?: any) {
    router.push({ name: routeName, params: params });
  }
</script>
<template>
  <div class="mobile-header">
    <div class="return-but" v-if="showReturnButton()"><returnButton /></div>
    <div class="return-but" v-if="!showReturnButton()">
      <img @click="toggleMenu()" :src="require(`@/share/assets/icons/humburgerIcon.svg`)" alt="" />
    </div>

    <div class="title">
      <h4>{{ title }}</h4>
    </div>
    <div class="route-but">
      <router-link :to="link().path" v-if="link().role">
        <img :src="require(`@/share/assets/icons/${link().icon}`)" alt="" />
      </router-link>
      <img @click="contextOpen" v-if="store.state.app.stateTask === 'task'" :src="require(`@/share/assets/icons/menuDotsIcon.svg`)" alt="" />
      <img @click="navigateToRoute('TaskCreate')" v-if="store.state.titles.title === 'Задачи'" :src="require(`@/share/assets/icons/plusDarkIcon.svg`)" alt="" />
    </div>
  </div>
  <contextMenu class="contextMenu" :display="showContext" :top="topContext" :left="leftContext" @close="contextClose">
    <div @click="store.commit('app/CHANGE_STATE_TASK', 'files'), contextClose(), store.commit('app/CHANGE_STATE_RETURN', true)">
      <img :src="require(`@/share/assets/icons/clip.svg`)" />
      <p>Вложения</p>
    </div>
    <div @click="store.commit('app/CHANGE_STATE_TASK', 'chat'), contextClose(), store.commit('app/CHANGE_STATE_RETURN', true)">
      <img :src="require(`@/share/assets/icons/token_chat.svg`)" />
      <p>Обсуждения</p>
    </div>
  </contextMenu>
</template>
<style lang="scss" scoped>
  .contextMenu {
    & div {
      display: flex;
      align-items: center;
      gap: 0.3em;
      cursor: pointer;
      transition: transform 0.2s ease;
      &:hover {
        transform: scale(1.05);
      }
      &:active {
        transform: scale(0.95);
      }
      & p {
        margin: 0;
      }
      & img {
        aspect-ratio: 1/1;
        width: 1.2em;
      }
    }
  }
  h4 {
    margin: 0;
  }
  .mobile-header {
    position: sticky;
    top: 0;
    background-color: var(--secondary-background-color);
    height: 3em;
    display: flex;
    gap: 1em;
    padding: 0 1em;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 0.4em 0.6em -0.6em var(--secondary-text-color);
    z-index: 3;
    & div {
      display: flex;
      justify-content: center;
      align-items: center;
      & a {
        & img {
          display: block;
          aspect-ratio: 1/1;
          width: 1.3em;
        }
      }
    }
    & div:last-child {
      justify-content: end !important;
    }
    & div:first-child {
      justify-content: start !important;
    }
  }
  .return-but {
    width: 20%;
    & img {
      aspect-ratio: 1/1;
      width: 1.5em;
      cursor: pointer;
      transition: transform 0.2s ease;
      &:active {
        transform: scale(0.8);
      }
    }
  }
  .title {
    width: 60%;
  }
  .route-but {
    width: 20%;
    & img {
      aspect-ratio: 1/1;
      width: 1.5em;
      &:active {
        transform: scale(0.8);
      }
    }
  }
</style>
