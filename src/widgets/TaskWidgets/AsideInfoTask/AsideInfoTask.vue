<script lang="ts" setup>
  import { useStore } from "@/entities";
  import { PropType, ref } from "vue";
  import { contextMenu, textAreaComp } from "@/share/UI";

  const emit = defineEmits(["soex", "action"]);

  const props = defineProps({
    task: {
      type: Object as PropType<iStore.Task>,
      required: true,
    },
  });
  const select = ref(false);

  const store = useStore();
  const userInfo = store.state.user.info;

  const selectedOption = ref(null);

  const topInfoContext = ref(0);
  const leftInfoContext = ref(0);
  const showInfo = ref(false);
  const showDepInfo = ref(false);

  const contextInfo = ref<{ org: string; dep: string; post: string }>({ org: "", dep: "", post: "" });

  function contextInfoDepOpen(e: MouseEvent | TouchEvent, org: string, dep: string) {
    leftInfoContext.value = e instanceof MouseEvent ? e.clientX : e.touches[0].clientX;
    topInfoContext.value = e instanceof MouseEvent ? e.clientY : e.touches[0].clientY;

    contextInfo.value.org = org;
    contextInfo.value.dep = dep;
    showDepInfo.value = true;
  }
  function contextInfoOpen(e: MouseEvent, org: string, dep: string, post: string) {
    topInfoContext.value = e.pageY || e.clientY;
    leftInfoContext.value = e.pageX || e.clientX;

    contextInfo.value.org = org;
    contextInfo.value.dep = dep;
    contextInfo.value.post = post;

    showInfo.value = true;
  }
  function contextInfoClose() {
    topInfoContext.value = 0;
    leftInfoContext.value = 0;
    showInfo.value = false;
    showDepInfo.value = false;
  }
  function resolveRight() {
    const executor = props.task.department !== null && props.task.executor !== null;
    const user = store.state.user.info.isVice || store.state.user.info.isDepHead;
    return executor && user && !props.task.approved;
  }
  function changeStateButton() {
    emit("action", selectedOption.value);
    return;
  }
  function soExecModal(e: MouseEvent) {
    emit("soex");
    return;
  }
  function changeToggleUp() {
    select.value = true;
  }
  function changeToggleDown(e: Event) {
    select.value = false;
    (e.target as HTMLElement).blur();
  }
  function resolveAction() {
    const _task = props.task;
    const uid = store.state.user.info.id;
    if (_task?.department === null && _task.control.id === uid) {
      return {
        setDepartment: { type: "Назначить cтруктурное подразделения исполнителя", actionName: "setDepartment" },
        setExecutor: { type: "Назначить исполнителя", actionName: "setExecutor" },
        agreemented: { type: "Отправить на согласование", actionName: "setAgreement" },
      };
    }
    if (_task?.executor === null && _task?.department?.headId === uid) {
      return { setExecutor: { type: "Назначить исполнителя", actionName: "setExecutor" }, agreemented: { type: "Отправить на согласование", actionName: "setAgreement" } };
    }
    if (_task?.executor && _task.executor.id === uid && _task?.info.status === null) {
      return { confirm: { type: "Ознакомлен", actionName: "setConfirm" }, agreemented: { type: "Отправить на согласование", actionName: "setAgreement" } };
    }
    if (_task?.executor && _task.executor.id === uid && _task?.info.status === false) {
      return { ready: { type: "Выполнено", actionName: "setExecuted" } };
    }
    if (_task?.info.status === true && !_task?.approved && _task?.creator.id === uid)
      return { approved: { type: "Принять", actionName: "setApproved" }, returnWork: { type: "Вернуть на доработку", actionName: "setReturnInWork" } };
  }
</script>

