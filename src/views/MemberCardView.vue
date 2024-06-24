<script setup lang="ts">
  import { ref, computed } from "vue";
  import { useRoute } from "vue-router";
  import { useStore } from "@/entities";
  import { doRequest } from "@/helpers";
  import { textInput, tableScroll } from "@/share/UI";
  const route = useRoute();
  const store = useStore();
  const userInfo = computed(() => store.state.user.info);
  const persRecords = computed(() => store.state.personal.records);
  const today = ref(getDate());
  const emit = defineEmits(["action"]); // Define the emitted event

  // const state = ref("info");
  const state = ref("info");

  const recordPayload = ref<{
    personalId: number;
    type: number | null;
    timeStart: string;
    duration: number | null;
    comment: string | null;
  }>({
    personalId: 0,
    type: null,
    duration: null,
    timeStart: today.value,
    comment: null,
  });

  const payload = ref<iStore.PersData>({
    personal: {
      personalId: 0,
      lastName: "",
      firstName: "",
      surName: "",
      department: { name: "", id: undefined },
      position: { name: "", id: undefined },
      log: [],
      editable: false,
    },
    contacts: {
      personalId: 0,
      email: "",
      phone: "",
      mobile: "",
      editable: false,
    },
    user: {
      uid: "",
      personalId: 0,
      email: "",
      roles: [],
      editable: false,
    },
    status: undefined,
  });
  function checkExistStr(str?: string) {
    if (!str) return "";
    return str;
  }
  function formatPhoneNumber(num?: string) {
    if (!num) return "";
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

  function getDate() {
    const regex = new RegExp(/(\d{4}-\d{2}-\d{2})/);
    const mutch = new Date().toISOString().match(regex);
    if (mutch?.length) {
      return mutch[0];
    } else return "";
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
      if (/\d{10,}/.test(str)) payload.value.contacts.mobile = formatPhoneNumber(str);
      return (input.value = formatPhoneNumber(str));
    } else if (event.inputType === "deleteContentBackward") {
      if (/-|\)|\(/.test(input.value[input.value.length - 1])) input.value = input.value.slice(0, -1);
    } else if (event.inputType === "historyUndo") {
    } else if (event.inputType === "deleteContentForward") {
    }
  }
  const historyLog = computed(() => {
    if (Array.isArray(personal.value?.log) && persRecords.value.length) {
      return personal.value?.log.map((el) => {
        return {
          name: persRecords.value.find((type) => type.id === el.type)?.type,
          dateStart: new Date(el.timeStart).toLocaleString("ru", { dateStyle: "short" }),
          duration:
            el.duration && el.duration === 0
              ? new Date(el.timeStart).toLocaleString("ru", { dateStyle: "short" })
              : new Date(86400000 * el.duration! + Date.parse(el.timeStart)).toLocaleString("ru", { dateStyle: "short" }).split(",").join(" "),
          note: el.comment,
        };
      });
    } else {
      return [];
    }
  });

  const personal = computed(() => {
    if (Array.isArray(store.state.personal.personalList) && store.state.personal.personalList.length) {
      const pers = store.state.personal.personalList.find((pers) => pers.id === parseInt(route.params.index as string));
      if (!pers) return undefined;
      payload.value.personal.firstName = pers.firstName;
      payload.value.personal.lastName = pers.lastName;
      payload.value.personal.surName = pers.surName;
      payload.value.personal.department.name = pers.department.name;
      payload.value.personal.department.id = pers.department.id;
      payload.value.personal.position.name = pers.position.name;
      payload.value.personal.position.id = pers.position.id;
      payload.value.personal.log = pers.log;
      payload.value.contacts.email = pers.contacts?.email;
      payload.value.contacts.mobile = formatPhoneNumber(pers.contacts?.mobile);
      payload.value.contacts.phone = formatPhoneNumber(pers.contacts?.phone);
      if (pers.user) {
        payload.value.user.roles = pers.user?.role?.map((role) => role.id);
        payload.value.user.uid = pers.user?.uid;
      }
      payload.value.personal.personalId = pers.id;
      payload.value.contacts.personalId = pers.id;
      payload.value.status = getStatus(pers.log);
      recordPayload.value.personalId = pers.id;
      return pers;
    }
    return undefined;
  });
  const select = ref(false);

  function changeToggleUp() {
    select.value = true;
  }

  function changeToggleDown(e: Event) {
    select.value = false;
    (e.target as HTMLElement).blur();
  }

  async function toggleEdit(fieldName: string) {
    if (fieldName === "personal") {
      payload.value.personal.editable = !payload.value.personal.editable;
      if (!payload.value.personal.editable) await update("personal");
    }
    if (fieldName === "contacts") {
      payload.value.contacts.editable = !payload.value.contacts.editable;
      if (!payload.value.contacts.editable) await update("contacts");
    }
    if (fieldName === "user") {
      payload.value.user.editable = !payload.value.user.editable;
      if (!payload.value.user.editable) await update("user");
    }
  }

  function getStatus(log: iStore.iLog[]) {
    if (persRecords.value.length < 1) return "";
    let message = "Активен";
    let counter = "";
    if (Array.isArray(log)) {
      for (let i = 0; i < log.length; i++) {
        if (Date.parse(log[i].timeStart) > Date.now()) {
          counter = `До начала ${persRecords.value.find((type) => type.id === log[i].type)?.type} ${Math.round((Date.parse(log[i].timeStart) - Date.now()) / 86400000)} д.`;
        } else if (log[i].duration && Date.parse(log[i].timeStart) + 86400000 * log[i].duration! > Date.now()) {
          message = persRecords.value.find((type) => type.id === log[i].type)!.type;
        }
      }
    }
    return counter ? `${message}. ${counter}` : message;
  }

  function changeState(stateName: string) {
    state.value = stateName;
  }
  function changeDepartment(e: Event) {
    const { value } = e.target as HTMLInputElement;
    const id = parseInt(value);
    if (id === 0) {
      emit("action", "addPosition");
    }
  }
  function update(type: keyof typeof payload.value) {
    let data: any = {};
    if (type === "contacts") {
      data.contacts = {
        personalId: payload.value.personal.personalId,
        email: payload.value.contacts.email,
        phone: payload.value.contacts.phone?.replace(/\(|\)|-/g, ""),
        mobile: payload.value.contacts.mobile?.replace(/\(|\)|-/g, ""),
      };
    }
    if (type === "personal") {
      data.personal = {
        id: payload.value.personal.personalId,
        lastName: payload.value.personal.lastName,
        firstName: payload.value.personal.firstName,
        surName: payload.value.personal.surName,
        departmentId: payload.value.personal.department.id,
        positionId: payload.value.personal.position.id,
        log: payload.value.personal.log,
      };
    }
    if (type === "user") {
      data.user = {
        uid: payload.value.user.uid,
        email: payload.value.contacts.email,
        personalId: payload.value.personal.personalId,
        roles: payload.value.user.roles,
        // orgId:
      };
    }
    store.commit("componentLoader/TOGGLE_STATE");

    return new Promise((resolve) => {
      doRequest("/personal/update", { method: "POST", headers: { "Content-Type": "application/json; charset=utf-8" }, body: JSON.stringify(data) })
        .then(({ response }) => {
          store.commit("componentLoader/TOGGLE_STATE");
          Promise.all([store.dispatch("tasks/GET_ALL_INFO"), store.dispatch("personal/GET_PERSONAL_LIST")]);
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
  }

  store.commit("titles/SET_TITLE", "Профиль");

  function createRecord() {
    if (!recordPayload.value.type || !recordPayload.value.duration || recordPayload.value.duration === null) return;
    return new Promise((resolve) => {
      store.commit("componentLoader/TOGGLE_STATE");
      doRequest("/personal/record", {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify(recordPayload.value),
      }).then(() => {
        Promise.all([store.dispatch("tasks/GET_ALL_INFO"), store.dispatch("personal/GET_PERSONAL_LIST")])
          .then(() => {
            store.commit("componentLoader/TOGGLE_STATE");
            recordPayload.value.type = null;
            recordPayload.value.comment = "";
            recordPayload.value.duration = null;
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
</script>
<template>
  <div class="personal" v-if="personal !== undefined">
    <div class="personal__main">
      <div class="personal__main__menu">
        <p @click="changeState('info')" :class="{ active: state === 'info' }">Личная информация</p>
        <p @click="changeState('contact')" :class="{ active: state === 'contact' }">Контакты</p>
        <p @click="changeState('history')" v-if="userInfo.isManager || userInfo.isAdmin" :class="{ active: state === 'history' }">История</p>
        <p @click="changeState('role')" v-if="userInfo.isManager || userInfo.isAdmin" :class="{ active: state === 'role' }">Роли</p>
      </div>
      <div v-if="state === 'info'" class="personal__main__info">
        <div class="info-wrp">
          <div>
            <p class="info-title">Фамилия</p>
            <div v-if="userInfo.isManager || userInfo.isAdmin">
              <textInput :textVal="payload.personal.lastName" :readonly="!payload.personal.editable" @inputVal="(value:string) => (payload.personal.lastName = value)"></textInput>
            </div>
            <div v-else>
              <p>{{ personal.lastName }}</p>
            </div>
          </div>
          <div>
            <p class="info-title">Имя</p>

            <div v-if="userInfo.isManager || userInfo.isAdmin">
              <textInput
                :textVal="payload.personal.firstName"
                :readonly="!payload.personal.editable"
                @inputVal="(value:string) => (payload.personal.firstName = value)"
              ></textInput>
            </div>
            <div v-else>
              <p>{{ personal.firstName }}</p>
            </div>
          </div>
          <div>
            <p class="info-title">Отчество</p>
            <div v-if="userInfo.isManager || userInfo.isAdmin">
              <textInput :textVal="payload.personal.surName" :readonly="!payload.personal.editable" @inputVal="(value:string) => (payload.personal.surName = value)"></textInput>
            </div>
            <div v-else>
              <p>{{ personal.surName }}</p>
            </div>
          </div>
          <div>
            <p class="info-title">Структурное подразделение</p>
            <div v-if="userInfo.isManager || userInfo.isAdmin">
              <select :class="{ readonly: !payload.personal.editable }" v-model="payload.personal.department.id" :disabled="!payload.personal.editable">
                <option v-for="(option, index) in $store.state.personal.departments" :key="index" :value="option.id">{{ option.name }}</option>
              </select>
            </div>
            <div v-else>
              <p>{{ personal.department.name }}</p>
            </div>
          </div>
          <div>
            <p class="info-title">Должность</p>
            <div v-if="userInfo.isManager || userInfo.isAdmin">
              <select :class="{ readonly: !payload.personal.editable }" v-model="payload.personal.position.id" :disabled="!payload.personal.editable" @change="changeDepartment">
                <option v-if="!payload.personal.department.id" value="">Выберите структурное подразделение</option>
                <option v-for="(option, index) in $store.state.personal.positions.filter((pos) => pos.depId === payload.personal.department.id)" :key="index" :value="option.id">
                  {{ option.name }}
                </option>
                <option v-if="payload.personal.department.id" value="0">Добавьте должность в структурное подразделение</option>
              </select>
            </div>

            <div v-else>
              <p>{{ personal.position.name }}</p>
            </div>
          </div>
          <div v-if="userInfo.isManager || userInfo.isAdmin" class="button-edit">
            <button @click="toggleEdit('personal')">
              <p v-if="!payload.personal.editable">Редактировать</p>
              <p v-if="payload.personal.editable">Сохранить</p>
            </button>
          </div>
        </div>
      </div>
      <div v-if="state === 'contact'" class="personal__main__info">
        <div class="info-wrp">
          <div>
            <p class="info-title">Электронная почта</p>
            <div v-if="userInfo.isManager || userInfo.isAdmin">
              <textInput :textVal="payload.contacts.email" :readonly="!payload.contacts.editable" @inputVal="(value:string) => (payload.contacts.email = value)"></textInput>
            </div>
            <div v-else>
              <p>{{ personal.contacts.email }}</p>
            </div>
          </div>
          <div>
            <p class="info-title">Мобильный телефон</p>
            <div v-if="userInfo.isManager || userInfo.isAdmin">
              <input :class="{ readonly: !payload.contacts.editable }" type="text" v-model="payload.contacts.mobile" :readonly="!payload.contacts.editable" />
            </div>
            <div v-else>
              <p>{{ personal.contacts.mobile }}</p>
            </div>
          </div>
          <div>
            <p class="info-title">Дополнительный телефон</p>
            <div v-if="userInfo.isManager || userInfo.isAdmin">
              <input :class="{ readonly: !payload.contacts.editable }" type="text" v-model="payload.contacts.phone" :readonly="!payload.contacts.editable" />
            </div>
            <div v-else>
              <p>{{ personal.contacts.phone }}</p>
            </div>
          </div>
          <div></div>
          <div></div>
          <div v-if="userInfo.isManager || userInfo.isAdmin" class="button-edit">
            <button @click="toggleEdit('contacts')">
              <p v-if="!payload.contacts.editable">Редактировать</p>
              <p v-if="payload.contacts.editable">Сохранить</p>
            </button>
          </div>
        </div>
      </div>
      <div v-if="state === 'history'" class="personal__main__info">
        <div class="info-wrp">
          <div>
            <p class="info-title">Выберите тип записи</p>
            <div>
              <select :class="{}" v-model="recordPayload.type" @focus="changeToggleUp" @blur="changeToggleDown">
                <option v-for="(item, index) in persRecords.slice(0, -1)" :key="index" :value="item.id">{{ item.type }}</option>
              </select>
            </div>
          </div>
          <div>
            <p class="info-title">Дата начала</p>
            <div>
              <input type="date" id="_date" v-model="recordPayload.timeStart" :min="today" />
            </div>
          </div>
          <div>
            <p class="info-title">Продолжительность (дней)</p>
            <div>
              <input type="number" pattern="\d{1,3}" maxlength="3" min="1" max="999" v-model="recordPayload.duration" />
            </div>
          </div>

          <div>
            <p class="info-title">Для заметок</p>
            <div>
              <textarea v-model="recordPayload.comment"></textarea>
            </div>
          </div>
          <!-- <div v-if="personal.user?.role.find((role) => role.id < 6)">
            <p class="info-title">Замещающий сотрудник</p>
            <div>
              <select :class="{}" v-model="recordPayload.type" @focus="changeToggleUp" @blur="changeToggleDown">
                <option v-for="(item, index) in $store.state.personal.personalList.filter((pers) => pers.department.id === personal?.department.id)" :key="index" :value="item">
                  {{ item.lastName }} {{ item.firstName }} {{ item.surName }}
                </option>
              </select>
            </div>
          </div>
          <div v-else></div> -->
          <div></div>
          <div class="button-edit">
            <button @click="createRecord">
              <p>Создать</p>
            </button>
          </div>
          <tableScroll
            :is_search="false"
            :height_element="'29.7em'"
            is_empty="Нет записей"
            :list-rows-entry="historyLog"
            :list-column-titles="['Тип записи', 'Дата начала', 'Дата окончания', 'Примечание']"
          ></tableScroll>
        </div>
      </div>
      <div v-if="state === 'role'" class="personal__main__info">
        <div class="info-wrp">
          <div v-if="personal.contacts?.email">
            <p class="info-title">Роли</p>
            <div v-if="userInfo.isManager || userInfo.isAdmin">
              <div v-if="payload.user" class="info-title__contacts">
                <label v-for="(role, index) in $store.state.personal.roles" :key="index" :title="role.descriptions">
                  <div class="checkbox-wrapper-23">
                    <input
                      :class="{ readonly: !payload.user.editable }"
                      type="checkbox"
                      name="roles"
                      :id="`_roles${index}`"
                      :value="role.id"
                      v-model="payload.user.roles"
                      :disabled="!payload.user.editable"
                    />
                    <label :class="{ readonly: !payload.user.editable }" :for="`_roles${index}`">
                      <svg viewBox="0,0,50,50">
                        <path d="M5 30 L 20 45 L 45 5"></path>
                      </svg>
                    </label>
                  </div>
                  {{ role.name }}
                </label>
              </div>
              <p v-else>Пусто</p>
            </div>

            <div v-else-if="personal.user" v-for="(role, index) in personal.user.role" :key="index">
              <p>{{ role.name }}</p>
            </div>
            <div v-else>
              <p>Пусто</p>
            </div>
          </div>

          <div v-else>
            <p class="info-title">Роли</p>
            <p>Для редактирование ролей необходимо добваить email в контактах</p>
          </div>
          <div></div>
          <div class="button-edit">
            <button @click="toggleEdit('user')">
              <p v-if="!payload.user.editable">Редактировать</p>
              <p v-if="payload.user.editable">Сохранить</p>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="personal__addition">
      <div :class="{ active: /Активен/.test(getStatus(payload.personal.log)) }" class="addition-title">
        <p>{{ /\./.test(getStatus(payload.personal.log)) ? payload.status?.split(".")[0] : payload.status }}</p>
        <p v-if="/\./.test(getStatus(payload.personal.log))">{{ payload.status?.split(".")[1] }}</p>
      </div>
      <div class="info-title">
        <h2>{{ personal.lastName }} {{ personal.firstName }} <br />{{ personal.surName }}</h2>
      </div>
      <img class="userIcon" :src="require(`@/share/assets/icons/userCardIcon.svg`)" />
      <div class="button-wrp">
        <button
          @click="$emit('action', 'resetPersonal')"
          v-if="
            (userInfo.isManager || userInfo.isAdmin) &&
            personal.log.length &&
            personal.log[personal.log.length - 1].type - 1 !== 0 &&
            !/Активен/.test(getStatus(payload.personal.log))
          "
        >
          <img :src="require(`@/share/assets/icons/returnPersonal.svg`)" />
          <p>Отозвать с {{ persRecords[personal.log[personal.log.length - 1].type - 1].type.toLowerCase() }}</p>
        </button>
        <button @click="$emit('action', 'password')" v-if="personal.id === userInfo.id && personal.user?.role">
          <img :src="require(`@/share/assets/icons/lockIcon.svg`)" />
          <p>Сменить пароль</p>
        </button>
        <button class="removeButton" @click="$emit('action', 'setConfirmDismiss')" v-if="userInfo.isManager || userInfo.isAdmin">
          <img :src="require(`@/share/assets/icons/removeIcon.svg`)" />
          <p>Уволить</p>
        </button>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
  .personal {
    width: 100%;
    min-height: 100%;
    display: flex;
    & p {
      margin: 0;
    }
    & h2 {
      margin: 0;
      padding: 1em;
    }
    &__main {
      width: 100%;
      padding: 1em 0;
      flex: 1 1 auto;
      display: flex;
      flex-direction: column;
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
          padding: 1em;
          background-color: var(--fourth-background-color);
          border-radius: 0.4em 0.4em 0 0;
          border: 0.1em solid var(--fourth-border-color);
          border-bottom: none;
          color: var(--text-color);
        }
        & .active {
          position: relative;
          background-color: transparent;
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
            z-index: 0;
          }
        }
      }
      &__info {
        padding: 1em;
      }
    }
    &__addition {
      width: 100%;
      display: flex;
      flex-direction: column;
      flex: 1 3 auto;
      border-left: 0.1em solid var(--fourth-border-color);
      & .addition-title {
        & p {
          padding: 1em;
          background-color: var(--fourth-background-color);
          color: var(--text-color);
        }
        & img {
          width: 1em;
          cursor: pointer;
          transition: transform 0.2s ease;

          &:hover {
            transform: scale(1.1);
          }
          &:active {
            transform: scale(0.95);
          }
        }
      }
      .button-wrp {
        padding: 1em;
        display: flex;
        flex-direction: column;
        gap: 1em;
        width: max-content;
        & button {
          // width: max-content;
          display: flex;
          align-items: center;
          gap: 1em;
          padding: 1em;
          border: none;
          outline: none;
          background-color: var(--primary-color);
          color: var(--text-color);
          border-radius: 0.4em;
          cursor: pointer;
          transition: transform 0.2s ease;

          &:active {
            transform: scale(0.95);
          }
          &:hover {
            background-color: var(--primary-hover-color);
          }
          & img {
            width: 1em;
            aspect-ratio: 1/1;
          }
          & p {
            margin: 0;
          }
        }
        .removeButton {
          background-color: var(--fourth-background-color);
        }
      }
      & .active {
        & p {
          background-color: var(--primary-color) !important;
          color: var(--text-color) !important;
        }
      }
      .userIcon {
        padding: 1em;
      }
    }
  }

  .info-wrp {
    display: flex;
    flex-wrap: wrap;
    gap: 1em;
    & div {
      width: 32.2%;
      display: flex;
      flex-direction: column;
      gap: 0.5em;
      & .info-title {
        color: var(--third-text-color);
        padding: 0 0.5em;
      }
      & p {
        font-size: 1.3em;
      }
      & div {
        display: flex;
        width: 100%;
        flex-direction: row;
        & p {
          width: 100%;
          font-size: 1.3em !important;
          padding: 0.5em;
          border: 0.1em solid transparent;
          outline: none;
          border-radius: 0.4em;
          word-wrap: break-word !important;
          background-color: transparent;
        }
        & input,
        textarea {
          width: 100%;
          justify-self: auto;
          font-size: 1.3em !important;
          padding: 0.5em;
          border: 0.1em solid var(--fourth-border-color);
          outline: none;
          border-radius: 0.4em;
          word-wrap: break-word !important;
          background-color: var(--secondary-background-color);
        }

        & img {
          width: 1em;
          cursor: pointer;
          transition: transform 0.2s ease;
          &:hover {
            transform: scale(1.1);
          }
          &:active {
            transform: scale(0.95);
          }
        }
        select {
          width: 100%;
          cursor: pointer;
          font-size: 1.3em !important;
          outline: none;
          border: none;
          border: 0.1em solid var(--fourth-border-color);
          padding: 0.5em;
          border-radius: 0.4em;
          color: var(--secondary-text-color);
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
          background-size: 1em;
          background-position: calc(100% - 1em) center;
          background-repeat: no-repeat;
        }
        textarea {
          resize: none;
        }
        .selected {
          background-image: url("@/share/assets/icons/arrowStickUpIcon.svg") !important;
        }
        .unselected {
          background-image: url("@/share/assets/icons/arrowStickDownIcon.svg") !important;
        }
      }
    }
  }
  .info-title {
    display: flex;
    align-items: center;
    gap: 2em;
    & .id {
      font-size: 2em;
      color: var(--third-text-color);
    }
    &__contacts {
      display: flex;
      flex-direction: column !important;
      flex-wrap: wrap;
      & span {
        display: flex;
        align-items: flex-start;
      }
      & label {
        font-size: 1.3em !important;
        display: flex;
        align-items: center;
        gap: 0.5em;
      }
      & input {
        display: block;
      }
    }
  }
  .button-edit {
    display: flex;
    justify-content: end;
    align-items: end;
    & button {
      display: flex;
      align-items: center;
      gap: 1em;
      padding: 1em;
      border: none;
      outline: none;
      background-color: var(--primary-color);
      color: var(--text-color);
      border-radius: 0.4em;
      cursor: pointer;
      transition: transform 0.2s ease;
      width: fit-content;
      &:active {
        transform: scale(0.95);
      }
      &:hover {
        background-color: var(--primary-hover-color);
      }
      & img {
        width: 1em;
        aspect-ratio: 1/1;
      }
      & p {
        margin: 0;
      }
    }
  }
  .readonly {
    cursor: default !important;
    all: unset;
    border: 0.1em solid transparent !important;
    background-color: transparent !important;
  }

  .checkbox-wrapper-23 {
    width: min-content !important;
    & input {
      position: absolute;
      opacity: 0;
      width: min-content !important;
    }
    & input:checked + label svg path {
      stroke-dashoffset: 0;
    }
    & input + label {
      display: block;
      border: 0.1em solid var(--secondary-border-color);
      width: 1em;
      height: 1em;
      border-radius: 0.4em;
      cursor: pointer;
      background-color: var(--secondary-background-color);
    }
    & input + label svg {
      pointer-events: none;
      padding: 0.1em;
    }
    & input + label svg path {
      fill: none;
      stroke: var(--secondary-border-color);
      stroke-width: 0.3em;
      stroke-linecap: round;
      stroke-linejoin: round;
      stroke-dasharray: 100;
      stroke-dashoffset: 101;
    }
  }
</style>
