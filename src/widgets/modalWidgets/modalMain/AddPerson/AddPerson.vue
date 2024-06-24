<script lang="ts" setup>
  import { router, useStore } from "@/entities";
  import { doRequest } from "@/helpers";
  import { computed, onMounted, ref } from "vue";
  import { useRoute } from "vue-router";
  import { loader } from "@/widgets";

  const store = useStore();
  const emit = defineEmits(["close"]);
  const loaderState = ref(false);
  const userCheked = ref(false);
  const createPositionState = ref(false);
  const route = useRoute();
  const dep = computed(() => store.state.personal.departments[parseInt(route.params.id as string)]);
  const payload = ref<{
    firstName: string;
    lastName: string;
    surName: string;
    departmentId: number | null;
    positionId: number | null;
    contacts: {
      email: string;
      mobile: string;
      phone: string;
    };
    user: { email: string; roles: number[] };
    positionName: null | {
      name: "";
      shortName: "";
    };
  }>({
    firstName: "",
    lastName: "",
    surName: "",
    departmentId: dep.value.id,
    positionId: null,
    contacts: {
      email: "",
      mobile: "",
      phone: "",
    },
    user: { email: "", roles: [] },
    positionName: null,
  });

  const positions = computed(() => {
    if (payload.value.departmentId) {
      const pos = store.state.personal.positions.filter((pos) => pos.depId === payload.value.departmentId);
      if (pos.length < 1) {
        payload.value.positionName = {
          name: "",
          shortName: "",
        };
      }
      return pos;
    }
    return [] as unknown as iStore.Positions[];
  });

  function setPosition(e: Event) {
    const { value } = e.target as HTMLInputElement;
    const id = parseInt(value);
    if (id === 0) {
      payload.value.positionName = {
        name: "",
        shortName: "",
      };
      createPositionState.value = true;
    } else {
      if (createPositionState.value) {
        payload.value.positionName = null;
        createPositionState.value = false;
      }
      payload.value.positionId = id;
    }
  }

  function createRequest(event: Event) {
    if (payload.value.positionId === null && payload.value.positionName === null) {
      store.commit("events/PUSH_MESSAGE", {
        id: undefined,
        message: "Вы не заполнили должность",
        type: "error",
      });
      return;
    }
    if (!userCheked.value) {
      payload.value.user = { email: "", roles: [] };
    }
    emit("close", "addPerson");

    store.commit("componentLoader/TOGGLE_STATE");

    doRequest("/personal/create", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(payload.value),
    })
      .then(({ response }) => {
        Promise.all([store.dispatch("personal/GET_PERSONAL_LIST")])
          .then(() => {
            payload.value.departmentId = null;
            payload.value.positionId = 0;
            payload.value.user = { email: "", roles: [] };
            payload.value.firstName = "";
            payload.value.lastName = "";
            payload.value.surName = "";
            payload.value.positionName = null;
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
      })
      .catch((error) => {
        store.commit("componentLoader/TOGGLE_STATE");
        store.commit("events/PUSH_MESSAGE", {
          id: undefined,
          message: error,
          type: "error",
        });
        emit("close", "addPerson");
      });
  }

  function close(e: Event, close?: boolean) {
    if (close) return emit("close", "addPerson");
    const target = e.target as HTMLElement;
    if (target.className === "create-request") emit("close", "addPerson");
  }

  function setUser(e: Event) {
    e.preventDefault();
    const button = e.target as HTMLButtonElement;
    if (button.classList.length > 1) {
      button.classList.remove("create-request__user-cheked");
      payload.value.user === undefined;
      userCheked.value = false;
    } else {
      button.classList.add("create-request__user-cheked");
      if (payload.value.user === undefined) payload.value.user = { email: "", roles: [] };
      userCheked.value = true;
    }
    return;
  }
  function checkExistStr(str?: string) {
    if (!str) return "";
    return str;
  }
  function activeState() {
    if (
      (payload.value.departmentId,
      payload.value.positionId,
      payload.value.user.email,
      payload.value.user.roles,
      payload.value.firstName,
      payload.value.lastName,
      payload.value.surName,
      payload.value.positionName)
    ) {
      return true;
    }

    return false;
  }
  function formatPhoneNumber(num: string) {
    const number = num.split("");
    return [
      checkExistStr(number[0]) ? `(${checkExistStr(number[0])}` : "",
      checkExistStr(number[1]),
      checkExistStr(number[2]) ? `${checkExistStr(number[2])})` : "",
      checkExistStr(number[3]),
      checkExistStr(number[4]),
      checkExistStr(number[5]) ? `${checkExistStr(number[5])}-` : "",
      checkExistStr(number[6]),
      checkExistStr(number[7]) ? `${checkExistStr(number[7])}-` : "",
      checkExistStr(number[8]),
      checkExistStr(number[9]),
      checkExistStr(number[10]),
    ].join("");
  }
  function inputChange(e: Event) {
    const event = e as unknown as InputEvent;
    const input = e.target as HTMLInputElement;
    if (event.data && /\D/.test(event.data)) return (input.value = formatPhoneNumber(input.value.replace(/\D/g, "")));
    if (input.value.length > 14) {
      const str = input.value.replace(/\(|\)|-|\D/g, "");
      input.value = formatPhoneNumber(str.slice(0, -1));
      return;
    }
    if (event.inputType === "insertText") {
      const str = input.value.replace(/\(|\)|-/g, "");
      if (/\d{10,}/.test(str)) payload.value.contacts.mobile = str;
      return (input.value = formatPhoneNumber(str));
    } else if (event.inputType === "deleteContentBackward") {
      if (/-|\)|\(/.test(input.value[input.value.length - 1])) input.value = input.value.slice(0, -1);
    } else if (event.inputType === "historyUndo") {
    } else if (event.inputType === "deleteContentForward") {
    }
  }
  onMounted(() => {
    document.addEventListener("keyup", (e) => {
      if (e.key === "Escape") emit("close", "addPerson");
    });
  });
</script>

<template>
  <div class="create-request" @mousedown="close">
    <form @submit.prevent="createRequest" class="form">
      <button type="button" class="close" @click="close($event, true)"></button>
      <div class="create-request__wrp">
        <p class="form__title extra">Новый сотрудник</p>
        <div class="form__content create-request__select">
          <div>
            <p class="form__title">Фамилия:</p>
            <input type="text" required v-model="payload.lastName" />
          </div>
          <div>
            <p class="form__title">Имя:</p>
            <input type="text" required v-model="payload.firstName" />
          </div>
          <div>
            <p class="form__title">Отчество:</p>
            <input type="text" required v-model="payload.surName" />
          </div>
        </div>
        <div class="form__content create-request__select">
          <div class="form__content">
            <label>Номер телефона</label>
            <div class="register-form__number">
              <span>+7</span>
              <input type="text" @input="inputChange" required />
            </div>
          </div>

          <div>
            <p class="form__title">Электронная почта:</p>
            <input type="email" required v-model="payload.contacts!.email" />
          </div>
        </div>
        <div class="form__content create-request__select">
          <!-- <div>
            <p class="form__title">Структурное подразделение:</p>
            <select required v-model="payload.departmentId">
              <option v-for="department in $store.state.personal.departments" :key="department.name" :value="department.id">{{ department.name }}</option>
            </select>
          </div> -->
          <div>
            <p class="form__title">Должность:</p>
            <select required @change="setPosition">
              <option :value="null" disabled selected>Выберите должность</option>
              <option v-for="(position, index) in positions" :key="index" :value="position.id">{{ position.name }}</option>
              <option value="0">{{ `Добавить должность для ${dep.name}` }}</option>
            </select>
          </div>

          <div v-if="createPositionState">
            <p class="form__title">Наименование новой должности:</p>
            <input type="text" v-model="payload.positionName!.name" />
            <p class="form__title">Короткое наименование новой должности:</p>
            <input type="text" v-model="payload.positionName!.shortName" />
          </div>
        </div>

        <div class="form__content create-request__select">
          <p class="form__title">Доступ в личный кабинет</p>
          <button class="create-request__user" @click="setUser" id="_date-button"></button>
        </div>
        <div :class="{ form__contact: true, active: userCheked }">
          <div class="form__roles">
            <p class="form__title">Роль в системе</p>
            <div class="form__list-roles">
              <label v-for="(role, index) in $store.state.personal.roles" :key="index" :for="`_roles${index}`" :title="role.descriptions">
                <input type="checkbox" name="roles" :id="`_roles${index}`" :value="role.id" v-model="payload.user.roles" />
                {{ role.name }}
              </label>
            </div>
          </div>
        </div>
        <div class="form__submit">
          <input type="submit" value="Создать" class="form__buttons" />
        </div>
      </div>
      <loader v-if="loaderState" />
    </form>
  </div>
</template>

<style lang="scss" scoped>
  .form__contact {
    visibility: hidden;
  }
  .active {
    visibility: visible;
  }
  .form {
    position: relative;
    border-radius: 0.4em;
    &__roles {
      width: 100%;
      display: flex;
      justify-content: center;
      flex-direction: column;
      align-items: center;
      gap: 1em;
      & div {
        display: flex;
        flex-wrap: wrap !important;
        flex-direction: row !important;
        & label {
          flex-basis: 33%;
          flex-grow: 0;
          display: flex;
          align-items: center;
          gap: 0.5em;
          & input {
            display: block;
            text-align: center;
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
  .form__title {
    margin: 0;
    font-size: 1.1em;
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
    gap: 1em;
  }
  .form__submit-button {
    justify-self: flex-end;
    align-self: center;
  }
  .form__buttons {
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
  }
  .form__buttons:hover {
    background-color: var(--primary-color);
  }
  .extra {
    font-size: 1.5em;
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
    & form {
      padding: 2em;
      display: flex;
      gap: 1em;
      justify-content: space-between;
      background-color: var(--secondary-background-color);
      & input[type="text"]:first-letter {
        text-transform: capitalize;
      }
      & input[type="text"],
      input[type="email"],
      input[type="number"],
      select {
        outline: none;
        border: none;
        border: 0.1em solid var(--fourth-border-color);
        padding: 0.4em 0.4em;
        border-radius: 0.4em;
        color: var(--secondary-text-color);
      }
      & input[type="file"] {
        display: none;
      }
    }
    &__wrp {
      display: flex;
      flex-direction: column;
      gap: 1em;
    }

    &__select {
      display: flex;
      gap: 1em;
      & div {
        display: flex;
        flex-direction: column;
        flex-wrap: wrap;
        box-sizing: border-box;
        gap: 1em;
        & select {
          border: none;
          padding: 0;
          display: flex;
          flex-wrap: wrap;
          outline: none;
          border: 0.1em solid var(--fourth-border-color);
          padding: 0.2em 0.4em;
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
    &__user {
      position: relative;
      outline: none;
      border: none;
      display: block;
      width: 4em;
      aspect-ratio: 16/7;
      background-color: transparent;
      border-radius: 2em;
      background-color: var(--fourth-background-color);
      gap: 0.4em;
      &::after {
        content: "";
        width: 1.7em;
        aspect-ratio: 1/1;
        border-radius: 50%;
        position: absolute;
        left: 0;
        transform: translate(0, -50%);
        background-color: var(--third-background-color);
        transition: all 0.1s;
      }
    }
    &__user-cheked {
      background-color: var(--button-background-button);

      &::after {
        left: calc(100% - 1.7em);
        right: 0 !important;

        background-color: var(--primary-color);
      }
    }
  }

  .form__submit {
    flex-grow: 1;
    align-self: flex-end;
    justify-self: flex-end;
    display: flex;
    align-items: flex-end;
    justify-content: flex-end;
  }
  .register-form__number {
    display: flex;
    flex-direction: row !important;
    align-items: center !important;
    padding: 0 0.5em;
    border: 0.1em solid var(--fourth-border-color) !important;
    border-radius: 0.4em;
    gap: 0 !important;
    & input {
      border: none !important;
      padding: 0.5em 0;
    }

    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
  }
</style>
