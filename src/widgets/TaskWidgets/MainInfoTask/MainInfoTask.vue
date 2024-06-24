<script setup lang="ts">
  import { store } from "@/entities";
  import { doRequest } from "@/helpers";
  import { textInput, selectInput, textAreaComp } from "@/share/UI";
  import { ref, computed, PropType } from "vue";
  import { loader } from "@/widgets";
  const loaderState = ref(false);
  const readonly = ref(false);
  const userInfo = computed(() => store.state.user.info);
  const today = ref(getDate());

  function getDate() {
    const regex = new RegExp(/(\d{4}-\d{2}-\d{2})/);
    const mutch = new Date().toISOString().match(regex);
    if (mutch?.length) {
      return mutch[0];
    } else return "";
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
  const props = defineProps({
    task: {
      type: Object as PropType<iStore.Task>,
      required: true,
    },
  });

  const date = ref(props.task.info.deadLine?.split("T")[0]);

  function setTime(e: Event) {
    const { value } = e.target as HTMLInputElement;
    payload.value.updateInfo.deadLine = `${payload.value.updateInfo.deadLine?.split("T")[0]}T${value}:00`;
  }

  function setDate(e: Event) {
    const { value } = e.target as HTMLInputElement;
    if (payload.value.updateInfo.deadLine && /23:59:59/.test(payload.value.updateInfo.deadLine)) {
      payload.value.updateInfo.deadLine = `${value}T${payload.value.updateInfo.deadLine?.split("T")[1]}`;
      return;
    }
    payload.value.updateInfo.deadLine = `${value}T23:59:59`;
  }
  const payload = ref<{
    taskId: number;
    updateInfo: iStore.TaskInfo;
    priority: number;
  }>({ taskId: props.task.id, updateInfo: props.task.info, priority: props.task.priority.id });

  function setRowsCount(val: string) {
    if (val) {
      if (val.length > 10 && val.length < 499) {
        return 6;
      } else if (val.length > 500 && val.length < 999) {
        return 9;
      } else if (val.length > 999) {
        return 12;
      }
    } else {
      return 2;
    }
  }
  function createRequest(e: Event) {
    readonly.value = !readonly.value;
    if (!readonly.value) {
      store.commit("componentLoader/TOGGLE_STATE");
      doRequest("/tasks/update/info", {
        headers: { "Content-Type": "application/json; charset=utf-8" },
        method: "POST",
        body: JSON.stringify(payload.value),
      })
        .then(({ response }) => {
          store.commit("componentLoader/TOGGLE_STATE");
          if (response) {
            loaderState.value = false;
          } else {
            loaderState.value = false;
          }
        })
        .catch((error) => {
          store.commit("componentLoader/TOGGLE_STATE");
          store.commit("events/PUSH_MESSAGE", {
            id: undefined,
            message: error,
            type: "error",
          });
          loaderState.value = false;
        });
    }
  }
</script>
<template>
  <loader v-if="loaderState" />

  <div v-else class="main">
    <div>
      <p class="info-title">Тема</p>
      <div v-if="task.creator.id === userInfo.id">
        <textInput :textVal="payload.updateInfo.title" :readonly="!readonly" @inputVal="(value:string) => (payload.updateInfo.title = value)"></textInput>
      </div>
      <div v-else>
        <p>{{ task.info.title }}</p>
      </div>
    </div>
    <div>
      <p class="info-title">Описание</p>
      <div v-if="task.creator.id === userInfo.id">
        <textAreaComp
          :rowsCount="setRowsCount(payload.updateInfo.description)"
          :textVal="payload.updateInfo.description"
          :readonly="!readonly"
          @inputVal="(value:string) => (payload.updateInfo.description = value)"
        ></textAreaComp>
      </div>
      <div v-else>
        <p>{{ task.info.description }}</p>
      </div>
    </div>
    <div>
      <p class="info-title">Приоритет</p>
      <div v-if="task.creator.id === userInfo.id">
        <selectInput v-if="readonly" :selected="payload.priority" :listOptions="priorities" @inputVal="(value:number) => (payload.priority=value)"></selectInput>
        <p v-else>{{ task.priority.type }}</p>
      </div>
      <div v-else>
        <p>{{ task.priority.type }}</p>
      </div>
    </div>
    <div>
      <p class="info-title">Дата исполнения</p>
      <div v-if="task.creator.id === userInfo.id && readonly" class="date-time">
        <input type="date" id="_date" :value="date" @change="setDate" required :min="today" />
        <input type="time" id="_time" @change="setTime" />
      </div>
      <div v-else>
        <p v-if="task.info.deadLine">
          {{
            /[0]{2,}\:[0]{2,}\:[0]{2,}/.test(task.info.deadLine)
              ? new Date(task.info.deadLine).toLocaleString("ru", { dateStyle: "medium" })
              : new Date(task.info.deadLine).toLocaleString("ru", { dateStyle: "medium", timeStyle: "medium" }).split(",").join(" ")
          }}
        </p>
        <p v-else>Не установлено</p>
      </div>
    </div>

    <div>
      <button v-if="task.creator.id === userInfo.id && task.approved !== true" @click="createRequest">
        <p v-if="readonly">Сохранить</p>
        <p v-if="!readonly">Редактировать</p>
      </button>
    </div>
  </div>
</template>
<style scoped lang="scss">
  .main {
    padding: 1em;
    width: 90%;
    & div {
      position: relative;

      display: flex;
      flex-direction: column;
      gap: 0.5em;
      & .info-title {
        color: var(--third-text-color);
        padding: 0 0.5em;
        margin: 0;
      }
      & .date-time {
        flex-direction: row;
        input {
          justify-self: auto;
          padding: 0.5em;
          border: 0.1em solid var(--fourth-border-color);
          outline: none;
          border-radius: 0.4em;
          word-wrap: break-word !important;
          background-color: var(--secondary-background-color);
        }
      }
      & div {
        & p {
          margin: 0;
          width: 100%;
          padding: 0.5em;
          border: 0.1em solid transparent;
          outline: none;
          border-radius: 0.4em;
          word-wrap: break-word !important;
          background-color: transparent;
        }
      }
      & button {
        display: flex;
        align-items: center;
        align-self: flex-end;
        gap: 1em;
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
        & p {
          width: 8em;
          margin: 0;
        }
      }
    }
  }
</style>
