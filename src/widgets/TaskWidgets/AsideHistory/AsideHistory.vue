<script lang="ts" setup>
  import { PropType } from "vue";

  defineProps({
    task: {
      type: Object as PropType<iStore.Task>,
      required: true,
    },
    personalList: {
      type: Object as PropType<iStore.Personal[]>,
      required: true,
    },
  });
</script>
<template>
  <div class="info__block">
    <p>Дата создания:</p>
    <p>{{ new Date(task.info.createdAt).toLocaleString("ru", { dateStyle: "medium", timeStyle: "medium" }).split(",").join(" ") }}</p>
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
  <div class="info__block" v-else>
    <p>Дата исполнения:</p>
    <p>Не установлено</p>
  </div>
  <div class="task__right__history__log" v-if="personalList.length > 0">
    <div class="task__right__history__log__wrp info__block" v-for="(msg, index) in task.info.log.filter((msg) => msg.type === 'system')" :key="index">
      <p>{{ msg.message }}</p>
      <p>
        {{ personalList.find((pers) => pers.id === msg.senderId)?.lastName }} {{ personalList.find((pers) => pers.id === msg.senderId)?.firstName }}
        {{ personalList.find((pers) => pers.id === msg.senderId)?.surName }} <br />{{ personalList.find((pers) => pers.id === msg.senderId)?.department.name }}
        {{ personalList.find((pers) => pers.id === msg.senderId)?.position.name }}
      </p>
      <p>{{ new Date(msg.timestamp).toLocaleString().split(",").join(" ") }}</p>
    </div>
  </div>
</template>
<style scoped lang="scss">
  .task__right__history__log {
    display: flex;
    flex-direction: column;
    gap: 1em;
  }
  .task__right__history__log__wrp {
    padding-bottom: 0.5em;
    border-bottom: 0.1em solid var(--fourth-border-color);
  }

  .info__block__wrp:nth-child(2) {
    padding: 1em 0;
    border-top: 0.1em solid var(--fourth-border-color);
    border-bottom: 0.1em solid var(--fourth-border-color);
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
    & p:nth-child(1) {
      color: var(--third-text-color);
    }
  }
</style>
