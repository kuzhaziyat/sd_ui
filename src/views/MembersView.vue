<script lang="ts" setup>
  import { useStore } from "@/entities";
  import { computed, ref } from "vue";
  import { useRoute, useRouter } from "vue-router";

  const route = useRoute();
  const router = useRouter();
  const store = useStore();
  const count = ref(20);
  const personals = computed(() => store.state.personal.personalList);
  const persRecords = computed(() => store.state.personal.records);
  const taskCount = computed(() => 0);
  const activeButton = ref(1);
  const currentField = ref("");
  const desc = ref(false);

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

  store.commit("titles/SET_TITLE", "Сотрудники");
</script>

<template>
  <div class="personals">
    <!-- <div class="personals__search">
      <input type="text" placeholder="Поиск по имени или номеру" />
    </div> -->
    <div class="personals__wrp" v-if="personals.length > 0">
      <div class="personals__titles">
        <p @click="sortBy('number')">ФИО</p>
        <p>Должность</p>
        <p @click="sortBy('executorId')">Телефон</p>
        <p @click="sortBy('executorId')">Доб. номер</p>
        <p @click="sortBy('status')">Статус</p>
        <p @click="sortBy('orgId')">Роли</p>
        <p @click=""></p>
      </div>
      <div @click="navigateToRoute('MembersCard', { index: personal.id })" v-for="(personal, index) in personals" :key="personal.id" class="personals__person">
        <p :title="`${personal.lastName} ${personal.firstName} ${personal.surName}`" :class="{ active_person: /Активен/.test(getStatus(personal.log)) }">
          {{ `${personal.lastName} ${personal.firstName} ${personal.surName}` }}
        </p>
        <p :title="personal.position.name">{{ personal.position.name }}</p>

        <p :title="personal.contacts?.mobile" v-if="personal.contacts?.mobile">{{ personal.contacts.mobile }}</p>
        <p v-else>&nbsp;</p>
        <p :title="personal.contacts?.phone" v-if="personal.contacts?.phone">{{ personal.contacts.phone }}</p>
        <p v-else>&nbsp;</p>
        <p>{{ getStatus(personal.log) }}</p>
        <p :title="personal.user?.role.map((rol) => rol.name).join(',')" v-if="personal.user?.role.length">{{ personal.user?.role.map((rol) => rol.name).join(", ") }}</p>
        <p v-else>&nbsp;</p>
        <p></p>
      </div>
    </div>
    <div v-else>
      <h1>Нет зарегистрированых сотрудников</h1>
    </div>
    <div class="personals__pagination">
      <button v-for="page in pagCount" :key="page" @click="pagination(page)" :class="{ 'active-button': page === activeButton }">{{ page }}</button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .personals {
    padding: 1.5em;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    gap: 0.5em;
    & h1 {
      text-align: center;
    }
  }
  .personals__search {
    display: flex;
    justify-content: space-between;
    & input {
      outline: none;
      display: block;
      border: none;
      background-color: transparent;
      border: 0.1em solid var(--fourth-border-color);
      border-radius: 0.7em;
      padding: 1em 1.5em;
    }
    & input:nth-child(1) {
      flex-basis: 25%;
      background-image: url("@/share/assets/icons/search.svg");
      background-repeat: no-repeat;
      background-position: 95% center;
      background-size: 5%;
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
    cursor: pointer;
    & p {
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
      flex-basis: 25%;
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
      flex-basis: 25%;
    }
    & > p:nth-child(3) {
      flex-basis: 8%;
    }
    & > p:nth-child(4) {
      flex-basis: 8%;
    }
    & > p:nth-child(5) {
      flex-basis: 8%;
    }
    & > p:nth-child(6) {
      flex-basis: 20%;
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

  .active_person {
    &::before {
      background-color: var(--primary-color) !important;
    }
  }

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

  .personals__pagination {
    display: flex;
    gap: 1em;
    justify-content: center;
    & button {
      display: block;
      outline: none;
      border: none;
      padding: 0.3em 0.5em;
      background-color: transparent;
      color: var(--secondary-text-color);
      border-radius: 0.4em;
      cursor: pointer;
      border: 0.1em solid var(--secondary-border-color);
    }
  }

  .active-button {
    background-color: var(--primary-color) !important;
    color: var(--text-color) !important;
    border: 0.1em solid var(--primary-color) !important;
  }
</style>
