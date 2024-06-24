<script lang="ts" setup>
  import { useStore } from "@/entities";
  import { sockets } from "@/main";
  import { computed } from "vue";

  const store = useStore();

  const eventMessgas = computed(() => store.state.events.messages);
  function setReaded({ index, id }: { index: number; id?: number }) {
    if (id) sockets.emit("read_task_message", id);
    store.state.events.messages.splice(index, 1);
  }
</script>

<template>
  <div class="events">
    <div class="events__wrp">
      <div class="events__message" v-for="(event, index) in eventMessgas" :key="index" @click="setReaded({ index, id: event.id })">
        <p :class="event.type"></p>
        <p>{{ event.message }}</p>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  @media screen and (max-width: 480px) {
    .events {
      width: 90vw;
      position: fixed;
      bottom: 1em;
      left: 5vw;
    }
  }
  @media screen and (min-width: 480px) {
    .events {
      width: 25%;
      position: absolute;
      right: 3em;
      bottom: 3em;
    }
  }
  .events {
    display: flex;
    flex-wrap: wrap;
    flex-direction: column;
    z-index: 9999;
    &__wrp {
      display: flex;
      flex-direction: column;
      gap: 1em;
    }
    &__message {
      display: flex;
      gap: 1em;
      background-color: var(--secondary-background-color);
      border-radius: 0.4em;
      padding: 0.5em 0.5em;
      align-items: center;
      color: var(--secondary-text-color);
      box-shadow: 0 0 1em 0.5em rgba(0, 0, 0, 0.29);
      animation: rise 8s forwards;
      cursor: pointer;
      & > p:nth-child(1) {
        position: relative;
        flex-basis: 15%;
        padding: 2em;
        background-color: transparent;
        background-repeat: no-repeat;
        background-position: center center;
        border-right: 0.1em solid var(--fourth-color);
      }
    }
  }

  .info {
    background-image: url("@/share/assets/icons/info.svg");
  }
  .error {
    background-image: url("@/share/assets/icons/errorIcon.svg");
  }
  .warning {
    background-image: url("@/share/assets/icons/warning.svg");
  }
  .success {
    background-image: url("@/share/assets/icons/succes.svg");
  }

  @keyframes rise {
    0% {
      opacity: 0;
    }
    20% {
      opacity: 1;
    }
    80% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }
</style>
