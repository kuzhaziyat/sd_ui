<script lang="ts" setup>
  import { useStore } from "@/entities";
  import { computed, ref, onMounted } from "vue";
  import { Calendar, RequestsCounter, TaskInCalendar } from "@/widgets";

  const store = useStore();
  const offset = ref(1);

  const counts = computed(() => store.getters["tasks/GET_COUNTS"]) as unknown as iStore.Counts[];
  store.commit("titles/SET_TITLE", `Календарь`);
  store.commit("app/CHANGE_STATE_RETURN", true);
</script>
<template>
  <div class="home__calendar">
    <Calendar :year="new Date().getFullYear()" />
    <TaskInCalendar />
  </div>
</template>

<style lang="scss" scoped>
  .home__calendar {
    display: flex;
    flex-direction: column;
    gap: 1em;
    padding: 1em;
  }
</style>
