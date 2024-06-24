<script lang="ts" setup>
  import { useStore } from "@/entities";
  import { ComputedRef, computed, ref, watch } from "vue";
  import { useRoute } from "vue-router";
  import { loader } from "@/widgets";

  const loaderState = ref(false);
  const route = useRoute();
  const offset = ref(1);
  const count = ref(29);
  const tasks: ComputedRef<iStore.Task[]> = computed(() => store.state.tasks.allTasks || []);
  const taskCount = computed(() => store.state.tasks.selected);
  const counts = computed(() => store.state.tasks.counts);
  const activeButton = ref(1);
  const currentField = ref("");
  const desc = ref(false);
  const store = useStore();
  if (store.state.app.mobile) {
    count.value = 15;
  }
  const pagCount = computed(() => {
    return Math.ceil(taskCount.value / count.value);
  });

  function pagination(page: number) {
    activeButton.value = page;
    const options: Record<string, any> = { offset: page, count: count.value, filter: route.query.filter };
    if (currentField.value) options.sort = currentField.value;
    if (desc.value) options.desc = desc.value;
    store.dispatch("tasks/GET_ALL_TASKS", options);
  }

  function sortBy(field: string) {
    activeButton.value = 1;
    const options: Record<string, any> = { offset: activeButton.value, count: count.value, filter: route.query.filter, sort: field };
    if (currentField.value === field && !desc.value) {
      options.desc = true;
      desc.value = true;
    } else if (currentField.value === field && desc.value) {
      options.desc = false;
      desc.value = false;
    } else if (currentField.value !== field) desc.value = false;
    currentField.value = field;
    store.dispatch("tasks/GET_ALL_TASKS", options);
  }
  function init(e: iStore.Counts[]) {
    if (e.length > 0) {
      const countState = e.find((count) => count.link === route.query.filter);
      if (countState && Object.hasOwn(countState, "link")) {
        store.commit("tasks/SET_SELECTED_TASKS_COUNT", countState?.count);
      } else {
        const countState = e.find((count) => count.priority === 1);
        store.commit("tasks/SET_SELECTED_TASKS_COUNT", countState?.count);
      }
      store.dispatch("tasks/GET_ALL_TASKS", { offset: offset.value.toString(), count: count.value.toString(), filter: route.query.filter }).then(() => (loaderState.value = true));
    }
  }

  if (counts.value) {
    init(counts.value);
  } else {
    watch(counts, (e) => {
      init(e);
    });
  }
  store.commit("titles/SET_TITLE", "Задачи");

  function searchTask(e: Event) {
    const newValue = (e.target as HTMLInputElement).value;
  }
</script>

