<script lang="ts" setup>
  import { useStore } from "@/entities";
  import { sockets } from "@/main";
  import { computed, onMounted, ref } from "vue";
  import { ChatMessenger, ChatList, MobileHeader } from "@/widgets";
  import { onBeforeRouteLeave } from "vue-router";

  const store = useStore();
  const selected = ref<number | null>(null);
  const emit = defineEmits(["chatStateMessenger"]);

  const stateMobile = ref({ mobile: false, state: "chatList" });

  onMounted(() => {
    store.commit("titles/SET_TITLE", "Сообщения");
    if (store.state.app.mobile) {
      stateMobile.value.mobile = true;
    } else if (!store.state.app.mobile) {
      stateMobile.value.mobile = false;
    }
    store.commit("app/CHANGE_STATE_RETURN", false);
  });
  onBeforeRouteLeave((to, from, next) => {
    if (stateMobile.value.state === "chatMessenger") {
      stateMobile.value.state = "chatList";
      store.commit("app/CHANGE_STATE_RETURN", false);
      store.commit("titles/SET_TITLE", "Сообщения");
      next(false);
    } else {
      next();
    }
  });
  function clickSelected(id: number) {
    selected.value = id;
    if (stateMobile.value.mobile) {
      stateMobile.value.state = "chatMessenger";
      store.commit("app/CHANGE_STATE_RETURN", true);
    }
  }
</script>

<template>
  <div class="personal">
    <ChatList v-if="stateMobile.state === 'chatList'" @selected="(id) => clickSelected(id)" />
    <ChatMessenger v-if="!stateMobile.mobile || stateMobile.state === 'chatMessenger'" :selected="selected" :mobile="stateMobile.mobile" />
  </div>
</template>

<style lang="scss" scoped>
  @media screen and (max-width: 480px) {
    .personal {
      position: relative;
      display: flex;
      flex-direction: column;
    }
  }
  @media screen and (min-width: 480px) {
    .personal {
      position: relative;
      display: flex;
      justify-content: space-between;
    }
  }
  .personal {
    gap: 1em;
    flex-grow: 1;
    background-color: var(--secondary-background-color);
    overflow: hidden;
  }
</style>
