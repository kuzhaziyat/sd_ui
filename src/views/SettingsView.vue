<script lang="ts" setup>
  import { useStore } from "@/entities";
  import { ref, computed } from "vue";
  import { tablePagination, tableScroll } from "@/share/UI";
  const store = useStore();
  const departments = computed<Array<any>>(() => store.state.personal.departments);
  const subOrganizations = computed<Array<any>>(() => store.state.tasks.requiredData?.orgs);
  const mainState = ref("departments");
  const additionalState = ref("info");
  const loaderState = ref(false);
  const userInfo = computed(() => store.state.user.info);
  const postList = computed(() => store.state.personal.positions);

  const departmentsInfo = computed(() => {
    if (Array.isArray(departments.value) && departments.value.length) {
      return departments.value.map((el) => {
        let control = "Не назначен";
        let head = "Не назначен";
        if (el.control) {
          control = el.control.lastName + " " + el.control.firstName[0] + ". " + el.control.surName[0];
        }
        if (el.head) {
          head = el.head.lastName + " " + el.head.firstName[0] + ". " + el.head.surName[0];
        }
        return { name: el.name, control: control, head: head };
      });
    } else {
      return [];
    }
  });

  const subOrganizationInfo = computed(() => {
    if (Array.isArray(subOrganizations.value) && subOrganizations.value.length) {
      return subOrganizations.value.map((el) => {
        return { name: el.name };
      });
    } else {
      return [];
    }
  });

  const positionsInfo = computed(() => {
    if (postList.value) {
      return postList.value.map((el) => {
        return {
          name: el.name,
          dep: departments.value.find((dep) => {
            return dep.id === el.depId;
          })?.name,
        };
      });
    } else {
      return [];
    }
  });
  store.commit("titles/SET_TITLE", "Настройки");
</script>

<template>
  <div class="setting">
    <div class="setting__main">
      <div class="setting__main__menu">
        <p @click="mainState = 'departments'" v-if="userInfo.isManager || userInfo.isAdmin || userInfo.isHead" :class="{ active: mainState === 'departments' }">Моя организация</p>
        <p @click="mainState = 'post'" :class="{ active: mainState === 'post' }">Должности</p>
        <!-- <p @click="mainState = 'subOrganizations'" :class="{ active: mainState === 'subOrganizations' }">Подведомственные организации</p>
        <p @click="mainState = 'outOrganizations'" :class="{ active: mainState === 'outOrganizations' }">Внешние организации</p> -->
      </div>
      <div class="info-wrp" v-if="mainState === 'subOrganizations'">
        <div class="subOrganizations" v-if="userInfo.isManager || userInfo.isAdmin || userInfo.isHead">
          <tableScroll
            route_name="SettingsInfo"
            is_empty="Организации не добавлены"
            :height_element="'2'"
            :loaded="loaderState"
            :listRowsEntry="subOrganizationInfo"
            :listColumnTitles="['Подведомственные организации']"
          ></tableScroll>
        </div>
      </div>
      <div class="info-wrp" v-if="mainState === 'post'">
        <div class="subOrganizations" v-if="userInfo.isManager || userInfo.isAdmin || userInfo.isHead">
          <tableScroll
            :height_element="'2'"
            is_empty="Список должностей пуст"
            :loaded="loaderState"
            :listRowsEntry="positionsInfo"
            :listColumnTitles="['Должность', 'Структурное подразделения']"
          ></tableScroll>
        </div>
      </div>
      <div class="info-wrp" v-if="mainState === 'departments'">
        <tablePagination
          route_name="SettingsInfo"
          is_empty="Структурное подразделения не созданны"
          :loaded="loaderState"
          :listRowsEntry="departmentsInfo"
          :listColumnTitles="['Структурное подразделения', 'Курирующий руководитель', 'Руководитель структурного подразделения']"
        ></tablePagination>
      </div>
    </div>

    <div class="setting__additional">
      <div class="setting__additional__menu">
        <input type="button" class="setting__additional__menu__button left" :class="{ active: additionalState === 'info' }" value="Информация" @click="additionalState = 'info'" />
        <input
          type="button"
          class="setting__additional__menu__button right"
          :class="{ active: additionalState === 'history' }"
          value="Документы"
          @click="additionalState = 'history'"
        />
      </div>
      <div class="setting__additional__info" v-if="additionalState === 'info'">
        <div class="info__block__wrp">
          <div class="info__block">
            <p class="info__title">Полное наименование:</p>
            <p>{{ userInfo.organization.fullName }}</p>
          </div>
          <div class="info__block">
            <p class="info__title">Краткое наименование:</p>
            <p>{{ userInfo.organization.shortName }}</p>
          </div>
          <div class="info__block">
            <p class="info__title">ИНН:</p>
            <p>{{ userInfo.organization.inn }}</p>
          </div>
          <div class="info__block">
            <p class="info__title">КПП:</p>
            <p>{{ userInfo.organization.kpp }}</p>
          </div>
          <div class="info__block">
            <p class="info__title">Юридический адресс:</p>
            <p>{{ userInfo.organization.legalAdress }}</p>
          </div>
        </div>
      </div>
      <div class="setting__additional__info" v-if="additionalState === 'history'">
        <div class="info__block__wrp"></div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .setting {
    width: 100%;
    min-height: 100%;
    display: flex;
    & p {
      margin: 0;
      user-select: none;
    }
    & h2 {
      user-select: none;
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
    &__additional {
      width: 100%;
      display: flex;
      flex-direction: column;
      flex: 1 3 auto;
      border-left: 0.1em solid var(--fourth-border-color);
      background-color: var(--secondary-background-color);
      &__menu {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        &__button {
          display: block;
          outline: none;
          border: none;
          background-color: transparent;
          padding: 0.6em;
          background-color: var(--fourth-background-color);
          color: var(--secondary-background-color);
          width: 100%;
        }
        & .left:not(.active):nth-child(1) {
          border-radius: none;
          border-top-right-radius: 0.4em;
        }
        & .right:not(.active):nth-child(2) {
          border-radius: none;
          border-top-left-radius: 0.4em;
        }
        .active {
          background-color: var(--secondary-background-color);
          color: var(--primary-color);
          border-radius: none;
        }
      }
    }
  }
  .info-wrp {
    padding: 1em;
  }
  .info__block__wrp {
    padding: 1em;
    display: flex;
    flex-direction: column;
    gap: 1em;
    & .info__block {
      display: flex;
      flex-direction: column;
      gap: 0.5em;
    }
    & .info__title {
      color: var(--third-text-color);
    }
  }
  p {
    margin: 0;
  }
</style>