<template>
  <loader v-if="!loaderState" />
  <div class="tasks__wrp" v-else>
    <div class="tasks" v-if="tasks.length > 0">
      <!-- <div class="tasks__search">
        <input type="text" placeholder="Поиск по номеру или теме" @input="searchTask" />
      </div> -->
      <div class="tasks__list__wrp">
        <div class="tasks__titles" v-if="!store.state.app.mobile">
          <p @click="sortBy('number')">№ задачи:</p>
          <p>Тема:</p>
          <p @click="sortBy('orgId')">Организация:</p>
          <p @click="sortBy('creatorId')">Инициатор, должность:</p>
          <p @click="sortBy('executorId')">Исполнитель:</p>
          <p @click="sortBy('status')">Статус:</p>
          <!-- <p @click="sortBy('date')">Срок:</p> -->
        </div>
        <div
          v-for="task in tasks"
          :key="task.id"
          class="tasks__task"
          :class="{ 'hight-priority': task.priority.id === 1 }"
          @click="$router.push({ name: 'TaskInfo', params: { id: task.id } })"
        >
          <p :title="'приоритет ' + task.priority.type.toLowerCase()">
            <span v-if="store.state.app.mobile">№ задачи:</span>
            {{ String(task.number).padStart(6, "0") }}
          </p>
          <p :title="task.info.title">
            <span v-if="store.state.app.mobile">Тема:</span>
            {{ task.info.title }}
          </p>
          <p :title="task.organization.shortName">
            <span v-if="store.state.app.mobile">Организация:</span>
            {{ task.organization.shortName }}
          </p>
          <p
            :title="
              task.creator
                ? `${task.creator.lastName} ${task.creator.firstName[0]}. ${task.creator.surName[0]}., ${task.creator.position ? task.creator.position.shortName : ''}`
                : 'Не назначен'
            "
          >
            <span v-if="store.state.app.mobile">Инициатор:</span>
            {{
              task.creator
                ? `${task.creator.lastName} ${task.creator.firstName[0]}. ${task.creator.surName[0]}., ${task.creator.position ? task.creator.position.shortName : ""}`
                : "Не назначен"
            }}
          </p>
          <p
            :title="task.executorOrg.length > 1 ? `Поручено ${task.executorOrg.length}-ти учреждениям` : task.executorOrg[0].shortName"
            v-if="task.executorOrg && task.executorOrg.length > 0"
          >
            {{ task.executorOrg.length > 1 ? `Поручено ${task.executorOrg.length}-ти учреждениям` : task.executorOrg[0].shortName }}
          </p>
          <p v-else>
            <span v-if="store.state.app.mobile">Исполнитель:</span>
            {{ task.executor ? `${task.executor.lastName} ${task.executor.firstName[0]}. ${task.executor.surName[0]}., ${task.executor.position.shortName}` : "Не назначен" }}
          </p>
          <p>
            <span v-if="store.state.app.mobile">Статус:</span>
            {{
              task.info.status === null && task.approved === null
                ? "Создан"
                : task.info.status === false
                ? "В работе"
                : task.approved === null
                ? "На подтверждении"
                : task.approved === false
                ? "Возврат в работу"
                : "Исполнен"
            }}
            <span
              class="status"
              :class="{
                created: task.info.status === null,
                inWorked: task.info.status === false,
                inAproved: task.approved === null && task.info.status === true,
                inReturnWorked: task.approved === false,
                aproved: task.approved === true,
              }"
            ></span>
          </p>
        </div>
      </div>
    </div>
    <div class="nullTask" v-else>
      <h1>У Вас нет задач.</h1>
      <img :src="require(`@/share/assets/icons/NullTaskIcon.svg`)" alt="logo" />
    </div>
    <div class="tasks__pagination" v-if="pagCount > 1">
      <button v-for="page in pagCount" :key="page" @click="pagination(page)" :class="{ 'active-button': page === activeButton }">{{ page }}</button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  @media screen and (max-width: 480px) {
    .hight-priority {
      border-left: 0.4em solid var(--primary-color) !important;
    }

    .tasks {
      padding: 1em;
    }
    .tasks__list__wrp {
      gap: 1em;
    }
    .tasks__task {
      display: flex;
      background-color: var(--secondary-background-color);
      flex-direction: column;
      padding: 0.5em;
      border-radius: 0.4em;
      border-left: 0.4em solid var(--fourth-color);
      & p {
        margin: 0;
        position: relative;
        & span {
          color: var(--third-text-color);
        }
      }
    }
    .status {
      display: inline-block;
    }
  }
  @media screen and (min-width: 480px) {
    .hight-priority {
      border-left: 0.3em solid var(--primary-color) !important;
    }

    .tasks__wrp,
    .tasks {
      padding: 1em 1.5em;
    }
    .tasks__task {
      display: flex;
      background-color: var(--secondary-background-color);
      align-items: center;
      border-left: 0.3em solid var(--fourth-color);
      & p {
        position: relative;
        margin: 0;
        padding: 0.2em 0.3em;
        align-self: center;
        flex-basis: 20%;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        border-right: 0.1em solid var(--fourth-color);
        border-bottom: 0.1em solid var(--fourth-color);
        color: var(--third-text-color);
        cursor: pointer !important;
        width: 0em;
      }

      & p:nth-child(1) {
        color: var(--third-text-color);
      }
      & p:nth-child(1) {
        flex-basis: 12%;
      }
      & p:nth-child(2) {
        flex-basis: 12%;
        flex-grow: 1;
      }
      & p:nth-child(3) {
        flex-basis: 15%;
      }
      & p:nth-child(6) {
        flex-basis: 14%;
      }
      & p {
        color: var(--secondary-text-color);
      }
    }
    .created {
      position: absolute;
      top: 30%;
      right: 0.5em;
      display: inline-block;
    }
    .inWorked {
      position: absolute;
      top: 30%;
      right: 0.5em;
      display: inline-block;
    }
    .inAproved {
      position: absolute;
      top: 30%;
      right: 0.5em;
      display: inline-block;
    }
    .inReturnWorked {
      position: absolute;
      top: 30%;
      right: 0.5em;
      display: inline-block;
    }
    .aproved {
      position: absolute;
      top: 30%;
      right: 0.5em;
      display: inline-block;
    }
  }
  .tasks__wrp,
  .tasks {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    gap: 0.5em;
  }

  .tasks__search {
    display: flex;
    justify-content: space-between;
    & input {
      outline: none;
      display: block;
      border: none;
      background-color: transparent;
      border: 0.1em solid var(--fourth-border-color);
      border-radius: 0.7em;
      padding: 1em 1.5em;
    }
    & input:nth-child(1) {
      flex-basis: 25%;
      background-image: url("@/share/assets/icons/search.svg");
      background-size: 5%;
      background-repeat: no-repeat;
      background-position: 95% center;
    }
  }
  .tasks__list__wrp {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
  }
  .nullTask {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    & img {
      width: 40%;
    }
  }
  .tasks__titles {
    @extend .tasks__task;
    & p:nth-child(1) {
      flex-basis: 12%;
    }
    & p:nth-child(2) {
      flex-basis: auto;
      flex-grow: 1;
    }
    & p:nth-child(3) {
      flex-basis: 15%;
    }
    & p:nth-child(6) {
      flex-basis: 14%;
    }
    & p {
      position: relative;
      display: flex;
      gap: 0.5em;
      color: var(--third-text-color);
      cursor: pointer;
      border-right: 0.1em solid var(--third-text-color);
    }
    & p::after {
      display: block;
      content: "";
      width: 1em;
      aspect-ratio: 1/1;
      background-image: url("@/share/assets/icons/filterIcon.svg");
      background-repeat: no-repeat;
      background-size: contain;
    }
    & p:nth-child(2)::after {
      display: none;
      content: none;
    }
    & p:nth-child(2) {
      cursor: unset;
    }
  }

  .tasks__pagination {
    display: flex;
    gap: 1em;
    justify-content: center;
    align-items: center;
    padding-bottom: 1em;
    & button {
      display: flex;
      justify-content: center;
      align-items: center;

      outline: none;
      border: none;
      width: 2em;
      height: 2em;
      background-color: transparent;
      text-align: center;
      color: var(--secondary-text-color);
      border-radius: 100%;
      cursor: pointer;
    }
  }
  .active-button {
    background-color: var(--primary-color) !important;
    color: var(--text-color) !important;
    border: 0.1em solid var(--primary-color) !important;
  }
  .created {
    width: 0.7em;
    height: 0.7em;
    background-color: #00bfff !important;
    border-radius: 50%;
  }
  .inWorked {
    width: 0.7em;
    height: 0.7em;
    background-color: #f79236 !important;
    border-radius: 50%;
  }
  .inAproved {
    width: 0.7em;
    height: 0.7em;
    background-color: #ffd700 !important;
    border-radius: 50%;
  }
  .inReturnWorked {
    width: 0.7em;
    height: 0.7em;
    background-color: #cd5322 !important;
    border-radius: 50%;
  }
  .aproved {
    width: 0.7em;
    height: 0.7em;
    background-color: #32cd32 !important;
    border-radius: 50%;
  }
</style>
