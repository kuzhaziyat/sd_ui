<script lang="ts" setup>
  import { useStore } from "@/entities";
  import { doRequest } from "@/helpers";
  import { computed, onMounted, ref } from "vue";
  import { useRoute, useRouter } from "vue-router";
  import { textAreaComp } from "@/share/UI";
  const route = useRoute();
  const store = useStore();
  const emit = defineEmits(["close"]);
  const __wrp = ref();

  function close(e: Event, close?: boolean) {
    if (close) return emit("close");
    const target = e.target as HTMLElement;
    if (target.className === "task__actions") emit("close");
  }
  const payload = ref<{
    taskId: number | null;
    comment: string;
  }>({ taskId: null, comment: "" });

  function returnInWork() {
    payload.value.taskId = parseInt(route.params.id as string);
    if (payload.value.taskId) {
      emit("close");
      return new Promise((resolve) => {
        store.commit("componentLoader/TOGGLE_STATE");
        doRequest("/tasks/update/return", {
          method: "POST",
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
          body: JSON.stringify(payload.value),
        }).then(() => {
          Promise.all([store.dispatch("tasks/GET_ALL_INFO"), store.dispatch("personal/GET_PERSONAL_LIST")])
            .then(() => {
              store.commit("componentLoader/TOGGLE_STATE");
              resolve(true);
            })
            .catch((error) => {
              store.commit("componentLoader/TOGGLE_STATE");
              store.commit("events/PUSH_MESSAGE", {
                id: undefined,
                message: error,
                type: "error",
              });
            });
        });
      });
    }
  }

  onMounted(() => {
    __wrp.value?.focus();
  });
</script>

<template>
  <div class="task__actions" @click="close" @keyup.esc="$emit('close', false)" ref="__wrp" tabindex="0">
    <div class="setdepartment">
      <div class="setdepartment__wrp">
        <h2>Подтвердить возврат задачи в работу</h2>
        <p>Причина возврата</p>
        <textAreaComp :textVal="payload.comment" @inputVal="(value:string) => (payload.comment = value)"></textAreaComp>
        <div>
          <button @click="$emit('close', false)" class="cancel">Отмена</button>
          <button @click="returnInWork()" class="aproved">Подтвердить</button>
        </div>
      </div>
      <button type="button" class="close" @click="close($event, true)"></button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  p {
    margin: 0;
  }
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
      & div {
        display: flex;
        gap: 1em;
        & .aproved {
          background-color: var(--primary-color);

          &:hover {
            background-color: var(--primary-hover-color) !important;
          }
        }
        & .cancel {
          background-color: var(--secondary-text-color);

          &:hover {
            background-color: var(--button-deactivate-color) !important;
          }
        }
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
        color: var(--text-color);
        border-radius: 0.4em;
        cursor: pointer !important;
        transition: transform 0.2s ease;

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
