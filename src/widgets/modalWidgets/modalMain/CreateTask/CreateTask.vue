<script lang="ts" setup>
  import { router, useStore } from "@/entities";
  import { doRequest } from "@/helpers";
  import { computed, onMounted, ref } from "vue";
  import { textInput, textAreaComp, activeButton } from "@/share/UI";
  import { FileUploader } from "@/featues";
  import { fileUploadedList } from "@/widgets";
  import { onBeforeRouteLeave } from "vue-router";

  interface iPayload {
    target: 1 | 2;
    controlId: number | null;
    priorityId: number;
    executorId: number | null;
    title: string;
    description: string;
    executororg: { orgId: number }[];
    files: { filename: string; mimetype: string; size: number; url: string }[];
    deadLine: string | null;
  }
  const payload = ref<iPayload>({
    target: 1,
    controlId: null,
    priorityId: parseInt(localStorage.getItem("payload/createRequest/priorityId")!) ?? 2,
    executorId: null,
    title: localStorage.getItem("payload/createRequest/title")! ?? "",
    description: localStorage.getItem("payload/createRequest/description")! ?? "",
    executororg: [],
    files: [],
    deadLine: null,
  });

  const store = useStore();
  const emit = defineEmits(["close"]);
  const dateCheked = ref(false);
  const timeCheked = ref(false);
  const isHead = store.state.user.info.isHead;
  const selectedOrgs = ref<Map<number, true>>(new Map());
  const requiredData = computed(() => store.state.tasks.requiredData);
  const all = ref(false);
  const fileUploadedModal = ref(false);
  const today = ref(getDate());

  function getDate() {
    const regex = new RegExp(/(\d{4}-\d{2}-\d{2})/);
    const mutch = new Date().toISOString().match(regex);
    if (mutch?.length) {
      return mutch[0];
    } else return "";
  }

  function selectOrg(id: number | "all") {
    if (!id) return;
    if (typeof id === "string" && id === "all") {
      if (all.value) {
        selectedOrgs.value.clear();
        all.value = false;
      } else {
        all.value = true;
        store.state.tasks.requiredData.orgs.forEach((org) => selectedOrgs.value.set(org.id, true));
      }
    } else {
      if (selectedOrgs.value.has(id)) return selectedOrgs.value.delete(id);
      selectedOrgs.value.set(id, true);
    }
  }

  function checkExist(id: number) {
    return selectedOrgs.value.has(id);
  }

  function setPlanedDate(e: Event) {
    e.preventDefault();
    const button = e.target as HTMLButtonElement;
    if (button.classList.length > 1) {
      button.classList.remove("create-request__set-time-cheked");
      payload.value.deadLine = null;
      dateCheked.value = false;
      timeCheked.value = false;
    } else {
      button.classList.add("create-request__set-time-cheked");
      dateCheked.value = true;
    }
    return;
  }

  function setPlanedTime(e: Event) {
    e.preventDefault();
    const button = e.target as HTMLButtonElement;
    if (button.classList.length > 1) {
      button.classList.remove("create-request__set-time-cheked");
      payload.value.deadLine = `${payload.value.deadLine?.split("T")[0]}T23:59:59`;
      timeCheked.value = false;
    } else {
      button.classList.add("create-request__set-time-cheked");
      timeCheked.value = true;
    }
    return;
  }

  const priorities = [
    {
      name: "Высокий",
      value: 1,
    },
    {
      name: "Обычный",
      value: 2,
    },
  ];

  const typeOfTasks = [{ name: "Внутреннее поручение", value: 1 }];

  function createRequest(e: Event) {
    if (payload.value.executorId === null) {
      store.commit("events/PUSH_MESSAGE", {
        id: undefined,
        message: "Вы не выбрали исполнителя",
        type: "error",
      });
      return;
    }
    if (payload.value.title === null) {
      store.commit("events/PUSH_MESSAGE", {
        id: undefined,
        message: "Вы не заполнили тему задачи",
        type: "error",
      });
      return;
    }
    if (payload.value.priorityId === null) {
      store.commit("events/PUSH_MESSAGE", {
        id: undefined,
        message: "Вы не заполнили приоритет задачи",
        type: "error",
      });
      return;
    }
    if (payload.value.controlId === payload.value.executorId) {
      store.commit("events/PUSH_MESSAGE", {
        id: undefined,
        message: "Исполнитель не может контролировать исполнение задачи",
        type: "error",
      });
      return;
    }

    if (selectedOrgs.value.size > 0) {
      for (const id of selectedOrgs.value.keys()) {
        payload.value.executororg.push({ orgId: id });
      }
    }
    emit("close", "createTask");
    store.commit("componentLoader/TOGGLE_STATE");
    doRequest("/tasks/create", {
      headers: { "Content-Type": "application/json; charset=utf-8" },
      method: "POST",
      body: JSON.stringify(payload.value),
    })
      .then(({ response }) => {
        localStorage.removeItem("payload/createRequest/title");
        localStorage.removeItem("payload/createRequest/description");
        localStorage.removeItem("payload/createRequest/priorityId");
        store.commit("componentLoader/TOGGLE_STATE");
        if (store.state.app.mobile) {
          router.back();
        }
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
    if (store.state.app.mobile) {
      store.commit("titles/SET_TITLE", "Новая задача");
      store.commit("app/CHANGE_STATE_RETURN", true);
    }
  });
  onBeforeRouteLeave((to, from, next) => {
    store.commit("app/CHANGE_STATE_RETURN", false);
    next();
  });
  function close(e: Event, close?: boolean) {
    localStorage.setItem("payload/createRequest/title", payload.value.title);
    localStorage.setItem("payload/createRequest/description", payload.value.description);
    localStorage.setItem("payload/createRequest/priorityId", payload.value.priorityId.toString());

    if (close) return emit("close", "createTask");
    const target = e.target as HTMLElement;
    if (target.className === "create-request") emit("close", "createTask");
  }

  function fileuploaded(file: { filename: string; mimetype: string; size: number; url: string }) {
    payload.value.files.push(file);
    fileUploadedModal.value = true;
  }

  function selectControl(val: Event) {
    const { value } = val.target as HTMLInputElement;

    payload.value.controlId = parseInt(value);
  }
  function selectExecuted(val: Event) {
    const { value } = val.target as HTMLInputElement;

    payload.value.executorId = parseInt(value);
  }

  function setTime(e: Event) {
    const { value } = e.target as HTMLInputElement;
    payload.value.deadLine = `${payload.value.deadLine?.split("T")[0]}T${value}:00`;
  }

  function setDate(e: Event) {
    const { value } = e.target as HTMLInputElement;
    if (payload.value.deadLine && /23:59:59/.test(payload.value.deadLine)) {
      payload.value.deadLine = `${value}T${payload.value.deadLine?.split("T")[1]}`;
      return;
    }
    payload.value.deadLine = `${value}T23:59:59`;
  }

  onMounted(() => {
    document.addEventListener("keyup", (e) => {
      if (e.key === "Escape") emit("close", "createTask");
    });
  });
</script>

<template>
  <div class="create-request" @mousedown="close" @keyup.esc="$emit('close', 'createTask')">
    <form @submit.prevent="createRequest" class="form">
      <p class="form__title extra" v-if="!store.state.app.mobile">Создать задачу</p>
      <div class="form__column">
        <div class="create-request__wrp">
          <div class="form__content create-request__theme">
            <p class="form__title required">Тема:</p>

            <textInput :textVal="payload.title" @inputVal="(value:string) => (payload.title = value)" :readonly="false" required></textInput>
          </div>
          <div class="form__content create-request__select">
            <div v-if="isHead">
              <p class="form__title required">Тип:</p>
              <select required v-model="payload.target">
                <option v-for="typ in typeOfTasks" :key="typ.name" :value="typ.value">{{ typ.name }}</option>
              </select>
            </div>
            <div>
              <p class="form__title required">Приоритет:</p>
              <select required v-model="payload.priorityId">
                <option v-for="prio in priorities" :key="prio.name" :value="prio.value">{{ prio.name }}</option>
              </select>
            </div>
          </div>
          <div class="form__content create-request__description">
            <p class="form__title">Описание:</p>
            <textAreaComp :textVal="payload.description" @inputVal="(value:string) => (payload.description = value)"></textAreaComp>
            <p class="form__title" v-if="payload.files.length && !store.state.app.mobile">Загруженно {{ payload.files.length }} файлов(а)</p>
            <div v-if="!store.state.app.mobile" class="button-wrp">
              <FileUploader @uploaded="fileuploaded" />
              <label class="button-label" v-if="payload.files.length" @click="fileUploadedModal = true">Посмотреть файлы</label>
            </div>
          </div>
        </div>

        <div class="create-request__orgs-wrp">
          <div style="display: flex; flex-direction: column; gap: 1em">
            <div class="form__content create-request__select">
              <div>
                <p class="form__title required">Исполнитель:</p>
                <select required @change="selectExecuted">
                  <option :value="null" selected disabled>Выберите исполнителя</option>
                  <option v-for="vice in requiredData?.inner" :key="vice.name" :value="vice.id">{{ vice.name }}</option>
                </select>
              </div>
            </div>
            <div class="form__content create-request__select">
              <div>
                <p class="form__title">Контроль за исполнением:</p>
                <select @change="selectControl">
                  <option :value="null" selected disabled>Выберите ответственного</option>
                  <option v-for="vice in requiredData?.inner" :key="vice.name" :value="vice.id">{{ vice.name }}</option>
                </select>
              </div>
            </div>
            <div class="form__content create-request__orgs" v-if="payload.target !== 1 && payload.target !== null">
              <p class="form__title">Выбрать оргнизацию:</p>
              <div>
                <p v-for="org in requiredData?.orgs" :key="org.id" @click="selectOrg(org.id)" class="select-orgs" :class="{ 'selected-org': checkExist(org.id) }">{{ org.name }}</p>
              </div>
              <p @click="selectOrg('all')" class="select-orgs" :class="{ 'selected-org': all }" style="width: max-content; align-self: center">Все</p>
            </div>
            <div class="form__content create-request__datetime">
              <label for="_date-button" class="form__date-button"
                >Запланировать дату исполнения
                <button class="create-request__set-time" @click="setPlanedDate" id="_date-button"></button>
              </label>
            </div>
            <div class="form__content create-request__datetime" v-if="dateCheked">
              <input type="date" id="_date" @change="setDate" required :min="today" />
            </div>
            <div class="form__content create-request__datetime" v-else>
              <input type="datetime-local" id="_date" style="opacity: 0" />
            </div>
            <label for="_datetime-button" class="form__date-button" v-if="dateCheked"
              >Запланировать время
              <button class="create-request__set-time" @click="setPlanedTime" id="_datetime-button"></button>
            </label>
            <div class="form__content create-request__datetime" v-if="timeCheked">
              <input type="time" id="_time" @change="setTime" />
            </div>
            <div class="form__content create-request__datetime" v-else>
              <input type="time" id="_time" style="opacity: 0" />
            </div>
            <div class="form__content">
              <p class="form__title" v-if="payload.files.length && store.state.app.mobile">Загруженно {{ payload.files.length }} файлов(а)</p>
              <div v-if="store.state.app.mobile" class="button-wrp">
                <FileUploader @uploaded="fileuploaded" />
                <label class="button-label" v-if="payload.files.length" @click="fileUploadedModal = true">Посмотреть файлы</label>
              </div>
            </div>
          </div>
          <div class="form__submit-button">
            <input type="submit" class="form__buttons" value="Создать" />
          </div>
          <button type="button" class="close" v-if="!store.state.app.mobile" @click="close($event, true)"></button>
        </div>
      </div>
    </form>
  </div>
  <fileUploadedList
    v-if="fileUploadedModal"
    :textBool="false"
    :files="payload.files"
    @sendFiles="
      (files) => {
        payload.files = files;
      }
    "
    @close="fileUploadedModal = false"
    @addFiles="(file) => fileuploaded(file)"
    @deleteFiles="(index) => payload.files.splice(index, 1)"
  />
</template>

<style lang="scss" scoped>
  @media screen and (max-width: 480px) {
    .form__column {
      flex-direction: column;
      gap: 1em;
    }
    .create-request {
      width: 100%;
      &__orgs-wrp {
        gap: 1em;
        width: calc(100vw - 2em);
      }
    }
    .form {
      padding: 1em;
      width: calc(100% - 2em);
    }
    .form__title {
      font-size: 1em;
    }
    .form__submit-button {
      justify-content: center;
    }
  }
  @media screen and (min-width: 480px) {
    .form__title {
      font-size: 1.1em;
    }
    .form__column {
      justify-content: space-between;
    }
    .create-request {
      position: absolute;
      width: 100%;
      height: 100%;
      background-color: var(--darkening-background);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 2em;
      z-index: 3;
      &__orgs-wrp {
        flex-basis: 48%;
        gap: 0.5em;
      }
      & form {
        width: 60%;
        height: 50%;
        padding: 2em;
        display: flex;
        flex-direction: column;
        gap: 1em;
        background-color: var(--secondary-background-color);
      }
    }
    .form__submit-button {
      justify-content: end;
    }
  }
  .button-label {
    display: block;
    width: max-content;
    outline: none;
    border: none;
    background-color: transparent;
    padding: 0.6em 1em;
    background-color: var(--primary-color);
    border-radius: 0.4em;
    color: var(--text-color);
    cursor: pointer;
    transition: transform 0.2s ease;
    &:hover {
      background-color: var(--primary-hover-color) !important;
    }
    &:active {
      transform: scale(0.95);
    }
  }
  .button-wrp {
    display: flex;
    gap: 0.5em;
  }
  .form {
    position: relative;
    border-radius: 0.4em;
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
  .select-orgs {
    margin: 0;
    padding: 0.4em;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    flex-basis: 20%;
    flex-wrap: wrap;
    text-align: center;
    aspect-ratio: 5/2;
    height: max-content;
    border: 0.1em solid var(--fourth-border-color);
    border-radius: 0.4em;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: wrap;
    word-break: break-word;
    cursor: pointer;
  }
  .form__column {
    display: flex;
    height: 100%;
    & input {
      justify-self: auto;
      padding: 0.5em;
      outline: none;
      border: 0.1em solid var(--fourth-border-color);
      border-radius: 0.4em;
      word-wrap: break-word !important;
    }
    & input[type="file"] {
      display: none;
    }
  }
  .form__title {
    margin: 0;
    text-align: left;
    color: var(--secondary-border-color);
  }
  .form__date-button {
    display: flex;
    flex-direction: column;
    gap: 1em;
    align-items: center;
  }
  .form__content {
    display: flex;
    flex-direction: column;
    gap: 1em;
  }
  .form__submit-button {
    display: flex;
  }
  .form__buttons {
    display: block;
    outline: none;
    border: none !important;
    background-color: transparent;
    padding: 0.6em 1em;
    background-color: var(--primary-color);
    border-radius: 0.4em;
    color: var(--text-color);
    cursor: pointer;
    transition: transform 0.2s ease;
    &:hover {
      background-color: var(--primary-hover-color) !important;
    }
    &:active {
      transform: scale(0.95);
    }
  }

  .extra {
    font-size: 1.5em;
  }
  .create-request {
    &__orgs-wrp {
      display: flex;
      flex-direction: column;
      height: 100%;
      justify-content: space-between;
    }
    &__orgs {
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      overflow: hidden;
      & > p:nth-child(1) {
        text-align: center;
      }
      & div {
        display: flex;
        flex-wrap: wrap;
        gap: 0.4em;
        flex-grow: 1;
        overflow-y: scroll;
      }
    }
    &__set-time {
      position: relative;
      outline: none;
      border: none;
      display: block;
      width: 4em;
      aspect-ratio: 16/7;
      background-color: transparent;
      background-color: var(--fourth-background-color);
      border-radius: 2em;
      gap: 0.4em;
      &::after {
        content: "";
        width: 1.7em;
        aspect-ratio: 1/1;
        border-radius: 50%;
        background-color: var(--third-background-color);
        position: absolute;
        left: 0;
        transform: translate(0, -50%);
        transition: all 0.1s;
      }
    }
    &__set-time-cheked {
      background-color: var(--button-background-button);
      &::after {
        left: calc(100% - 1.7em);
        right: 0 !important;
        background-color: var(--primary-color);
      }
    }

    &__wrp {
      display: flex;
      flex-direction: column;
      gap: 1em;
      flex-basis: 48%;
    }
    &__select {
      width: 100%;
      display: flex;
      gap: 1em;
      & div {
        width: 100%;
        display: flex;
        flex-direction: column;
        flex-wrap: wrap;
        box-sizing: border-box;
        gap: 1em;
        & select {
          border: none;
          padding: 0;
          width: 100%;
          display: flex;
          flex-wrap: wrap;
          outline: none;
          padding: 0.5em;
          border: 0.1em solid var(--fourth-border-color);
          border-radius: 0.4em;
          & option {
            margin: 0;
            flex-basis: 48%;
            text-overflow: ellipsis;
            overflow: hidden;
            white-space: nowrap;
          }
        }
      }
    }
    &__datetime {
      display: flex;
      flex-direction: column;
      align-items: center;
      & input[type="datetime-local"] {
        border: none;
        outline: none;
        padding: 0.4em 0.5em;
        border: 0.1em solid var(--fourth-border-color);
        border-radius: 0.4em;
      }
    }
    &__description {
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      & textarea {
        border: none;
        display: block;
        outline: none;
        flex-grow: 1;
        resize: none;
        white-space: pre-wrap;
        overflow-wrap: break-word;
        padding: 0.2em 0.4em;
        border: 0.1em solid var(--fourth-border-color);
        border-radius: 0.4em;
      }
    }

    &__theme {
      display: flex;
      flex-direction: column;
      & input {
        flex-grow: 1;
      }
    }
  }
  .selected-org {
    color: var(--text-color);
    border: 0.1em solid var(--primary-color) !important;
    background-color: var(--primary-color);
  }
</style>
