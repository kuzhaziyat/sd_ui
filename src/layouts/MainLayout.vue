<script lang="ts" setup>
  import { useStore } from "@/entities";
  import { sockets } from "@/main";
  import { computed, onMounted, ref } from "vue";
  import {
    MobileMenu,
    MobileHeader,
    AssideNav,
    MainHeader,
    CreateTask,
    ResetPersonal,
    SetConfirmDismiss,
    AddSubOrgs,
    Events,
    AddPerson,
    ResetPassword,
    CreateDepartment,
    AddPosition,
    UpdateWidget,
    HamburgerMenu,
  } from "@/widgets";
  import { useRoute } from "vue-router";
  import { loader } from "@/widgets";

  const _container = ref<HTMLDivElement>();
  const modal = ref({
    createTask: false,
    addPerson: false,
    password: false,
    createDeparment: false,
    addSubOrgs: false,
    resetPersonal: false,
    addPosition: false,
    setConfirmDismiss: false,
  });
  const store = useStore();
  const route = useRoute();
  const loaderState = computed(() => store.state.componentLoader.status);

  if (document.cookie.length > 0) {
    const cookie = decodeURIComponent(document.cookie).split("=");
    if (cookie[0] === "sd-user") {
      const user = JSON.parse(cookie[1]);
      store.commit("personal/SET_ID", user.id);
      store.commit("user/SET_USER", user);
    }
  }
  store.commit("componentLoader/TOGGLE_STATE");

  function closeAllModal(type: keyof typeof modal.value) {
    Object.entries(modal.value).forEach((val) => {
      if (type === val[0]) return;
      modal.value[val[0] as keyof typeof modal.value] = false;
    });
  }

  function modalWindows(type: keyof typeof modal.value) {
    closeAllModal(type);
    if (type === "createTask") {
      return (modal.value.createTask = !modal.value.createTask);
    } else if (type === "addPerson") {
      return (modal.value.addPerson = !modal.value.addPerson);
    } else if (type === "createDeparment") {
      return (modal.value.createDeparment = !modal.value.createDeparment);
    } else if (type === "password") {
      return (modal.value.password = !modal.value.password);
    } else if (type === "addSubOrgs") {
      return (modal.value.addSubOrgs = !modal.value.addSubOrgs);
    } else if (type === "addPosition") {
      return (modal.value.addPosition = !modal.value.addPosition);
    } else if (type === "setConfirmDismiss") {
      return (modal.value.setConfirmDismiss = !modal.value.setConfirmDismiss);
    } else if (type === "resetPersonal") {
      return (modal.value.resetPersonal = !modal.value.resetPersonal);
    }
  }

  sockets.connect();

  const hooks = [store.dispatch("tasks/GET_ALL_INFO"), store.dispatch("personal/GET_PERSONAL_LIST"), store.dispatch("events/GET_NOTIFICATIONS")];
  if (store.state.user.info.isAdmin || store.state.user.info.isManager || store.state.user.info.isVice || store.state.user.info.isHead || store.state.user.info.isDepHead) {
    hooks.unshift(store.dispatch("personal/GET_REQUIRED_DATA"));
    hooks.unshift(store.dispatch("tasks/GET_REQUIRED_DATA"));
  }
  Promise.all(hooks).then(() => {
    store.commit("componentLoader/TOGGLE_STATE");
    sockets.emit("getPrivateMessages");
    sockets.on("privateMessage", (payload) => {
      store.commit("personal/SET_PRIVATE_MESSAGE", payload);
    });
    sockets.on("privateMessages", (payload) => {
      store.commit("personal/SET_PRIVATE_MESSAGES", payload);
    });
    sockets.on("setOnline", (payload) => {
      store.commit("personal/SET_ONLINE", payload);
    });
    sockets.on("setOffline", (payload) => {
      store.commit("personal/SET_OFFLINE", payload);
    });
    sockets.on("setReadedMessage", (payload) => {
      store.commit("personal/SET_MESSAGE_TO_READED", payload);
    });
    sockets.on("setOnlinePersonal", (payload) => {
      store.commit("personal/SET_ONLINE", payload);
    });
    sockets.on("success_sended", (payload) => {
      store.dispatch("tasks/GET_ALL_INFO").then(() => {
        if (route.fullPath) store.dispatch("tasks/GET_ALL_TASKS", { offset: "1", count: "20", filter: undefined });
        store.commit("events/SUCCESS_ACTION", payload);
      });
    });
    sockets.on("new_task_from_parent", (payload) => {
      store.dispatch("tasks/GET_ALL_INFO").then(() => {
        if (route.fullPath) store.dispatch("tasks/GET_ALL_TASKS", { offset: "1", count: "20", filter: undefined });
        store.commit("events/PUSH_MESSAGE", payload);
      });
    });
    sockets.on("new_inner_task", (payload) => {
      store.dispatch("tasks/GET_ALL_INFO").then(() => {
        if (route.fullPath) store.dispatch("tasks/GET_ALL_TASKS", { offset: "1", count: "20", filter: undefined });
        store.commit("events/PUSH_MESSAGE", payload);
      });
    });
    sockets.on("task_update_info", (payload) => {
      store.dispatch("tasks/GET_ALL_INFO").then(() => {
        if (route.fullPath) store.dispatch("tasks/GET_ALL_TASKS", { offset: "1", count: "20", filter: undefined });
        store.commit("events/PUSH_MESSAGE", payload);
      });
    });
    sockets.on("new_task_message", (payload) => {
      const { type, message, id } = payload;
      store.dispatch("events/GET_NOTIFICATIONS_BY_ID", id).then(() => {
        store.commit("events/PUSH_MESSAGE", { type, message });
      });
    });
  });

  onMounted(() => {
    if (Object.hasOwn(store.state.user.info, "reset")) {
      modal.value.password = true;
    }
    if (screen.width <= 480) {
      store.commit("app/CHANGE_STATE_MOBILE", true);
    } else {
      store.commit("app/CHANGE_STATE_MOBILE", false);
    }
  });
