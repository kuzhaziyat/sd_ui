<script lang="ts" setup>
  import { useStore } from "@/entities";
  import { doRequest } from "@/helpers";
  import { ref, onMounted } from "vue";

  const store = useStore();
  const emit = defineEmits(["close", "load"]);

  const payload = ref({
    name: "",
  });

  function close(e: Event, close?: boolean) {
    if (close) return emit("close", "createDeparment");
    const target = e.target as HTMLElement;
    if (target.className === "department-modal") emit("close", "createDeparment");
  }

  onMounted(() => {
    document.addEventListener("keyup", (e) => {
      if (e.key === "Escape") emit("close", "createDeparment");
    });
  });

  function createDep() {
    emit("close", "createDeparment");
    store.commit("componentLoader/TOGGLE_STATE");
    doRequest("/departments/create", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(payload.value),
    }).then(({ response }) => {
      Promise.all([store.dispatch("tasks/GET_ALL_INFO"), store.dispatch("personal/GET_PERSONAL_LIST"), store.dispatch("personal/GET_REQUIRED_DATA")])
        .then(() => {
          payload.value.name = "";
          store.commit("componentLoader/TOGGLE_STATE");
        })
        .catch((error) => {
          store.commit("events/PUSH_MESSAGE", {
            id: undefined,
            message: error.message,
            type: "error",
          });
        });
    });
  }
</script>

<template>
  <div class="department-modal" @keyup.esc="close" @mousedown="close">
    <div class="departments-create">
      <div class="departments-wrp" tabindex="0">
        <h3>Создать структурноe подразделениe</h3>
        <div>
          <label>Наименование структурного подразделения</label>
          <input type="text" v-model="payload.name" />
        </div>
        <button :class="{ 'active-button': payload.name.length > 3 }" :disabled="payload.name.length < 4" @click="createDep">Создать</button>
      </div>
      <button type="button" class="close" @click="close($event, true)"></button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .department-modal {
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: var(--darkening-background);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 3;
    & .departments-create {
      border-radius: 0.4em;
      padding: 2em 5em;
      background-color: var(--secondary-background-color);
      position: relative;
      display: flex;
      flex-direction: column;
      gap: 2em;

      & .departments-wrp {
        display: flex;
        flex-direction: column;
        gap: 2em;
        & div {
          display: flex;
          flex-direction: column;
          gap: 0.5em;
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
