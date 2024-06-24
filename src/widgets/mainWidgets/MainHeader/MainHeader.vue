<script lang="ts" setup>
  import { useStore } from "@/entities";
  import { doRequest } from "@/helpers";
  import { computed, ref } from "vue";
  import { useRouter } from "vue-router";
  import { NotificationList } from "@/widgets";
  const router = useRouter();
  const notificationList = ref(false);
  function navigateToRoute(routeName: string, params?: any) {
    router.push({ name: routeName, params: params });
  }
  const store = useStore();
  const title = computed(() => store.state.titles.title);
  const userInfo = store.state.user.info;
  function logout() {
    store.commit("componentLoader/TOGGLE_STATE");
    localStorage.clear();
    doRequest("/auth/logout", { method: "GET" }).then((response) => window.location.reload());
  }
</script>

<template>
  <div class="main-header">
    <h1>{{ title }}</h1>
    <div>
      <!-- <button type="button" @click="$emit('action', 'addSubOrgs')" v-if="(userInfo.isAdmin || userInfo.isManager) && title === 'Настройки'">
        <img :src="require(`@/share/assets/icons/taskPlus.svg`)" alt="person404" />
        <p>Добавить организацию</p>
      </button> -->
      <button type="button" @click="$emit('action', 'createDeparment')" v-if="(userInfo.isAdmin || userInfo.isManager) && title === 'Настройки'">
        <img :src="require(`@/share/assets/icons/taskPlus.svg`)" alt="person404" />
        <p>Создать структурное подразделение</p>
      </button>
      <button type="button" @click="$emit('action', 'addPosition')" v-if="(userInfo.isAdmin || userInfo.isManager) && title === 'Настройки'">
        <img :src="require(`@/share/assets/icons/taskPlus.svg`)" alt="person404" />
        <p>Создать должность</p>
      </button>
      <button
        type="button"
        @click="$emit('action', 'createTask')"
        v-if="(userInfo.isHead || userInfo.isVice || (userInfo.isDepHead && $store.state.tasks.requiredData?.inner?.length)) && title === 'Задачи'"
      >
        <img :src="require(`@/share/assets/icons/taskPlus.svg`)" alt="logo404" />
        <p>Создать задачу</p>
      </button>
      <div>
        <div @click="notificationList = true">
          <NotificationList v-if="notificationList" @close="notificationList = false" />
          <svg viewBox="0 0 25 29" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M1.16807 16.5015V16.2168C1.20983 15.3745 1.47977 14.5585 1.95005 13.8527C2.73284 13.0049 3.26871 11.966 3.50142 10.845C3.50142 9.97858 3.50142 9.09978 3.5771 8.23336C3.96809 4.06216 8.09245 1.17822 12.1664 1.17822H12.2673C16.3412 1.17822 20.4655 4.06216 20.8692 8.23336C20.9448 9.09978 20.8692 9.97858 20.9322 10.845C21.1681 11.9686 21.7034 13.0108 22.4836 13.8651C22.9574 14.5646 23.2278 15.3777 23.2656 16.2168V16.4891C23.2937 17.6207 22.904 18.7241 22.1683 19.5958C21.196 20.6151 19.8767 21.2493 18.4601 21.3782C14.3061 21.8238 10.1149 21.8238 5.9609 21.3782C4.54588 21.2437 3.22848 20.6105 2.25276 19.5958C1.52839 18.7234 1.14391 17.6266 1.16807 16.5015Z"
              stroke="#738086"
              stroke-width="1.875"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M9.03833 25.6853C9.68739 26.5 10.6405 27.0272 11.6868 27.1503C12.7331 27.2735 13.7862 26.9823 14.6132 26.3413C14.8675 26.1517 15.0963 25.9313 15.2942 25.6853"
              stroke="#738086"
              stroke-width="1.875"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>

        <svg class="logout" @click="logout" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M16.1021 2C16.6544 2 17.1021 1.55228 17.1021 1C17.1021 0.447715 16.6544 0 16.1021 0H5C2.23858 0 0 2.23858 0 5V25C0 27.7614 2.23858 30 5 30H16.1021C16.6544 30 17.1021 29.5523 17.1021 29C17.1021 28.4477 16.6544 28 16.1021 28H5C3.34315 28 2 26.6569 2 25V5C2 3.34315 3.34315 2 5 2H16.1021ZM29.567 14.2929L23.203 7.92893C22.8125 7.53841 22.1793 7.53841 21.7888 7.92893C21.3983 8.31946 21.3983 8.95262 21.7888 9.34315L26.4456 14H10.6888C10.1366 14 9.68884 14.4477 9.68884 15C9.68884 15.5523 10.1366 16 10.6888 16H26.4456L21.7888 20.6569C21.3983 21.0474 21.3983 21.6805 21.7888 22.0711C22.1793 22.4616 22.8125 22.4616 23.203 22.0711L29.567 15.7071C29.9575 15.3166 29.9575 14.6834 29.567 14.2929Z"
            fill="#738086"
          />
        </svg>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .main-header {
    grid-area: header;
    padding: 1em 4em;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 0.4em 0.6em -0.6em var(--secondary-text-color);
    z-index: 1;
    height: 4em;
    & h1 {
      color: var(--primary-color);
      text-overflow: ellipsis;
      white-space: nowrap;
      user-select: none;
      margin: 0;
    }
    & div {
      display: flex;
      align-items: center;
      gap: 1.5em;
      & .logout {
        &:hover path {
          fill: var(--primary-color);
        }
      }
      & img {
        width: 1em;
        aspect-ratio: 1/1;
      }
      & svg {
        width: 2em;
        cursor: pointer;
        transition: transform 0.2s ease;
        &:hover {
          transform: scale(1.1);
        }
        &:active {
          transform: scale(0.8);
        }
        &:hover path {
          stroke: var(--primary-color);
        }
      }
    }
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
</style>