</script>
<template>
  <loader v-if="loaderState"></loader>
  <div class="container" v-else ref="_container">
    <AssideNav class="asside" />
    <div class="container__view">
      <MainHeader @action="modalWindows" class="main-header" />
      <MobileHeader class="mobile-header" @action="modalWindows" v-if="store.state.app.mobile" />
      <main class="main">
        <router-view @action="modalWindows"></router-view>
      </main>
    </div>
    <Events />
    <CreateTask v-if="modal.createTask" @close="modalWindows" />
    <AddPerson v-if="modal.addPerson" @close="modalWindows" />
    <ResetPassword v-if="modal.password" @close="modalWindows" />
    <CreateDepartment v-if="modal.createDeparment" @close="modalWindows" />
    <AddSubOrgs v-if="modal.addSubOrgs" @close="modalWindows" />
    <AddPosition v-if="modal.addPosition" @close="modalWindows" />
    <SetConfirmDismiss v-if="modal.setConfirmDismiss" @close="modalWindows" />
    <ResetPersonal v-if="modal.resetPersonal" @close="modalWindows" />
    <UpdateWidget v-if="false" @close="modalWindows" />
    <HamburgerMenu />
  </div>
</template>

<style lang="scss" scoped>
  .container {
    width: 100%;
    display: flex;
    flex-grow: 1;
  }
  .container__view {
    width: 100%;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
  }
  .main {
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    height: calc(100% - 2em);
  }
  @media screen and (max-width: 480px) {
    .asside {
      display: none;
    }
    .main-header {
      display: none;
    }
  }
  @media screen and (min-width: 480px) {
    .mobile-menu {
      display: none;
    }
    .mobile-header {
      display: none;
    }
  }
</style>
