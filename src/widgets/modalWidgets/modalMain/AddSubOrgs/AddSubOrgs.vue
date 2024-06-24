<script lang="ts" setup>
  import { useStore } from "@/entities";
  import { doRequest } from "@/helpers";
  import { ref, onMounted, computed } from "vue";
  import { textInput, selectInput } from "@/share/UI";

  const store = useStore();
  const emit = defineEmits(["close", "load"]);
  const addState = ref("sendInn");
  const check = ref(false);
  const organizationName = ref<{ name: string; inn: string; kpp: string }>();
  const payload = ref({
    inn: "",
    sub: "",
  });

  const selectInfo = ref([
    { name: "Подведомственная организация", value: true },
    { name: "Внешняя организация", value: false },
  ]);

  function close(e: Event, close?: boolean) {
    if (close) return emit("close", "addSubOrgs");
    const target = e.target as HTMLElement;
    if (target.className === "department-modal") emit("close", "addSubOrgs");
  }
  function cleanInn(e: Event) {
    addState.value = "sendInn";
    payload.value.inn = "";
    payload.value.sub = "";
  }
  onMounted(() => {
    document.addEventListener("keyup", (e) => {
      if (e.key === "Escape") emit("close", "addSubOrgs");
    });
  });

  function checkOrg() {
    emit("load");
    doRequest("/org/check", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(payload.value),
    })
      .then(({ response }) => {
        const { organization, inn, kpp, head } = response as { organization: { fullName: string }; inn: any; kpp: any; head: any };
        organizationName.value = {
          name: organization.fullName,
          inn: inn,
          kpp: kpp,
        };
        emit("load");
        addState.value = "aproved";
        response;
      })
      .catch((error) => {
        store.commit("events/PUSH_MESSAGE", {
          id: undefined,
          message: error,
          type: "error",
        });
      });
  }
  function sendOrg() {
    emit("close", "addSubOrgs");
    store.commit("componentLoader/TOGGLE_STATE");
    doRequest("/org/update/", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(payload.value),
    })
      .then(({ response }) => {
        payload.value.inn = "";
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
</script>

<template>
  <div class="department-modal" @keyup.esc="close" @mousedown="close">
    <div class="departments-create">
      <div class="departments-wrp" v-if="addState === 'sendInn'" tabindex="0">
        <h3>Добавить организацию</h3>
        <div>
          <label>Тип связи</label>
          <selectInput :list-options="selectInfo" @inputVal="(value:string) => payload.sub = value"></selectInput>
        </div>
        <div>
          <label>ИНН организации</label>
          <textInput :text-val="payload.inn" @inputVal="(value) => (payload.inn = value)"></textInput>
        </div>
        <button :class="{ 'active-button': payload.inn.length > 3 }" :disabled="payload.inn.length < 4" @click="checkOrg">Продолжить</button>
      </div>
      <div v-if="addState === 'aproved'" class="departments-wrp" tabindex="0">
        <h3>Добавить организацию</h3>
        <div>
          <label>ИНН: </label>
          <p style="display: flex; justify-content: space-between">{{ `${organizationName?.inn}` }} <span class="clean-button" @click="cleanInn">очистить</span></p>
        </div>
        <div>
          <label>Наименование организации: </label>
          <p>{{ `${organizationName?.name} ${organizationName?.inn}/${organizationName?.kpp}` }}</p>
        </div>
        <div class="checkbox-wrapper-23">
          <input type="checkbox" name="roles" :value="check" v-model="check" />
          <label>
            <svg viewBox="0,0,50,50">
              <path d="M5 30 L 20 45 L 45 5"></path>
            </svg>
          </label>
          <div><p>Все верно?</p></div>
        </div>
        <button :class="{ 'active-button': payload.inn.length > 3 && check }" :disabled="payload.inn.length < 4 && !check" @click="sendOrg">Отправить запрос организации</button>
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
      gap: 1em;
      width: 20%;
      & .departments-wrp {
        display: flex;
        flex-direction: column;
        gap: 1em;
        & div {
          display: flex;
          flex-direction: column;
          gap: 0.5em;
        }
        & p {
          margin: 0;
          outline: none;
          border: none;
          border: 0.1em solid var(--fourth-border-color);
          padding: 0.4em 0.4em;
          border-radius: 0.4em;
          color: var(--secondary-text-color);
          cursor: default;
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
  .checkbox-wrapper-23 {
    width: max-content !important;
    flex-direction: row !important;
    display: flex;
    align-items: center;
    cursor: pointer !important;
    & p {
      border: none !important;
    }
    & input {
      position: absolute;
      opacity: 0;
      width: 2em;
      height: 2em;
      cursor: pointer !important;
    }
    & input:checked + label svg path {
      stroke-dashoffset: 0;
    }
    & input + label {
      display: block;
      border: 0.1em solid var(--secondary-border-color);
      width: 2em;
      height: 2em;
      border-radius: 0.4em;
      background-color: var(--secondary-background-color);
      cursor: pointer !important;
    }
    & input + label svg {
      pointer-events: none;
      padding: 0.1em;
    }
    & input + label svg path {
      fill: none;
      stroke: #333;
      stroke-width: 0.3em;
      stroke-linecap: round;
      stroke-linejoin: round;
      stroke-dasharray: 100;
      stroke-dashoffset: 101;
      cursor: pointer !important;
    }
  }
  .clean-button {
    cursor: pointer;
    &:hover {
      color: var(--text-hover-color);
    }
  }
</style>
