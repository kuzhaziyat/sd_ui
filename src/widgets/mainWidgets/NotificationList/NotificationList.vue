<script lang="ts" setup>
  import { useStore } from "@/entities";
  import { sockets } from "@/main";
  import { computed, ref, watchEffect } from "vue";

  const context = ref();
  const store = useStore();
  const emit = defineEmits(["close"]);

  const notificationMessages = computed(() => store.state.events.messages);

  function setReaded({ index, id }: { index: number; id?: number }) {
    if (id) sockets.emit("read_task_message", id);
    store.state.events.messages.splice(index, 1);
  }

  function close() {
    emit("close");
  }
  watchEffect(() => {
    if (context.value) {
      context.value.focus();
    }
  });
</script>
<template>
  <div class="notification" ref="context" tabindex="0" @blur="close()">
    <div class="notification__header">
      <p>Уведомления</p>
      <p class="clean-button">Очистить</p>
    </div>
    <div class="notification__wrp">
      <div class="notification__message" v-for="(notification, index) in notificationMessages" :key="index">
        <p>{{ notification.message }}</p>
        <p class="dateNotification"></p>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
  p {
    margin: 0;
  }
  .notification {
    padding: 1em;
    display: flex;
    flex-direction: column;
    gap: 0.5em;
    position: absolute;
    top: 4.5em;
    right: 12em;
    background: white;
    z-index: 5;
    border-radius: 0.4em;
    border-top-right-radius: 0;
    width: 15em;
    box-shadow: 0 0 1em 0.1em rgba(0, 0, 0, 0.29);

    &__header {
      display: flex;
      justify-content: space-between;
      width: 100%;
      & p {
        cursor: default;
      }
    }
  }
  .notification__wrp {
    flex-direction: column;
    gap: 1em;
    width: 100%;
    max-height: 30vh;
    overflow-y: auto;
    overflow-x: hidden;
    &::-webkit-scrollbar {
      width: 0.2em;
    }
    &::-webkit-scrollbar-thumb {
      background: var(--primary-color);
      border-radius: 0.5em;
    }

    &::-webkit-scrollbar-track {
      background-color: var(--background-color);
    }
  }
  .clean-button {
    cursor: pointer !important;
    color: var(--third-text-color);
    transition: transform 0.2s ease;

    &:hover {
      color: var(--text-hover-color);
    }
    &:active {
      transform: scale(0.95);
    }
  }
</style>
