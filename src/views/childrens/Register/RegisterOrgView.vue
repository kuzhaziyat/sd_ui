<script lang="ts" setup>
  import { store } from "@/entities";
  import { doRequest } from "@/helpers";
  import { ref, computed } from "vue";
  import { loader } from "@/widgets";

  const state = ref("start");
  const approve = ref(false);
  const organizationName = ref<{ name: string; inn: string }>();
  const password = ref("");
  const codePatternMismatch = ref(true);
  const adminEmail = ref("");
  const FIO = ref("");
  const pass = ref("");
  const passConf = ref("");
  const phoneNum = ref("");
  const inn = ref("");
  const regInn = ref("");
  const _name = ref<{ firstName: string; lastName: string; surName: string }>();
  const _inputs = ref<HTMLCollection>();

  const timer = ref("");
  const expired = ref(false);

  const countDownDate = ref<number>();

  const error = ref<string>();

  const org = localStorage.getItem("orgCreate");

  const inputsNumber = document.getElementsByClassName("otpIn");

  const isInnValid = computed(() => {
    return regInn.value;
  });
  const isFormValid = computed(() => {
    return FIO.value && adminEmail.value && phoneNum.value.length && pass.value.length && pass.value === passConf.value;
  });

  let numArr = ["", "", "", "", "", ""];
  const passwordFieldType = ref("password");
  const confPasswordFieldType = ref("password");

  function switchVisibility() {
    passwordFieldType.value = passwordFieldType.value === "password" ? "text" : "password";
  }
  function confSwitchVisibility() {
    confPasswordFieldType.value = confPasswordFieldType.value === "password" ? "text" : "password";
  }

  if (org) {
    try {
      if (!JSON.parse(org).name) state.value = "start";
      const _org = JSON.parse(org);
      organizationName.value = {
        name: _org.name || "",
        inn: _org.reqisites.inn || inn.value,
      };
      state.value = "approve";
    } catch (error) {
      localStorage.clear();
      state.value = "start";
    }
  }

  function checkCodeValid(e: Event) {
    const inputsCode = Array.from(Array.from(inputsNumber) as HTMLInputElement[])
      .map((input) => input.value)
      .join("");
    if (inputsCode.length == 6) {
      codePatternMismatch.value = false;
      confirmEmail(inputsCode);
    }
  }
  function cleanInn(e: Event) {
    state.value = "start";
    localStorage.removeItem("orgCreate");
  }

  function checkINN(e: Event) {
    store.commit("componentLoader/TOGGLE_STATE");
    const [input] = e.target as unknown as [HTMLInputElement];
    doRequest("/org/getinfo", {
      headers: { "Content-Type": "application/json; charset=utf-8" },
      method: "POST",
      body: JSON.stringify({ inn: input.value.trim() }),
    })
      .then(({ response }) => {
        const { name, reqisites, management, orgName } = response as { name: string; reqisites: any; management: any; orgName: any };
        organizationName.value = {
          name,
          inn: reqisites.inn,
        };
        store.commit("componentLoader/TOGGLE_STATE");
        localStorage.setItem("orgCreate", JSON.stringify({ name, reqisites, management, orgName }));
        state.value = "approve";
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

  function approved() {
    if (approve.value) {
      state.value = "confirm";
    } else throw new Error("Подтвердите организацию");
  }

  function register(e: Event) {
    store.commit("componentLoader/TOGGLE_STATE");
    const [name, email, _phone, pass, confpass] = e.target as unknown as [HTMLInputElement, HTMLInputElement, HTMLInputElement, HTMLInputElement, HTMLInputElement];
    if (pass.value !== confpass.value) {
      pass.classList.add("invalid");
      confpass.classList.add("invalid");
      confpass.validationMessage;
      return (error.value = "Пароли не совпадают");
    }
    _name.value = {
      lastName: name.value.split(" ")[0],
      firstName: name.value.split(" ")[1],
      surName: name.value.split(" ")[2],
    };
    doRequest("/confirm/email", {
      headers: { "Content-Type": "application/json; charset=utf-8" },
      method: "POST",
      body: JSON.stringify({ email: adminEmail.value, password: pass.value, inn: organizationName.value?.inn, name: _name.value.firstName + " " + _name.value.surName }),
    })
      .then(({ response }) => {
        password.value = pass.value;
        startTimer();
        state.value = "email";
        return store.commit("componentLoader/TOGGLE_STATE");
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

  function confirmEmail(code: string) {
    store.commit("componentLoader/TOGGLE_STATE");
    const org = localStorage.getItem("orgCreate");
    if (code.length == 6) {
      doRequest("/confirm/code", {
        headers: { "Content-Type": "application/json; charset=utf-8" },
        method: "POST",
        body: JSON.stringify({ email: adminEmail.value, code: code, organization: JSON.parse(org!), password: password.value, phone: phoneNum.value, name: _name.value }),
      })
        .then(({ response }) => {
          localStorage.clear();
          state.value = "finish";
          return store.commit("componentLoader/TOGGLE_STATE");
        })
        .catch((error) => {
          store.commit("componentLoader/TOGGLE_STATE");
          store.commit("events/PUSH_MESSAGE", {
            id: undefined,
            message: error.message,
            type: "error",
          });
        });
    }
  }

  function startTimer() {
    countDownDate.value = new Date().getTime() + 60000;
    timer.value = "1:00";
    expired.value = false;
    const x = setInterval(function () {
      const now = new Date().getTime();
      const distance = countDownDate.value! - now;
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
    doRequest("/confirm/email", {
      headers: { "Content-Type": "application/json; charset=utf-8" },
      method: "POST",
      body: JSON.stringify({ email: adminEmail.value, password: password.value, inn: organizationName.value?.inn }),
    })
      .then(({ response }) => {
        startTimer();
        state.value = "email";
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

  function checkOPTinp(e: KeyboardEvent, index: number): void {
    let keyCode: string = e.key;
    const currentActiveElement = inputsNumber[index] as HTMLElement;
    if (!isNaN(parseInt(keyCode)) || e.key === "Backspace") {
      if (keyCode === "Backspace") {
        if (currentActiveElement.previousElementSibling) {
          const previousElement = currentActiveElement.previousElementSibling as HTMLElement;
          setTimeout(() => {
            previousElement.focus();
          }, 0);
        }
      } else if (!isNaN(parseInt(keyCode))) {
        if (currentActiveElement && currentActiveElement.nextElementSibling) {
          const nextElementSibling = currentActiveElement.nextElementSibling as HTMLElement;
          setTimeout(() => {
            nextElementSibling.focus();
          }, 0);
        } else {
          codePatternMismatch.value = false;
        }
      }
    }
  }

  function pastCode(e: Event) {
    // try {
    navigator.clipboard
      .readText()
      .then((_code) => {
        const code = _code.split("");
        if (_inputs.value) {
          for (let i = 0; i < _inputs.value.length; i++) {
            const input = _inputs.value[i] as HTMLInputElement;
            input.value = code[i];
            if (i === 5) codePatternMismatch.value = !codePatternMismatch.value;
          }
        }
      })
      .catch((error) => console.log(error));
  }

  function checkExistStr(str?: string) {
    if (!str) return "";
    return str;
  }

  function formatPhoneNumber(num: string) {
    const number = num.split("");
    return [
      checkExistStr(number[0]) ? `(${checkExistStr(number[0])}` : "",
      checkExistStr(number[1]),
      checkExistStr(number[2]) ? `${checkExistStr(number[2])})` : "",
      checkExistStr(number[3]),
      checkExistStr(number[4]),
      checkExistStr(number[5]) ? `${checkExistStr(number[5])}-` : "",
      checkExistStr(number[6]),
      checkExistStr(number[7]) ? `${checkExistStr(number[7])}-` : "",
      checkExistStr(number[8]),
      checkExistStr(number[9]),
      checkExistStr(number[10]),
    ].join("");
  }
  function inputChange(e: Event) {
    const event = e as unknown as InputEvent;
    const input = e.target as HTMLInputElement;
    if (event.data && /\D/.test(event.data)) return (input.value = formatPhoneNumber(input.value.replace(/\D/g, "")));
    if (input.value.length > 14) {
      const str = input.value.replace(/\(|\)|-|\D/g, "");
      input.value = formatPhoneNumber(str.slice(0, -1));
      return;
    }
    if (event.inputType === "insertText") {
      const str = input.value.replace(/\(|\)|-/g, "");
      if (/\d{10,}/.test(str)) phoneNum.value = str;
      return (input.value = formatPhoneNumber(str));
    } else if (event.inputType === "deleteContentBackward") {
      if (/-|\)|\(/.test(input.value[input.value.length - 1])) {
        input.value = input.value.slice(0, -1);
      }
      phoneNum.value = "";
    } else if (event.inputType === "insertFromPaste") {
      const str = input.value.replace(/\(|\)|-/g, "");
      if (/\d{10,}/.test(str)) phoneNum.value = str;
      return (input.value = formatPhoneNumber(str));
    } else {
      const str = input.value.replace(/\(|\)|-/g, "");
      phoneNum.value = "";
      return (input.value = formatPhoneNumber(str));
    }
  }
</script>

<template>
  <loader v-if="$store.state.componentLoader.status" />
  <transition v-else>
    <div class="org-reg">
      <form class="org-reg-form" @submit.prevent="checkINN" v-if="state === 'start'">
        <h1 style="text-align: center">Регистрация</h1>
        <label> ИНН организации </label>
        <input type="number" v-model="regInn" />
        <button type="submit" :class="{ 'active-button': isInnValid }" :disabled="!isInnValid">Продолжить</button>
      </form>
      <form class="org-reg-form" @submit.prevent="approved" v-else-if="state === 'approve'">
        <label> ИНН организации </label>
        <p style="display: flex; justify-content: space-between">
          {{ organizationName?.inn }}
          <span class="clean-button" @click="cleanInn">очистить</span>
        </p>
        <label> Наименование организации </label>
        <p>{{ organizationName?.name }}</p>
        <div class="check">
          <input id="_approve" type="checkbox" v-model="approve" />
          <label for="_approve" style="margin-bottom: 2em">Все верно?</label>
        </div>
        <button type="submit" :class="{ 'active-button': approve }" :disabled="!approve">Продолжить</button>
      </form>
      <form class="org-reg-form" @submit.prevent="register" v-else-if="state === 'confirm'">
        <div class="register-form">
          <label> ФИО </label>
          <input type="text" pattern=".{2,}\s.{2,}" v-model="FIO" required />
        </div>
        <div class="register-form">
          <label> Электронная почта </label>
          <input type="email" pattern="[A-Za-z0-9._+\-']+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$" v-model="adminEmail" required />
        </div>
        <div class="register-form">
          <label>Номер телефона</label>
          <div class="register-form__number">
            <span>+7</span>
            <input type="tel" @input="inputChange" required />
          </div>
        </div>
        <div class="register-form">
          <label>Пароль</label>
          <input :type="passwordFieldType" pattern=".{4,}" placeholder="от 4 символов" v-model="pass" required />
          <a :class="{ controlViewPass: true, view: passwordFieldType === 'password', noview: passwordFieldType === 'text' }" @click="switchVisibility()"></a>
        </div>
        <div class="register-form">
          <label>Подтверждение пароля</label>
          <input :type="confPasswordFieldType" pattern=".{4,}" v-model="passConf" required />
          <a :class="{ controlViewPass: true, view: confPasswordFieldType === 'password', noview: confPasswordFieldType === 'text' }" @click="confSwitchVisibility()"></a>
        </div>
        <p v-if="error" class="error">{{ error }}</p>
        <button type="submit" :class="{ 'active-button': isFormValid }" :disabled="!isFormValid">Получить код подтверждения</button>
      </form>
      <form class="org-reg-form" @submit.prevent="checkCodeValid" v-else-if="state === 'email'">
        <span>Для активации аккаунта введите 6-значный код, который мы отправили на {{ adminEmail }}</span>
        <!-- <input type="text" @input="checkCodeValid($event)" placeholder="Код" pattern="[0-9]{6,}" /> -->
        <div class="inputs">
          <input v-for="(item, index) in numArr" type="text" class="otpIn" maxlength="1" @keyup="checkOPTinp($event, index)" @paste="pastCode" ref="_inputs" />
        </div>
        <span>Если письмо не пришло или у вас есть вопросы, напишите нам на <span>help@sdesk.online</span></span>
        <span v-if="!expired">Повторно код можно получить через {{ timer }}</span>
        <p v-else class="retry" @click="resendCode">Отправить поторно</p>
        <button type="submit" :disabled="codePatternMismatch" :class="{ 'active-button': !codePatternMismatch }">Завершить</button>
      </form>
      <div class="org-reg-form" v-else-if="state === 'finish'">
        <h1 style="text-align: center">Ваш аккаунт успешно создан</h1>
        <button @click="$router.push(`/login`)" class="active-button">Войти</button>
      </div>
    </div>
  </transition>
</template>

<style lang="scss" scoped>
  @media screen and (max-width: 480px) {
    .org-reg-form {
      width: 90%;
      font-size: 1em;
    }
  }
  @media screen and (min-width: 480px) {
    .org-reg-form {
      width: 80%;
      font-size: 1.2em;
    }
  }
  .org-reg {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 1em;
  }
  .retry {
    text-align: center;
    background-color: var();
    cursor: pointer !important;
    & :hover {
      border: var(--button-hover-color);
    }
  }
  .org-reg-form {
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 1em;
    justify-content: center;
    align-items: center;
    .error {
      color: red;
    }
    & .register-form {
      flex-direction: column;
      display: flex;
      justify-content: center;
      align-items: center;
      align-self: flex-start;
      position: relative;
      width: 100%;
    }
    & label {
      margin-right: auto;
    }
    & span {
      text-align: center;
      & span {
        color: var(--primary-color);
      }
    }
    & input,
    p {
      margin: 0;
      width: calc(100% - 1em);
      padding: 0.5em;
      border: 0.1em solid var(--border-color);
      border-radius: 0.4em;
      outline: none;
      background-color: transparent;
      color: var(--text-color);
    }
    /* Chrome, Safari, Edge, Opera */
    & input::-webkit-outer-spin-button,
    & input::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
    & input[type="number"] {
      appearance: textfield;
    }

    & input::placeholder {
      color: var(--text-color);
    }
    & p:nth-child(2) {
      font-size: 1em;
    }
    & .check {
      display: flex;
      justify-content: center;
      align-items: center;
      align-self: flex-start;
      position: relative;
      gap: 2em;
      & input[type="checkbox"] {
        display: none;
      }
      & label {
        margin: 0 0 0 3em;
        user-select: none;
      }
      & input[type="checkbox"]:not(:checked) + label:before,
      input[type="checkbox"]:not(:checked) + label:before,
      input[type="checkbox"]:checked + label:after {
        content: "";
        position: absolute;
        left: 0;
        transform: translate(0, -15%);
        width: 2em;
        aspect-ratio: 1/1;
        border: 0.1em solid var(--border-color);
        border-radius: 0.5em;
      }
      & input[type="checkbox"]:checked + label:after {
        background: url("@/share/assets/icons/checkedIcon.svg") center / 80% no-repeat;
      }
    }
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
  }
  .controlViewPass {
    cursor: pointer;
    position: absolute;
    top: 50%;
    right: 0.5em;
    width: 1em;
    height: 1em;
    background-repeat: no-repeat;
    background-position: center;
  }
  .otpIn {
    text-align: center;
  }
  .active-button {
    background-color: var(--primary-color) !important;
    cursor: pointer !important;
    color: var(--text-color) !important;
    transition: transform 0.2s ease;

    &:hover {
      background-color: var(--primary-hover-color) !important;
    }
    &:active {
      transform: scale(0.95);
    }
  }

  .register-form__number {
    width: calc(100% - 1em);
    display: flex;
    align-items: center;
    padding: 0 0.5em;
    border: 0.1em solid var(--border-color);
    border-radius: 0.4em;
    & input {
      border: none;
      padding: 0.5em 0;
    }
  }

  .invalid {
    border: none;
    outline: none;
    border: 0.1em solid red;
  }

  .inputs {
    display: flex;
    gap: 1em;
    & input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
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

  .view {
    background: url("@/share/assets/icons/viewIcon.svg") center / cover no-repeat;
  }
  .noview {
    background: url("@/share/assets/icons/noViewIcon.svg") center / cover no-repeat;
  }
  .clean-button {
    cursor: pointer;
    &:hover {
      color: var(--text-hover-color);
    }
  }
</style>