<template>
  <contextMenu class="contextInfo" :display="showDepInfo" :top="topInfoContext" :left="leftInfoContext" @close="contextInfoClose">
    <div>
      <p><img :src="require(`@/share/assets/icons/infoIcon.svg`)" /> Краткая информация</p>
      <p>Организация: {{ contextInfo.org }}</p>
      <p>Руководитель: {{ contextInfo.dep }}</p>
    </div>
  </contextMenu>
  <contextMenu class="contextInfo" :display="showInfo" :top="topInfoContext" :left="leftInfoContext" @close="contextInfoClose">
    <div>
      <p><img :src="require(`@/share/assets/icons/infoIcon.svg`)" /> Краткая информация</p>
      <p><span>Организация:</span> {{ contextInfo.org }}</p>
      <p><span>Отдел:</span> {{ contextInfo.dep }}</p>
      <p><span>Должность:</span> {{ contextInfo.post }}</p>
    </div>
  </contextMenu>
  <div class="info__block__wrp">
    <div class="info__block">
      <p>Тема:</p>
      <p>{{ task.info.title }}</p>
    </div>
    <div class="info__block" v-if="task.info.deadLine">
      <p>Дата исполнения:</p>
      <p>
        {{
          /[0]{2,}\:[0]{2,}\:[0]{2,}/.test(task.info.deadLine)
            ? new Date(task.info.deadLine).toLocaleString("ru", { dateStyle: "medium" })
            : new Date(task.info.deadLine).toLocaleString("ru", { dateStyle: "medium", timeStyle: "medium" }).split(",").join(" ")
        }}
      </p>
    </div>
    <!-- <div class="info__block">
            <p>Тип задачи:</p>
            <p>&nbsp;</p>
          </div> -->
    <div class="info__block">
      <p>Приоритет:</p>
      <p>{{ task.priority.type }}</p>
    </div>
    <div class="info__block">
      <p>Статус:</p>
      <p
        :class="{
          created: task.info.status === null,
          inWorked: task.info.status === false,
          inAproved: task.approved === null && task.info.status === true,
          inReturnWorked: task.approved === false,
          aproved: task.approved === true,
        }"
      >
        {{
          task.info.status === null && task.approved === null
            ? "Создан"
            : task.info.status === false
            ? "В работе"
            : task.approved === null
            ? "На подтверждении"
            : task.approved === false
            ? "Возврат в работу"
            : "Исполнен"
        }}
        <span></span>
      </p>
    </div>
  </div>
  <div class="info__block__wrp">
    <div class="info__block">
      <p>Организация:</p>
      <p>{{ task.creator.organization.fullName }}</p>
    </div>
    <div class="info__block">
      <p>Инициатор:</p>
      <p>
        {{ `${task.creator.lastName} ${task.creator.firstName} ${task.creator.surName}`
        }}<img
          class="info__icon"
          @click="contextInfoOpen($event, task.organization.shortName, task.creator.department.name, task.creator.position.shortName)"
          :src="require(`@/share/assets/icons/infoGreyIcon.svg`)"
        />
      </p>
    </div>
  </div>

  <div class="info__block__wrp">
    <div class="info__block" v-if="task.department">
      <p>Ответственный отдел:</p>
      <p>
        {{ `${task.department.name}`
        }}<img
          class="info__icon"
          @click="
            contextInfoDepOpen(
              $event,
              `Организация`,
              `${store.state.personal.departments.find((dep) => dep.headId === task?.department.headId)?.head.lastName} ${
                store.state.personal.departments.find((dep) => dep.headId === task?.department.headId)?.head.firstName
              } ${store.state.personal.departments.find((dep) => dep.headId === task?.department.headId)?.head.surName}`
            )
          "
          :src="require(`@/share/assets/icons/infoGreyIcon.svg`)"
        />
      </p>
    </div>
    <div class="info__block" v-else>
      <p>Ответственный отдел не назначен</p>
      <p>&nbsp;</p>
    </div>
    <div class="info__block" v-if="task.executor">
      <p>Ответственный исполнитель:</p>
      <p>
        {{ `${task.executor.lastName} ${task.executor.firstName} ${task.executor.surName}`
        }}<img
          class="info__icon"
          @click="contextInfoOpen($event, task.executor.organization.shortName, task.department.name, task.executor.position.shortName)"
          :src="require(`@/share/assets/icons/infoGreyIcon.svg`)"
        />
      </p>
    </div>
    <div class="info__block" v-else>
      <p>Ответственный не назначен</p>
      <p>&nbsp;</p>
    </div>
    <div class="info__block">
      <p>Соисполнители:</p>
      <p v-if="!task.soExecutors.length">Не указано</p>
      <p v-else v-for="(soexec, index) in task.soExecutors" :key="index">
        {{ `${soexec.personal.lastName} ${soexec.personal.firstName} ${soexec.personal.surName}`
        }}<img
          class="info__icon"
          @click="contextInfoOpen($event, soexec.personal.organization.shortName, soexec.personal.department.name, soexec.personal.position.shortName)"
          :src="require(`@/share/assets/icons/infoGreyIcon.svg`)"
        />
      </p>
      <button
        type="button"
        class="info__block__button"
        v-if="resolveRight() || (!task.approved && task.executor && userInfo.isDepHead && userInfo.isHead && userInfo.isVice)"
        @click="soExecModal"
      >
        Добавить соисполнителя
      </button>
    </div>
    <div class="info__block">
      <p>Контролирующий сотрудник:</p>

      <p>
        {{ `${task.control.lastName} ${task.control.firstName} ${task.control.surName}`
        }}<img
          class="info__icon"
          @click="contextInfoOpen($event, task.control.organization.shortName, task.control.department.name, task.control.position.shortName)"
          :src="require(`@/share/assets/icons/infoGreyIcon.svg`)"
        />
      </p>
    </div>
  </div>
  <div class="info__block__wrp" v-if="resolveAction()">
    <div class="info__block">
      <p>Выбор действия:</p>
      <select :class="{ selected: select, unselected: !select }" v-model="selectedOption" @change="changeToggleDown" @focus="changeToggleUp" @blur="changeToggleDown">
        <option value="null" disabled selected>Выберите действие</option>
        <option :value="item?.actionName!" v-for="item in resolveAction()">{{ item?.type }}</option>
      </select>
      <button type="button" class="info__block__button" @click="changeStateButton()">Выполнить</button>
      <!-- <button type="button" class="info__block__button" v-for="item in resolveAction()" v-if="resolveAction()" @click="changeStateButton(item?.actionName!)">
        {{ item?.type }}
      </button>
      <p style="text-align: center; font-weight: bold; font-size: 1.2em" v-else>{{ actionState }}</p> -->
      <!-- <button type="button" class="info__block__button" @click="contextOpen($event)">Действия</button> -->
    </div>
  </div>
