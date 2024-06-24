<script lang="ts" setup>
  import { useStore } from "@/entities";
  import { computed, ref, watch } from "vue";

  const store = useStore();
  const tasks = computed(() => store.getters["tasks/GET_TASK_OF_DAY"] || { day: new Date(), tasks: [] });
  const current = ref(0);
  function taskPagination(val: boolean) {
    if (!val) {
      current.value = current.value <= 0 ? (current.value = tasks.value.tasks.length - 1) : current.value - 1;
    } else current.value = (current.value + 1) % tasks.value.tasks.length;
  }
  watch(tasks, () => {
    current.value = 0;
  });
</script>

<template>
  <div class="tasks-list" v-if="tasks.tasks && !tasks.tasks.length">
    <div class="tasks-list__title">
      <h2>
        Задачи на: <br />
        {{ new Date(tasks.day).toLocaleDateString() }}
      </h2>
    </div>
    <div class="tasks-list__info null-task"><p>Нет задач.</p></div>
  </div>
  <div class="tasks-list" v-else>
    <div class="tasks-list__title">
      <h2>
        Задачи на: <br />
        {{ new Date(tasks.day).toLocaleDateString() }}
      </h2>
    </div>
    <div class="tasks-list__control">
      <input type="button" @click="taskPagination(false)" />
      <h2>{{ current + 1 }}/{{ tasks.tasks.length }}</h2>
      <input type="button" @click="taskPagination(true)" />
    </div>
    <div class="tasks-list__info">
      <div>
        <h4>{{ tasks.tasks[current].info.title }}</h4>
        <p>{{ tasks.tasks[current].organization.shortName }}</p>
      </div>
      <div>
        <p>
          Исполнитель:
          {{
            tasks.tasks[current].executor && `${tasks.tasks[current].executor.lastName} ${tasks.tasks[current].executor.firstName[0]}. ${tasks.tasks[current].executor.surName[0]}`
          }}
        </p>
      </div>
      <div>
        <p>Отдел: {{ tasks.tasks[current].department && tasks.tasks[current].department.name }}</p>
      </div>
    </div>
    <div class="tasks-list__comments">
      <div>
        <img :src="require(`@/share/assets/icons/taskclock.svg`)" alt="" />
        <p>{{ tasks.tasks[current].info.deadLine && new Date(tasks.tasks[current].info.deadLine).toLocaleString().split(",").join(" ") }}</p>
      </div>
      <div>
        <img :src="require(`@/share/assets/icons/message.svg`)" alt="" />
        <p v-if="tasks.tasks[current].info.log.filter((msg: any) => msg.type === 'message').length < 1">Комментарии отсутствуют</p>
        <p v-else-if="tasks.tasks[current].info.log.filter((msg: any) => msg.type === 'message').length === 1">
          {{ tasks.tasks[current].info.log.filter((msg: any) => msg.type === "message").length }} комментарий
        </p>
        <p
          v-else-if="tasks.tasks[current].info.log.filter((msg: any) => msg.type === 'message').length > 1 && tasks.tasks[current].info.log.filter((msg: any) => msg.type === 'message').length < 5 "
        >
          {{ tasks.tasks[current].info.log.filter((msg: any) => msg.type === "message").length }} комментария
        </p>
        <p v-else>{{ tasks.tasks[current].info.log.filter((msg: any) => msg.type === "message").length }} комментариев</p>
      </div>
    </div>
    <div class="">
      <button type="button" @click="$router.push({ name: 'TaskInfo', params: { id: tasks.tasks[current].id } })">К задаче</button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .tasks-list {
    padding: 1em;
    display: flex;
    flex-direction: column;
    background-color: var(--secondary-background-color);
    gap: 0.5em;
    border-radius: 0.4em;
    cursor: default;
    &__title {
      & h2 {
        margin: 0;
        text-align: center;
        user-select: none;
      }
    }
    &__info {
      & h4 {
        margin: 0;
        margin: 0.5em 0 0.3em 0;
        text-overflow: ellipsis;
        text-wrap: nowrap;
        max-width: 19em;
        overflow: hidden;
      }
      & div:nth-child(1) p {
        margin: 0;
        color: var(--secondary-text-color);
      }
    }
    &__control {
      display: flex;
      justify-content: space-between;
      & h2 {
        margin: 0;
        text-align: center;
        text-transform: capitalize;
        color: var(--secondary-text-color);
        user-select: none;
      }
      & input {
        width: 2em;
        background: none;
        outline: none;
        border: none;
        background-position: center;
        background-repeat: no-repeat;
        padding-block: 0;
        padding-inline: 0;
        cursor: pointer;
      }
      & input:nth-child(1) {
        background-image: url("@/share/assets/icons/arrowLeftIcon.svg");
      }
      & input:nth-child(3) {
        background-image: url("@/share/assets/icons/arrowRightIcon.svg");
      }
    }
    &__comments {
      margin-top: 0.5em;
      display: flex;
      flex-direction: column;
      gap: 0.5em;
      & div {
        display: flex;
        align-items: center;
        gap: 0.5em;
        & img {
          width: 2em;
        }
        & p {
          margin: 0;
        }
      }
    }
    & button {
      margin-top: 0.5em;
      display: block;
      padding: 1em 0;
      width: 100%;
      border: none;
      outline: none;
      background-color: var(--primary-color);
      color: var(--text-color);
      border-radius: 0.4em;
      cursor: pointer;
    }
    & button:hover {
      background-color: var(--primary-hover-color);
    }
  }
  .null-task {
    text-align: center;
  }
  @media screen and (max-width: 480px) {
    .tasks-list {
      cursor: default;
      &__title {
        & h2 {
          font-size: 1em;
        }
      }
      &__control {
        display: flex;
        justify-content: space-between;
        width: 100%;
        & h2 {
          font-size: 1em;
        }
        & input {
          width: 1.5em;
        }
      }
      &__comments {
        & div {
          & img {
            width: 1.5em;
          }
        }
      }
      & button {
        padding: 0.5em 0;
      }
    }
  }
</style>
