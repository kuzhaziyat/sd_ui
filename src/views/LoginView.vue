<script lang="ts" setup>
  import { useStore } from "@/entities";
  import { doRequest } from "@/helpers";
  import { ref } from "vue";
  import { useRouter } from "vue-router";

  const router = useRouter();
  const store = useStore();

  const state = ref("login");
  const disabled = ref({
    email: false,
    pass: false,
  });
  const valid = ref(false);
  const expired = ref(false);
  const _email = ref("");
  const sended = ref(false);
  const message = ref("");
  const reseted = ref(false);
  const password = ref("");
  const passwordFieldType = ref("password");

  function switchVisibility() {
    passwordFieldType.value = passwordFieldType.value === "password" ? "text" : "password";
  }
  function checkEmail(e: Event) {
    const input = e.target as unknown as HTMLInputElement;
    if (!input.validity.patternMismatch) disabled.value.email = true;
  }

  function checkPass(e: Event) {
    const input = e.target as unknown as HTMLInputElement;
    if (!input.validity.patternMismatch) disabled.value.pass = true;
  }

  function checkCodeValid(e: Event) {
    const input = e.target as unknown as HTMLInputElement;
    if (!input.validity.patternMismatch) valid.value = true;
  }

  function resetPass() {
    disabled.value.email = false;
    state.value = "reset";
  }

  const login = (e: Event) => {
    const [email, password] = e.target as unknown as [HTMLInputElement, HTMLInputElement];
    store.commit("componentLoader/TOGGLE_STATE");

    doRequest("/auth/login", {
      headers: { "Content-Type": "application/json; charset=utf-8" },
      method: "POST",
      body: JSON.stringify({ email: email.value, password: password.value }),
    })
      .then(({ response }) => {
        router.push({ name: "Home" });
        store.commit("componentLoader/TOGGLE_STATE");
      })
      .catch((error) => {
        store.commit("componentLoader/TOGGLE_STATE");
        store.commit("events/PUSH_MESSAGE", {
          id: undefined,
          message: error,
          type: "error",
        });
      });
  };

  function resetPassword(e: Event) {
    const [email] = e.target as unknown as [HTMLInputElement, HTMLInputElement];
    startTimer();
    store.commit("componentLoader/TOGGLE_STATE");
    doRequest("/reset/password", {
      headers: { "Content-Type": "application/json; charset=utf-8" },
      method: "POST",
      body: JSON.stringify({ email: email.value }),
    })
      .then(({ response }) => {
        store.commit("componentLoader/TOGGLE_STATE");
        _email.value = email.value;
        sended.value = true;
        state.value = "confirm";
      })
      .catch((error) => {
        store.commit("componentLoader/TOGGLE_STATE");
        store.commit("events/PUSH_MESSAGE", {
          id: undefined,
          message: error,
          type: "error",
        });
      });
  }

  const timer = ref("");

  const countDownDate = ref(new Date().getTime() + 300000);

  function startTimer() {
    timer.value = "5:00";
    expired.value = false;
    const x = setInterval(function () {
      const now = new Date().getTime();
      const distance = countDownDate.value - now;

      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      timer.value = minutes + ":" + seconds;
      if (distance < 1) {
        clearInterval(x);
        expired.value = true;
      }
    }, 1000);
  }

  function resendCode() {
    store.commit("componentLoader/TOGGLE_STATE");
    doRequest("/reset/password", {
      headers: { "Content-Type": "application/json; charset=utf-8" },
      method: "POST",
      body: JSON.stringify({ email: _email.value }),
    })
      .then(({ response }) => {
        state.value = "confirm";
        store.commit("componentLoader/TOGGLE_STATE");
      })
      .catch((error) => {
        store.commit("componentLoader/TOGGLE_STATE");
        store.commit("events/PUSH_MESSAGE", {
          id: undefined,
          message: error,
          type: "error",
        });
      });
  }

  function enterCode(e: Event) {
    const [code, newpass, conf] = e.target as unknown as [HTMLInputElement, HTMLInputElement, HTMLInputElement];
    if (newpass.value !== conf.value) throw new Error("Пароли не совпадают!");
    store.commit("componentLoader/TOGGLE_STATE");
    doRequest("/reset/check", {
      headers: { "Content-Type": "application/json; charset=utf-8" },
      method: "POST",
      body: JSON.stringify({ code: code.value, email: _email.value, password: newpass.value }),
    })
      .then(({ response }) => {
        store.commit("componentLoader/TOGGLE_STATE");
        reseted.value = true;
        message.value = `Пароль успешно изменен!`;
        state.value = "login";
      })
      .catch((error) => {
        store.commit("componentLoader/TOGGLE_STATE");
        store.commit("events/PUSH_MESSAGE", {
          id: undefined,
          message: error,
          type: "error",
        });
      });
  }