</template>
<style scoped lang="scss">
  .contextMenu {
    & div {
      display: flex;
      align-items: center;
      gap: 0.3em;
      cursor: pointer;
      transition: transform 0.2s ease;
      &:hover {
        transform: scale(1.05);
      }
      &:active {
        transform: scale(0.95);
      }
      & p {
        margin: 0;
      }
      & img {
        aspect-ratio: 1/1;
        width: 1.2em;
      }
    }
  }
  .info__icon {
    cursor: pointer;
  }
  .contextInfo {
    & div {
      display: flex;
      flex-direction: column;
      gap: 0.5em;
      & p {
        margin: 0;
        display: flex;
        gap: 0.3em;
        align-items: center;
        & span {
          color: var(--third-text-color);
        }
      }

      & img {
        width: 1.3em;
      }
    }
  }
  .info__block {
    display: flex;
    flex-direction: column;
    gap: 0.4em;
    & p {
      cursor: default;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 0.5em;
      & img {
        width: 1em;
      }
    }
    select {
      cursor: pointer;
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
      & option {
        border-radius: 0 !important;
        border-bottom-left-radius: 0.4em;
        border-bottom-right-radius: 0.4em;
        box-shadow: none;
      }
    }
    .selected {
      background-image: url("@/share/assets/icons/arrowStickUpIcon.svg") !important;
    }
    .unselected {
      background-image: url("@/share/assets/icons/arrowStickDownIcon.svg") !important;
    }
    & p:nth-child(1) {
      color: var(--third-text-color);
    }

    &__wrp {
      display: flex;
      flex-direction: column;
      gap: 1em;
      padding-bottom: 0.5em;
      &:not(:last-child) {
        border-bottom: 0.1em solid var(--fourth-border-color);
      }
    }
  }
  .info-button-wrp {
    flex-direction: row !important;
  }
  .info__block__button {
    background: none;
    outline: none;
    border: none;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1em;
    align-self: flex-start;
    background-color: var(--primary-color);
    border-radius: 0.4em;
    padding: 0.4em 0.6em;
    color: var(--secondary-background-color);
    cursor: pointer;
    transition: transform 0.2s ease;
    &:active {
      transform: scale(0.95);
    }
    &:hover {
      background-color: var(--primary-hover-color) !important;
    }
  }

  .created {
    & span {
      display: inline-block;
      width: 0.7em;
      height: 0.7em;
      background-color: #00bfff !important;
      border-radius: 50%;
    }
  }
  .inWorked {
    & span {
      display: inline-block;
      width: 0.7em;
      height: 0.7em;
      background-color: #f79236 !important;
      border-radius: 50%;
    }
  }
  .inAproved {
    & span {
      display: inline-block;
      width: 0.7em;
      height: 0.7em;
      background-color: #ffd700 !important;
      border-radius: 50%;
    }
  }
  .inReturnWorked {
    & span {
      display: inline-block;
      width: 0.7em;
      height: 0.7em;
      background-color: #cd5322 !important;
      border-radius: 50%;
    }
  }
  .aproved {
    & span {
      display: inline-block;
      width: 0.7em;
      height: 0.7em;
      background-color: #32cd32 !important;
      border-radius: 50%;
    }
  }
</style>
