<script lang="ts" setup>
  import { useStore } from "@/entities";
  import { doRequest } from "@/helpers";
  import { ref, onMounted } from "vue";

  const store = useStore();
  const emit = defineEmits(["load", "close"]);
  const select = ref(false);

  const payload = ref({
    name: "",
    shortName: "",
    depId: null,
  });

  function close(e: Event, close?: boolean) {
    if (close) return emit("close", "addPosition");
    const target = e.target as HTMLElement;
    if (target.className === "positions") emit("close", "addPosition");
  }

  onMounted(() => {
    document.addEventListener("keyup", (e) => {
      if (e.key === "Escape") emit("close", "addPosition");
    });
  });
  function changeToggleUp() {
    select.value = true;
  }
  function changeToggleDown(e: Event) {
    select.value = false;
    (e.target as HTMLElement).blur();
  }

  function createPos() {
    emit("close", "addPosition");
    store.commit("componentLoader/TOGGLE_STATE");
    doRequest("/positions/create", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(payload.value),
    }).then(({ response }) => {
      Promise.all([store.dispatch("tasks/GET_ALL_INFO"), store.dispatch("personal/GET_PERSONAL_LIST"), store.dispatch("personal/GET_REQUIRED_DATA")]).then(() => {
        payload.value.name = "";
        payload.value.shortName = "";
        payload.value.depId = null;
        store.commit("componentLoader/TOGGLE_STATE");
      });
    });
  }
</script>

<template>
  <div class="positions" @mousedown="close" @keyup.esc="close">
    <div>
      <div class="positions-wrp">
        <h3>Создать должность</h3>
        <div>
          <label> Наименование</label>
          <input type="text" v-model="payload.name" />
        </div>
        <div>
          <label>Короткое наименование</label>
          <input type="text" v-model="payload.shortName" />
        </div>
        <div>
          <label>Структурное подразделение</label>
          <select v-model="payload.depId" :class="{ selected: select, unselected: !select }" @change="changeToggleDown" @focus="changeToggleUp" @blur="changeToggleDown">
            <option v-for="(department, index) in $store.state.personal.departments" :key="index" :value="department.id">{{ department.name }}</option>
          </select>
        </div>

        <button
          :disabled="payload.name.length < 3 || payload.shortName.length < 3 || payload.depId === null"
          :class="{ 'active-button': payload.name.length > 2 && payload.shortName.length > 2 && payload.depId }"
          @click="createPos"
        >
          Создать
        </button>
      </div>
      <button type="button" class="close" @click="close($event, true)"></button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .positions {
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: var(--darkening-background);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 3;
    & div {
      position: relative;
    }
    & .positions-wrp {
      border-radius: 0.4em;
      padding: 2em 5em;
      position: relative;
      display: flex;
      flex-direction: column;
      gap: 2em;
      background-color: var(--secondary-background-color);
      & div {
        display: flex;
        flex-direction: column;
        gap: 0.5em;
        width: 100%;
      }

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
  .close {
    display: block;
    position: absolute;
    outline: none;
    border: none;
    background-color: transparent;
    width: 1.5em;
    aspect-ratio: 1/1;
    border-radius: 1em;
    background-image: url("@/share/assets/icons/closeIcon.svg");
    background-size: 50%;
    background-position: center center;
    background-repeat: no-repeat;
    cursor: pointer;
    right: 1em;
    top: 1em;
    transition: transform 0.2s ease;
    &:hover {
      background-image: url("@/share/assets/icons/closeDarkIcon.svg");
    }
    &:active {
      transform: scale(0.8);
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
</style>