</script>

<template>
  <div class="auth">
    <div class="auth__wrp">
      <div>
        <div class="auth__logo">
          <p>
            <img :src="require(`@/share/assets/icons/logo.svg`)" alt="logo" />
            <span>ServiceDesk</span>
          </p>
        </div>
        <div v-if="state === 'login'">
          <h1>Вход в личный кабинет</h1>
          <p style="text-align: center" v-if="reseted">{{ message }}</p>
          <form @submit.prevent="login" class="auth__form">
            <p>
              <label for="">Логин</label>
              <input type="email" @input="checkEmail($event)" pattern="[A-Za-z0-9._+\-']+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$" placeholder="Электронная почта" required />
            </p>
            <div class="passwordCon">
              <label for="">Пароль</label>
              <input :type="`${passwordFieldType}`" @input="checkPass($event)" pattern=".{4,}" placeholder="4-12 символов" required />
              <a :class="{ controlViewPass: true, view: passwordFieldType === 'password', noview: passwordFieldType === 'text' }" @click="switchVisibility()"></a>
            </div>
            <p class="auth-form-buttons-start" @click="resetPass">Забыл(-а) пароль</p>
            <button type="submit" :disabled="!disabled.email || !disabled.pass" :class="{ 'active-button': disabled.email && disabled.pass }">Войти</button>
            <p>
              <a @click="$router.push({ name: 'RegOrganization' })" class="auth-form-buttons-center">Регистрация</a>
            </p>
          </form>
        </div>
        <div v-if="state === 'reset'">
          <h1>Сброс пароля</h1>
          <form @submit.prevent="resetPassword" class="auth__form">
            <p style="text-align: center">Для сброса пароля введите свой email</p>
            <p>
              <input type="email" @input="checkEmail($event)" pattern="[A-Za-z0-9._+\-']+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$" placeholder="Электронная почта" required />
            </p>
            <button type="submit" :disabled="!disabled.email" :class="{ 'active-button': disabled.email }">Отправить код</button>
            <p class="auth-form-buttons-center" @click="state = 'login'">Вернуться к авторизации</p>
          </form>
        </div>
        <div v-if="state === 'confirm'">
          <h1>Сброс пароля</h1>
          <form @submit.prevent="enterCode" class="auth__form">
            <p v-if="!sended" style="text-align: center">Для сброса пароля введите свой email</p>
            <p v-else>Для сброса пароля аккаунта введите 6-значный код, который мы отправили на {{ _email }}</p>
            <p>
              <input type="text" @input="checkCodeValid($event)" placeholder="Код" pattern="[0-9]{6,}" required />
            </p>
            <p>
              <input type="password" pattern=".{4,}" placeholder="Введите новый пароль" required />
            </p>
            <p>
              <input type="password" pattern=".{4,}" placeholder="Подтверждение пароля" required />
            </p>
            <span v-if="!expired">Повторно код можно получить через {{ timer }}</span>
            <p v-else class="retry" @click="resendCode">Отправить поторно</p>
            <button type="submit" :disabled="!valid" :class="{ 'active-button': valid }">Отправить код</button>
            <p class="auth-form-buttons-center" @click="state = 'login'">Вернуться к авторизации</p>
          </form>
        </div>
      </div>
    </div>
    <div class="register__tech">
      <p>Техническая поддержка по номеру телефона 8(39422) 9-77-08</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  @media screen and (max-width: 480px) {
    .auth__form {
      width: 90%;
    }
    h1 {
      font-size: 1.5em !important;
    }
    .auth__wrp {
      width: calc(90% - 2em);
      padding: 1em;
    }
    .register__tech {
      bottom: 1em;
      width: 90%;
      text-align: center;
      color: var(--secondary-text-color);
      font-size: 1em;
    }
    .auth__logo {
      font-size: 1.5em;
      & p {
        gap: 0.5em;
        & img {
          width: 1.5em;
        }
      }
    }
  }
  @media screen and (min-width: 480px) {
    .auth__form {
      width: 80%;
    }
    .auth__wrp {
      width: 40%;
      padding: 2em;
      gap: 2em;
    }
    .register__tech {
      position: fixed;
      bottom: 2em;
      left: 50%;
      transform: translate(-50%);
      font-size: 1.1em;
    }
    .auth__logo {
      font-size: 3em;
      & p {
        gap: 0.5em;
        & img {
          width: 2em;
        }
      }
    }
  }
  .auth {
    width: 100%;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: var(--background-color);
  }
  .auth__wrp {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-around;
    background-color: var(--third-background-color);
    color: var(--text-color);
    border-radius: 0.4em;
    & h1 {
      text-align: center;
    }
    & div {
      width: 100%;
    }
  }
  .auth__logo {
    display: flex;
    justify-content: center;
    & p {
      margin: 0.5em 0;
      display: flex;
      justify-content: center;
      align-items: center;
      text-decoration: none;
      & img {
        display: block;
        aspect-ratio: 1/1;
      }
      & span {
        color: var(--primary-color);
      }
    }
  }
  .auth__form {
    margin: 0 auto;
    & div {
      display: flex;
      flex-direction: column;
      gap: 1em;
    }
    & p {
      display: flex;
      flex-direction: column;
      gap: 0.4em;
    }
    & input {
      width: calc(100% - 1em);
      padding: 0.5em;
      border: 0.1em solid var(--border-color);
      border-radius: 0.4em;
      outline: none;
      background-color: transparent;
      color: var(--text-color);
    }
    & input::placeholder {
      color: var(--text-color);
    }
    & span {
      display: block;
      margin-bottom: 1em;
    }
    & button {
      display: block;
      padding: 1em 0;
      width: 100%;
      border: none;
      outline: none;
      color: var(--text-color);
      border-radius: 0.4em;
      cursor: not-allowed;
    }
  }
  .auth-form-buttons {
    cursor: pointer;
    text-align: center;
    color: var(--primary-color);
  }
  .auth-form-buttons:hover {
    color: var(--primary-hover-color) !important;
  }
  .auth-form-buttons-start {
    cursor: pointer;
    text-align: start;
    color: var(--text-color);
  }
  .auth-form-buttons-center {
    cursor: pointer;
    text-align: center;
    color: var(--text-color);
  }
  .auth-form-buttons-center:hover,
  .auth-form-buttons-start:hover {
    color: var(--text-hover-color) !important;
  }

  .active-button {
    background: var(--primary-color) !important;
    cursor: pointer !important;
    transition: transform 0.2s ease;

    &:hover {
      background-color: var(--primary-hover-color) !important;
    }
    &:active {
      transform: scale(0.95);
    }
  }

  .passwordCon {
    position: relative;
  }
  .controlViewPass {
    cursor: pointer;
    height: 1em;
    width: 1em;
    position: absolute;
    right: 0.5em;
    display: inline-block;
    top: 50%;
    transform: translate(0, 50%);
  }
  .view {
    background: url("@/share/assets/icons/viewIcon.svg") center / cover no-repeat;
  }
  .noview {
    background: url("@/share/assets/icons/noViewIcon.svg") center / cover no-repeat;
  }
  .register__tech {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    color: var(--secondary-text-color);
  }
</style>
