<script setup lang="ts">
  import { useStore } from "@/entities";
  import { ref, computed, onMounted } from "vue";
  import { useRoute, useRouter } from "vue-router";
  import { doRequest } from "@/helpers";
  import { loader } from "@/widgets";
  const router = useRouter();
  const store = useStore();
  const route = useRoute();
  const _Id = route.params.id as string;
  const departments = computed(() => store.state.personal.departments);
  const loaderState = ref(false);
  const select = ref(false);
  const selectone = ref(false);
  const emit = defineEmits(["load", "action"]);
  const userInfo = store.state.user.info;
  const activeButton = ref(1);
  const currentField = ref("");
  const desc = ref(false);
  const count = ref(20);
  const taskCount = computed(() => 0);
  const personals = ref<iStore.Personal[]>([]);
  const persRecords = computed(() => store.state.personal.records);

  const payload = ref<{
    id: number;
    headId: number;
    controlId: number;
    name: string;
  }>({
    id: 0,
    headId: 0,
    controlId: 0,
    name: "",
  });
  const pagCount = computed(() => {
    return Math.ceil(taskCount.value / count.value);
  });
  function navigateToRoute(routeName: string, params?: any) {
    router.push({ name: routeName, params: params });
  }

  function pagination(page: number) {
    activeButton.value = page;
    const options: Record<string, any> = { offset: page, count: count.value, filter: route.query.filter };
    if (currentField.value) options.sort = currentField.value;
    if (desc.value) options.desc = desc.value;
    // store.dispatch("", options);
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
    return message;
  }
  function changeToggleUp() {
    select.value = true;
  }
  function changeToggleDown(e: Event) {
    select.value = false;
    (e.target as HTMLElement).blur();
  }
  function changeToggleOneUp() {
    selectone.value = true;
  }
  function changeToggleOneDown(e: Event) {
    selectone.value = false;
    (e.target as HTMLElement).blur();
  }
  function updateDep() {
    store.commit("componentLoader/TOGGLE_STATE");
    doRequest("/departments/update", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(payload.value),
    }).then(({ response }) => {
      Promise.all([store.dispatch("tasks/GET_ALL_INFO"), store.dispatch("personal/GET_PERSONAL_LIST"), store.dispatch("personal/GET_REQUIRED_DATA")])
        .then(() => {
          store.commit("componentLoader/TOGGLE_STATE");
          payload.value = { id: 0, headId: 0, controlId: 0, name: "" };
        })
        .catch((error) => {
          store.commit("componentLoader/TOGGLE_STATE");
          store.commit("events/PUSH_MESSAGE", {
            id: undefined,
            message: error.message,
            type: "error",
          });
        });
    });
  }
  function sortBy(field: string) {
    activeButton.value = 1;
    const options: Record<string, any> = { offset: activeButton.value, count: count.value, filter: route.query.filter, sort: field };
    if (currentField.value === field && !desc.value) {
      options.desc = true;
      desc.value = true;
    } else if (currentField.value === field && desc.value) {
      options.desc = false;
      desc.value = false;
    } else if (currentField.value !== field) desc.value = false;
    currentField.value = field;
  }
  const departmentInfo = computed(() => {
    if (Array.isArray(departments.value) && departments.value.length) {
      const department = departments.value[parseInt(_Id as string)];
      personals.value = store.state.personal.personalList.filter((pers) => pers.department.id === department.id);

      payload.value!.name = department.name;
      payload.value!.id = department.id;
      payload.value!.headId = department.headId;
      payload.value!.controlId = department.controlId;
      return department;
    }
    return false;
  });
  store.commit("titles/SET_TITLE", `Редактирование структурного подразделения`);
