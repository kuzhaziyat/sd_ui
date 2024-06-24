<script lang="ts" setup>
  import { useStore } from "@/entities";
  import { doRequest } from "@/helpers";
  import { ref, computed, onMounted } from "vue";

  const store = useStore();
  const firstLogin = ref(Object.hasOwn(store.state.user.info, "reset"));
  const emit = defineEmits(["close"]);
  const passwordFieldType = ref("password");
  const passwordConFieldType = ref("password");
  const passConf = ref("");
  const pass = ref("");
  const isFormValid = computed(() => {
    return passConf.value.length > 3 && passConf.value === pass.value;
  });

  function switchVisibility() {
    passwordFieldType.value = passwordFieldType.value === "password" ? "text" : "password";
  }
  function switchConVisibility() {
    passwordConFieldType.value = passwordConFieldType.value === "password" ? "text" : "password";
  }

  function close(e: Event, close?: boolean) {
    if (firstLogin.value) return;
    if (close) return emit("close", "password");
    const target = e.target as HTMLElement;
    if (target.className === "password") emit("close", "password");
  }

  function resetPassword(e: Event) {
    const [pass, confirm] = e.target as unknown as [HTMLInputElement, HTMLInputElement];
    if (pass.value !== confirm.value) return;
    const payload = {
      email: store.state.user.info.person?.email,
      password: pass.value,
    };
    store.commit("componentLoader/TOGGLE_STATE");
    doRequest("/auth/reset", { method: "POST", headers: { "Content-Type": "application/json; charset=utf-8" }, body: JSON.stringify(payload) }).then(() => {
      store.commit("componentLoader/TOGGLE_STATE");
      doRequest("/auth/logout", { method: "GET" }).then((response) => window.location.reload());
    });
  }
  onMounted(() => {
    document.addEventListener("keyup", (e) => {
      if (e.key === "Escape") emit("close", "password");
    });
  });
</script>

<template>
  <div class="password" @mousedown="close($event, false)" @keyup.esc="close">
    <div class="password-wrp" tabindex="0">
      <h1 v-if="firstLogin">Добро пожаловать!</h1>
      <h1 v-else>Именить пароль</h1>
      <p v-if="firstLogin">Перед началом работы, выберите новый пароль для учетной записи.</p>
      <form @submit.prevent="resetPassword">
        <div>
          <label>Пароль</label>
          <input :type="passwordFieldType" v-model="pass" />
          <a :class="{ controlViewPass: true, view: passwordFieldType === 'password', noview: passwordFieldType === 'text' }" @click="switchVisibility()"></a>
        </div>
        <div>
          <label>Подтверждение пароля</label>
          <input :type="passwordConFieldType" v-model="passConf" />
          <a :class="{ controlViewPass: true, view: passwordConFieldType === 'password', noview: passwordConFieldType === 'text' }" @click="switchConVisibility()"></a>
        </div>
        <button type="submit" :class="{ 'active-button': isFormValid }" :disabled="!isFormValid">Получить код подтверждения</button>
      </form>
      <button v-if="!firstLogin" type="button" class="close" @click="close($event, true)"></button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .password {
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: var(--darkening-background);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 4;

    & .password-wrp {
      border-radius: 0.4em;
      padding: 2em 5em;
      background-color: var(--secondary-background-color);
      position: relative;
      & form {
        display: flex;
        flex-direction: column;
        gap: 2em;
        & button {
          display: block;
          padding: 1em 0;
          width: 100%;
          border: none;
          outline: none;
          background-color: var(--button-deactivate-color);
          color: var(--text-color);
          border-radius: 0.4em;
          cursor: not-allowed;
          &:hover {
            color: var(--text-hover-color);
          }
        }
        & div {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 0.5em;
          & input {
            margin: 0;
            width: calc(100% - 1em);
            padding: 0.5em;
            border: 0.1em solid var(--secondary-border-color);
            border-radius: 0.4em;
            background-color: transparent;
          }
        }
      }
    }
  }
  .close {
    display: block;
    position: absolute;
    outline: none;
    border: none;
    background-color: transparent;
    width: 1.5em;
    aspect-ratio: 1/1;
    border-radius: 1em;
    background-image: url("@/share/assets/icons/closeIcon.svg");
    background-size: 50%;
    background-position: center center;
    background-repeat: no-repeat;
    cursor: pointer;
    right: 1em;
    top: 1em;
    transition: transform 0.2s ease;
    &:hover {
      background-image: url("@/share/assets/icons/closeDarkIcon.svg");
    }
    &:active {
      transform: scale(0.8);
    }
  }
  .active-button {
    background: var(--primary-color) !important;
    cursor: pointer !important;
    transition: transform 0.2s ease;

    &:hover {
      background-color: var(--primary-hover-color) !important;
      color: var(--text-color) !important;
    }
    &:active {
      transform: scale(0.95);
    }
  }
  .controlViewPass {
    cursor: pointer;
    height: 1em;
    width: 1em;
    position: absolute;
    right: 0.5em;
    display: inline-block;
    top: 50%;
    transform: translate(0, 30%);
  }
  .view {
    background: url("@/share/assets/icons/viewDarkIcon.svg") center / cover no-repeat;
  }
  .noview {
    background: url("@/share/assets/icons/noViewDarkIcon.svg") center / cover no-repeat;
  }
</style>
