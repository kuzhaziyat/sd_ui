<script lang="ts" setup>
  import { useStore } from "@/entities";
  import { doRequest } from "@/helpers";
  import { computed, onMounted, ref } from "vue";

  const store = useStore();
  const emit = defineEmits(["close"]);
  const __wrp = ref();

  function close(e: Event, close?: boolean) {
    if (close) return emit("close");
    const target = e.target as HTMLElement;
    if (target.className === "task__actions") emit("close");
  }

  function doAction() {
    const payload = {
      status: true,
      taskId: store.state.tasks.task?.id,
    };
    emit("close");

    store.commit("componentLoader/TOGGLE_STATE");
    doRequest("/tasks/update/executed", {
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
    <div class="setdepartment">
      <div class="setdepartment__wrp">
        <h1>Отметить исполненым</h1>
        <button @click="doAction">Подтвердить</button>
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

      & button {
        display: block;
        padding: 1em 0;
        width: 100%;
        border: none;
        outline: none;
        color: var(--text-color);
        border-radius: 0.4em;
        cursor: not-allowed;
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
</style>