</script>
<template>
  <loader v-if="loaderState" />
  <div class="department">
    <div class="department__edit" v-if="departmentInfo">
      <h2>Редактирование структурного подразделения {{ departmentInfo.name }}</h2>
      <div>
        <p>Наименование структурного подразделения</p>
        <input type="text" v-model="payload.name" />
      </div>
      <div>
        <p v-if="payload.name === 'Аппарат управления'">Руководитель</p>
        <p v-else>Курирующий руководитель</p>
        <select v-model="payload.controlId" :class="{ selected: select, unselected: !select }" @change="changeToggleDown" @focus="changeToggleUp" @blur="changeToggleDown">
          <option v-for="(pers, index) in $store.state.personal.personalList" :key="index" :value="pers.id">
            {{ `${pers.lastName} ${pers.firstName[0]}. ${pers.surName[0]}.` }} {{ pers.position.name }}
          </option>
        </select>
      </div>
      <div>
        <p>Руководитель структурного подразделения</p>
        <select
          v-model="payload.headId"
          :class="{ selected: selectone, unselected: !selectone }"
          @change="changeToggleOneDown"
          @focus="changeToggleOneUp"
          @blur="changeToggleOneDown"
        >
          <option v-for="(pers, index) in personals" :key="index" :value="pers.id">
            {{ `${pers.lastName} ${pers.firstName[0]}. ${pers.surName[0]}.` }} {{ pers.position.name }}
          </option>
        </select>
      </div>
      <div class="button-row">
        <button
          :class="{ 'active-button': payload.name !== departmentInfo.name || payload.controlId !== departmentInfo.controlId || payload.headId !== departmentInfo.headId }"
          :disabled="payload.name === departmentInfo.name && payload.controlId === departmentInfo.controlId && payload.headId === departmentInfo.headId"
          @click="updateDep"
        >
          Сохранить
        </button>
        <button type="button" class="active-button" @click="$emit('action', 'addPerson')" v-if="userInfo.isAdmin || userInfo.isManager">Добавить сотрудника</button>
      </div>
    </div>
    <div class="department__personal">
      <div class="personals__wrp" v-if="personals.length > 0">
        <div class="personals__titles">
          <p @click="sortBy('number')">ФИО</p>
          <p>Должность</p>
          <p @click="sortBy('creatorId')">Электронная почта</p>
          <p @click="sortBy('executorId')">Телефон</p>
          <p @click="sortBy('executorId')">Доб. номер</p>
          <p @click="sortBy('status')">Статус</p>
          <p @click="sortBy('orgId')">Роли</p>
          <p @click=""></p>
        </div>
        <div v-for="(personal, index) in personals" :key="personal.id" class="personals__person" @click="navigateToRoute('MembersCard', { index: personal.id })">
          <p :class="{ active_person: /Активен/.test(getStatus(personal.log)) }">{{ ` ${personal.lastName} ${personal.firstName} ${personal.surName}` }}</p>
          <p>{{ personal.position.name }}</p>
          <p v-if="personal.user">{{ personal.user?.email }}</p>
          <p v-else>&nbsp;</p>
          <p v-if="personal.contacts?.phone">{{ personal.contacts.phone }}</p>
          <p v-else>&nbsp;</p>
          <p>&nbsp;</p>
          <p>{{ getStatus(personal.log) }}</p>
          <p v-if="personal.user?.role.length">{{ personal.user?.role.map((rol) => rol.name).join(", ") }}</p>
          <p v-else>&nbsp;</p>
          <p></p>
        </div>
      </div>
      <div v-else>
        <div class="nullTask">
          <h1>В структурном подразделении нет сотрудников.</h1>
          <img :src="require(`@/share/assets/icons/NullPersonal.svg`)" alt="logo" />
        </div>
      </div>
      <div class="personals__pagination">
        <button v-for="page in pagCount" :key="page" @click="pagination(page)" :class="{ 'active-button': page === activeButton }">{{ page }}</button>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
  .nullTask {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    & img {
      width: 25%;
    }
  }
  .department {
    display: flex;
    flex-direction: column;
    padding: 1em;
    &__edit {
      display: flex;
      gap: 1em;
      flex-direction: column;
      & input {
        width: 50%;
        margin: 0;
        outline: none;
        border: none;
        border: 0.1em solid var(--fourth-border-color);
        padding: 0.4em 0.4em;
        border-radius: 0.4em;
        color: var(--secondary-text-color);
      }
      & select {
        width: 50%;
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
      & .selected {
        background-image: url("@/share/assets/icons/arrowStickUpIcon.svg") !important;
      }
      & .unselected {
        background-image: url("@/share/assets/icons/arrowStickDownIcon.svg") !important;
      }
      & p {
        margin: 0;
      }
      & .button-row {
        display: flex;
        gap: 1em;
        & button {
          display: block;
          padding: 1em 1em;
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

        .active-button {
          background: var(--primary-color) !important;
          cursor: pointer !important;
          transition: transform 0.2s ease;
          color: var(--text-color) !important;

          &:hover {
            background-color: var(--primary-hover-color) !important;
          }
          &:active {
            transform: scale(0.95);
          }
        }
      }
    }
    &__personal {
      padding-top: 1em;
      .personals__titles {
        @extend .personals__person;
        & p {
          position: relative;
          display: flex;
          gap: 0.5em;
          color: var(--third-text-color);
          cursor: pointer;
          border-right: 0.1em solid var(--third-text-color);
        }
        & p::after {
          display: block;
          content: "";
          width: 1em;
          aspect-ratio: 1/1;
          background-image: url("@/share/assets/icons/filterIcon.svg");
          background-repeat: no-repeat;
          background-size: contain;
        }
        & p:last-child {
          padding: 0;
          display: flex;
          justify-content: center;
          display: flex;
          &::after {
            background-image: url("@/share/assets/icons/settingIcon.svg") !important;
          }
        }
      }
      .personals__wrp {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        width: 100%;
      }

      .personals__person {
        display: flex;
        background-color: var(--secondary-background-color);
        align-items: center;
        & p {
          cursor: pointer;
          position: relative;
          height: 1.5em;
          padding-left: 1em;
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          margin: 0;
          align-self: center;
          flex-basis: 20%;
          gap: 0.3em;
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
          border-right: 0.1em solid var(--fourth-color);
          border-bottom: 0.1em solid var(--fourth-color);
          color: var(--secondary-text-color);
          width: 0em;

          & ::-webkit-scrollbar {
            display: none;
          }
          & ::-webkit-scrollbar-track {
            display: none;
          }
        }
        & > p:nth-child(1) {
          flex-basis: 20%;
          z-index: 1;
          &::before {
            position: absolute;
            content: "";
            width: 0.5em;
            height: 1.5em;
            background-color: var(--fourth-background-color);
            left: 0;
            z-index: 2;
          }
        }
        & > p:nth-child(2) {
          flex-basis: 14%;
        }
        & > p:nth-child(3) {
          flex-basis: 16%;
        }
        & > p:nth-child(4) {
          flex-basis: 9%;
        }
        & > p:nth-child(5) {
          flex-basis: 10%;
        }
        & > p:nth-child(6) {
          flex-basis: 8%;
        }
        & > p:last-child {
          padding: 0;
          display: flex;
          justify-content: center;
          flex-basis: 3%;
          cursor: pointer;
          &::after {
            display: block;
            content: "";
            width: 1em;
            aspect-ratio: 1/1;
            background-image: url("@/share/assets/icons/scale.svg");
            background-repeat: no-repeat;
            background-size: contain;
          }
        }
      }
    }
  }
  .active_person {
    &::before {
      background-color: var(--primary-color) !important;
    }
  }
</style>
