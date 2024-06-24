<script lang="ts" setup>
  import { useStore } from "@/entities";
  import { computed, onMounted } from "vue";
  import { Calendar, RequestsCounter, TaskInCalendar } from "@/widgets";

  const store = useStore();
  const counts = computed(() => store.getters["tasks/GET_COUNTS"]) as unknown as iStore.Counts[];

  onMounted(() => {
    store.commit("titles/SET_TITLE", `Обзор`);
  });
</script>
<template>
  <div class="home">
    <div class="home__counter">
      <div class="home__counter-wrp">
        <RequestsCounter v-for="(count, index) in counts" :key="index" :index="index" :count="count.count" :title="count.title" :icon="count.icon" :link="count.link" />
      </div>
    </div>
    <div class="home__calendar">
      <Calendar :year="new Date().getFullYear()" />
      <TaskInCalendar />
    </div>
  </div>
  <div class="home-mobile">
    <div class="home__counter">
      <div class="home__counter-wrp">
        <RequestsCounter v-for="(count, index) in counts" :key="index" :index="index" :count="count.count" :title="count.title" :icon="count.icon" :link="count.link" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .home {
    display: flex;
    gap: 1em;
    margin: 1em;
    & .home__counter {
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      gap: 2em;
      user-select: none;
      & .home__counter-wrp {
        display: grid;
        grid-template-columns: repeat(8, 1fr);
        grid-template-rows: repeat(2, 1fr);
        gap: 1em;
      }
    }
    & .home__calendar {
      display: flex;
      flex-direction: column;
      gap: 1em;
      width: min-content;
    }
  }

  .home-mobile {
    padding: 1em;
    & .home__counter {
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      gap: 1em;
      user-select: none;
      & .home__counter-wrp {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1em;
      }
    }
  }

  @media screen and (max-width: 480px) {
    .home {
      display: none;
    }
  }
  @media screen and (min-width: 480px) {
    .home-mobile {
      display: none;
    }
  }
</style>
