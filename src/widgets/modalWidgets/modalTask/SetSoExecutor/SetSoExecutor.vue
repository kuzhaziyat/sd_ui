<script lang="ts" setup>
  import { useStore } from "@/entities";
  import { doRequest } from "@/helpers";
  import { computed, onMounted, ref } from "vue";

  const store = useStore();
  const emit = defineEmits(["close"]);
  const __wrp = ref();

  const selectedDepartment = ref<null | number>(null);

  const executors = computed(() => store.state.tasks.requiredData);
  const departments = computed(() => store.state.personal.departments);
  const selected = ref<null | number>(null);
  const viceList = computed(() => {
    if (store.state.tasks.task?.soExecutors && Array.isArray(store.state.tasks.task?.soExecutors) && store.state.tasks.task?.soExecutors.length > 0) {
      const personal: iStore.Personal[] = [];
      for (let i = 0; i < store.state.personal.personalList.length; i++) {
        const match = store.state.tasks.task?.soExecutors.findIndex((p) => p.personalId === store.state.personal.personalList[i].id);
        if (match === -1) personal.push(store.state.personal.personalList[i]);
      }
      return personal.filter((pers) => pers.department.id === selectedDepartment.value);
    } else {
      return store.state.personal.personalList.filter((pers) => pers.department.id === selectedDepartment.value);
    }
  });

  function close(e: Event, close?: boolean) {
    if (close) return emit("close");
    const target = e.target as HTMLElement;
    if (target.className === "task__actions") emit("close");
  }

  function doAction() {
    if (!selected.value) return;
    const payload = {
      soexecutor: selected.value,
      taskId: store.state.tasks.task?.id,
    };
    emit("close");
    store.commit("componentLoader/TOGGLE_STATE");
    doRequest("/tasks/update/soexecutor", {
      headers: { "Content-Type": "application/json; charset=utf-8" },
      method: "POST",
      body: JSON.stringify(payload),
    })
      .then(({ response }) => {
        store.commit("componentLoader/TOGGLE_STATE");
      })
      .catch((error) => {
        store.commit("componentLoader/TOGGLE_STATE");
        store.commit("events/PUSH_MESSAGE", {
          id: undefined,
          message: error,
          type: "error",
        });
      });
  }

  onMounted(() => {
    __wrp.value?.focus();
  });
</script>

<template>
  <div class="task__actions" @click="close" @keyup.esc="$emit('close')" ref="__wrp" tabindex="0">
    <div class="setdepartment" v-if="$store.state.user.info.isVice || $store.state.user.info.isHead">
      <div class="setdepartment__wrp">
        <h1>Назначьте соисполнителя:</h1>
        <label>Структурное подразделение</label>
        <select v-model="selectedDepartment">
          <option v-for="(dep, index) in departments" :key="index" :value="dep.id">{{ dep.name }}</option>
        </select>
        <label>Соисполнитель</label>
        <select v-model="selected">
          <option v-for="(dep, index) in viceList" :key="index" :value="dep.id">{{ `${dep.lastName} ${dep.firstName[0]}. ${dep.surName[0]}.` }}</option>
        </select>
        <button :class="{ 'active-button': selected && selectedDepartment }" @click="doAction">Назначить</button>
      </div>
      <button type="button" class="close" @click="close($event, true)"></button>
    </div>
    <div class="setdepartment" v-else-if="$store.state.user.info.isDepHead">
      <div class="setdepartment__wrp">
        <h1>Назначьте соисполнителя:</h1>
        <select v-model="selected">
          <option v-for="(executor, index) in executors?.inner" :key="index" :value="executor.id">{{ executor.name }}</option>
        </select>
        <button :class="{ 'active-button': selected }" @click="doAction">Назначить</button>
      </div>
      <button type="button" class="close" @click="close($event, true)"></button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .task__actions {
    z-index: 5;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: var(--dark-background);
    display: grid;
    place-content: center;
  }
  .setdepartment {
    position: relative;
    &__wrp {
      border-radius: 0.4em;
      padding: 2em 5em;
      background-color: var(--secondary-background-color);
      position: relative;
      display: flex;
      flex-direction: column;
      gap: 1em;
      height: max-content;
      & input {
        outline: none;
        border: none;
        border: 0.1em solid var(--fourth-border-color);
        padding: 0.4em 0.4em;
        border-radius: 0.4em;
        color: var(--secondary-text-color);
      }
      & select {
        cursor: pointer;
        outline: none;
        border: none;
        border: 0.1em solid var(--fourth-border-color);
        padding: 0.4em 0.4em;
        border-radius: 0.4em;
        color: var(--secondary-text-color);
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
        background-size: 1em;
        background-position: calc(100% - 1em) center;
        background-repeat: no-repeat;
      }
      .selected {
        background-image: url("@/share/assets/icons/arrowStickUpIcon.svg") !important;
      }
      .unselected {
        background-image: url("@/share/assets/icons/arrowStickDownIcon.svg") !important;
      }

      & button {
        display: block;
        padding: 1em 0;
        width: 100%;
        border: none;
        outline: none;
        background-color: var(--button-deactivate-color);
        color: var(--text-color);
        border-radius: 0.4em;
        cursor: not-allowed;
        &:hover {
          color: var(--text-hover-color);
        }
      }
    }
  }
  .active-button {
    background: var(--primary-color) !important;
    cursor: pointer !important;
    transition: transform 0.2s ease;

    &:hover {
      background-color: var(--primary-hover-color) !important;
    }
    &:active {
      transform: scale(0.95);
    }
  }
  .close {
    display: block;
    position: absolute;
    outline: none;
    border: none;
    background-color: transparent;
    width: 1.5em;
    aspect-ratio: 1/1;
    background-image: url("@/share/assets/icons/closeIcon.svg");
    background-size: contain;
    background-position: center center;
    background-repeat: no-repeat;
    cursor: pointer;
    right: 1em;
    top: 1em;
    transition: transform 0.2s ease;

    &:active {
      transform: scale(0.8);
    }
  }
</style>
