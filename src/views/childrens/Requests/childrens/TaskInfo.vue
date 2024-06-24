<script lang="ts" setup>
  import { useStore } from "@/entities";
  import { computed, onMounted, onUpdated, ref, watch } from "vue";
  import { onBeforeRouteLeave, useRoute } from "vue-router";
  import { SetApproved, SetDepartment, SetExecuted, SetExecutor, SetSoExecutor, SetConfirm, SetReturnInWork, SetAgreement } from "@/widgets";
  import { loader, MainInfoTask, AsideInfoTask, Comments, AsideHistory } from "@/widgets";
  import FilesList from "@/widgets/TaskWidgets/FilesList/FilesList.vue";
  const store = useStore();
  const route = useRoute();
  const loaderState = ref(false);
  const _Id = route.params.id as string;
  const task = computed(() => store.state.tasks.task);
  const personalList = computed(() => store.state.personal.personalList);
  const rightiewState = ref("info");
  const _info = ref<HTMLDivElement>();
  const events = computed(() => store.state.events.messages);
  const actionState = ref<null | string>(null);
  const state = ref("info");
  const soexec = ref<boolean>(false);
  if (isNaN(parseInt(_Id))) throw new Error("Не валидный данные");

  function getTask() {
    return new Promise((resolve) => {
      store.dispatch("tasks/GET_TASK_BY_ID", route.params.id).then((res) => {
        resolve(true);
      });
    });
  }
  watch(events.value, (e) => {
    loaderState.value = false;
    getTask().then(() => {
      return (loaderState.value = true);
    });
  });

  onUpdated(() => {
    store.commit("titles/SET_TITLE", "Задача № " + String(task.value?.number).padStart(6, "0"));
  });
  onMounted(() => {
    if (store.state.app.stateTask == "") {
      store.commit("app/CHANGE_STATE_TASK", "task");
      store.commit("app/CHANGE_STATE_RETURN", true);
    }
    store.dispatch("personal/GET_PERSONAL_LIST").then((a) => {
      getTask().then(() => (loaderState.value = true));
    });
  });

  onBeforeRouteLeave((to, from, next) => {
    if (store.state.app.stateTask !== "task") {
      store.commit("app/CHANGE_STATE_TASK", "task");
      next(false);
    } else if (store.state.app.stateTask === "task") {
      store.commit("app/CHANGE_STATE_TASK", "");
      store.commit("app/CHANGE_STATE_RETURN", false);
      next();
    } else {
      store.commit("app/CHANGE_STATE_RETURN", false);
      next();
    }
  });

  function closeWindow(e: string) {
    actionState.value = null;
    soexec.value = false;
  }
</script>

<template>
  <loader v-if="!loaderState" />
  <div v-else class="task" v-if="task" ref="_info" tabindex="1">
    <div class="task__left" v-if="!store.state.app.mobile || store.state.app.stateTask !== 'task'">
      <div class="task__left__menu" v-if="!store.state.app.mobile">
        <p @click="state = 'info'" :class="{ active: state === 'info' }">Основная Информация</p>
        <p @click="state = 'chat'" :class="{ active: state === 'chat' }">Обсуждения</p>
        <p @click="state = 'files'" :class="{ active: state === 'files' }">Вложения</p>
      </div>
      <div v-if="(state === 'chat' && !store.state.app.mobile) || (store.state.app.mobile && store.state.app.stateTask === 'chat')" class="task__left__info">
        <Comments :task="task" :personalList="personalList" />
      </div>

      <div v-if="state === 'info' && !store.state.app.mobile" class="task__left__info">
        <MainInfoTask :task="task"></MainInfoTask>
      </div>
      <div v-if="state === 'files' || (store.state.app.mobile && store.state.app.stateTask === 'files')" class="task__left__info">
        <FilesList :task="task" />
      </div>
    </div>
    <div class="task__right" v-if="store.state.app.stateTask === 'task'">
      <div class="task__right__views">
        <input
          type="button"
          class="task__view_button task__view_button__right"
          :class="{ right__active: rightiewState === 'info' }"
          value="Информация"
          @click="rightiewState = 'info'"
        />
        <input
          type="button"
          class="task__view_button task__view_button__right"
          :class="{ right__active: rightiewState === 'history' }"
          value="История"
          @click="rightiewState = 'history'"
        />
      </div>
      <div class="task__right__info" v-if="rightiewState === 'info'">
        <AsideInfoTask
          :task="task"
          @action="
            (state) => {
              actionState = state;
            }
          "
          @soex="soexec = true"
        />
      </div>
      <div class="task__right__history" v-if="rightiewState === 'history'">
        <AsideHistory :task="task" :personalList="personalList" />
      </div>
    </div>
  </div>

  <SetSoExecutor v-if="soexec" @close="closeWindow" />
  <SetApproved v-if="actionState === 'setApproved'" @close="closeWindow" />
  <SetDepartment v-if="actionState === 'setDepartment'" @close="closeWindow" />
  <SetExecuted v-if="actionState === 'setExecuted'" @close="closeWindow" />
  <SetExecutor v-if="actionState === 'setExecutor'" @close="closeWindow" />
  <SetConfirm v-if="actionState === 'setConfirm'" @close="closeWindow" />
  <SetReturnInWork v-if="actionState === 'setReturnInWork'" @close="closeWindow" />
  <SetAgreement v-if="actionState === 'setAgreement'" @close="closeWindow" />
