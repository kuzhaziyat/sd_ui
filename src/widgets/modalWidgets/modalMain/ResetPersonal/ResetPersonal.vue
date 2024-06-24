<script lang="ts" setup>
  import { useStore } from "@/entities";
  import { doRequest } from "@/helpers";
  import { computed, onMounted, ref } from "vue";
  import { useRoute, useRouter } from "vue-router";
  import { textAreaComp } from "@/share/UI";
  import { FileUploader } from "@/featues";

  const route = useRoute();
  const router = useRouter();
  const store = useStore();
  const emit = defineEmits(["close"]);
  const fileUploaded = ref<{ filename: string; mimetype: string; size: number; url: string }[]>([]);
  const __wrp = ref();
  const pers = store.state.personal.personalList.find((pers) => pers.id === parseInt(route.params.index as string));
  const payload = ref({ textVal: "", id: pers?.id, files: fileUploaded, timeStart: "" });
  const today = ref(getDate());

  function getDate() {
    const regex = new RegExp(/(\d{4}-\d{2}-\d{2})/);
    const mutch = new Date().toISOString().match(regex);
    if (mutch?.length) {
      return mutch[0];
    } else return "";
  }
  function close(e: Event, close?: boolean) {
    if (close) return emit("close");
    const target = e.target as HTMLElement;
    if (target.className === "task__actions") emit("close");
  }

  function recallPerson() {
    if (!payload.value.timeStart) {
      store.commit("events/PUSH_MESSAGE", {
        id: undefined,
        message: "Заполните дату отзыва",
        type: "error",
      });
      return;
    }
    if (payload.value.id) {
      payload.value.files = fileUploaded.value;
      store.commit("componentLoader/TOGGLE_STATE");
      emit("close");
      return new Promise((resolve) => {
        doRequest("/personal/recall", {
          method: "POST",
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
          body: JSON.stringify({ ...payload.value }),
        })
          .then(() => {
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
    } else {
      store.commit("events/PUSH_MESSAGE", {
        id: undefined,
        message: "Не найден пользователь",
        type: "error",
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
        <h3>Отозвать сотрудника?</h3>
        <p>Введите номер приказа и примечание</p>
        <textAreaComp :textVal="payload.textVal" @inputVal="(value:string) => ( payload.textVal = value)" />
        <div>
          <div>
            <p class="info-title">Дата отзыва</p>
            <div>
              <input type="date" id="_date" v-model="payload.timeStart" :min="today" />
            </div>
          </div>
          <div>
            <p>Прикрепить файл</p>
            <FileUploader :exctraClass="true" @uploaded="fileUploaded!" ref="childComponentRef" />
          </div>
        </div>

        <div>
          <button @click="$emit('close', false)" class="cancel">Отмена</button>
          <button @click="recallPerson()" class="aproved">Подтвердить</button>
        </div>
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
      & p {
        margin: 0;
      }
      & div {
        display: flex;
        gap: 1em;
        align-items: center;
        & div {
          flex-direction: column;
        }
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