</template>

<style lang="scss" scoped>
  @media screen and (max-width: 480px) {
    .task__right {
      width: 100%;
    }
  }
  @media screen and (min-width: 480px) {
    .task__right {
      flex-basis: 40%;
      border-left: 0.1em solid var(--fourth-border-color);
    }
  }
  .task__view_button {
    display: block;
    outline: none;
    border: none;
    background-color: transparent;
    padding: 0.4em 0.5em;
    background-color: var(--fourth-background-color);
    color: var(--secondary-background-color);
    font-size: 1.2em;
  }
  .task__view_button__left {
    border-top-right-radius: 0.4em;
    border-top-left-radius: 0.4em;
    border-top: 0.1em solid var(--fourth-border-color);
    border-left: 0.1em solid var(--fourth-border-color);
    border-right: 0.1em solid var(--fourth-border-color);
  }
  .task__view_button__right {
    flex-grow: 1;
    flex-basis: calc(50% - 0.2em);
  }
  .task__view_button__right:not(.right__active):nth-child(1) {
    border-radius: none;
    border-top-right-radius: 0.4em;
  }
  .task__view_button__right:not(.right__active):nth-child(2) {
    border-radius: none;
    border-top-left-radius: 0.4em;
  }

  .task {
    display: flex;
    flex-grow: 1;
    &__left {
      width: 100%;
      padding: 1em 0 0 0;
      flex: 1 1 auto;
      display: flex;
      flex-direction: column;
      &__title {
        padding: 0.5em 1em !important;
        background-color: transparent !important;
        & span {
          color: var(--fourth-text-color);
          font-size: 2em;
        }
        & p {
          margin: 0;
        }
      }
      &__menu {
        display: flex;
        flex-direction: row;
        padding-left: 2em;
        gap: 1em;
        box-sizing: border-box;
        border-width: 2em 2em 2em 2em;
        border-bottom: 0.1em solid var(--fourth-border-color);
        & p {
          cursor: pointer;
          margin: 0;
          padding: 1em;
          background-color: var(--fourth-background-color);
          border-radius: 0.4em 0.4em 0 0;
          border: 0.1em solid var(--fourth-border-color);
          border-bottom: none;
          color: var(--text-color);
        }
        & .active {
          position: relative;
          background-color: var(--background-color);
          border-bottom: none;
          color: var(--primary-color);
          &::after {
            content: "";
            position: absolute;
            bottom: -0.1em;
            left: 0;
            width: 100%;
            height: 0.1em;
            background-color: var(--background-color);
            z-index: 2;
          }
        }
      }
      &__wrp {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
      }
      &__info {
        display: flex;
        height: 100%;
      }
      &__title {
        display: flex;
        align-items: center;
        gap: 1em;
        background-color: var(--secondary-background-color);
        padding: 0 0 3em 2em;
        font-size: 1.2em;
        & h1 {
          color: var(--third-text-color);
          margin: 1em 0;
        }
        & p {
          margin: 0;
          color: var(--secondary-text-color);
        }
      }
      &__views {
        background-color: transparent;
        display: flex;
        gap: 0.5em;
      }
      &__files {
        border-top: 0.1em solid var(--fourth-border-color);
      }
    }
    &__right {
      display: flex;
      flex-direction: column;
      background-color: var(--secondary-background-color);
      overflow: hidden;
      &__views {
        background-color: transparent;
        display: flex;
        & input {
          cursor: pointer;
        }
        & .right__active {
          cursor: auto;
        }
      }
      &__info {
        display: flex;
        min-height: 100%;
        flex-direction: column;
        overflow-y: auto;
        overflow-x: hidden;
        box-sizing: border-box;
        gap: 1em;
        padding: 1em;
      }
      &__history {
        display: flex;
        min-height: 100%;
        flex-direction: column;
        overflow-y: auto;
        overflow-x: hidden;
        box-sizing: border-box;
        gap: 1em;
        padding: 1em;
      }
    }
  }

  .right__active {
    background-color: var(--secondary-background-color);
    color: var(--primary-color);
    border-radius: none;
  }
</style>
