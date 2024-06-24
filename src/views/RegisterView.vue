<script lang="ts" setup>
  import { useStore } from "@/entities";
  import { computed } from "vue";

  const store = useStore();

  const loaderState = computed(() => store.state.componentLoader.status);
</script>

<template>
  <div class="register">
    <div class="register__wrp">
      <div class="register__logo">
        <p>
          <img :src="require(`@/share/assets/icons/logo.svg`)" alt="logo" />
          <span>ServiceDesk</span>
        </p>
      </div>
      <router-view></router-view>
      <p>Уже зарегистрированы? <a @click="$router.push({ name: 'Login' })" class="auth-form-buttons">Войдите</a></p>
    </div>
    <div class="register__tech">
      <p>Техническая поддержка по номеру телефона 8(39422) 9-77-08</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  @media screen and (max-width: 480px) {
    .register__tech {
      bottom: 1em;
      width: 90%;
      text-align: center;
      color: var(--secondary-text-color);
      font-size: 1em;
    }
    .org-reg-form {
      & h1 {
        font-size: 3em !important;
      }
    }
    .register__wrp {
      width: calc(90% - 2em);
      gap: 2em;
      padding: 1em;
    }
    .register__logo {
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
    .register__tech {
      position: fixed;
      bottom: 2em;
      left: 50%;
      transform: translate(-50%);
      font-size: 1.1em;
    }
    .register__wrp {
      width: 40%;

      gap: 2em;
      padding: 2em;
    }
    .register__logo {
      font-size: 3em;
      & p {
        gap: 0.5em;
        & img {
          width: 2em;
        }
      }
    }
  }
  .register {
    width: 100%;
    flex-grow: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    background-color: var(--background-color);
  }
  .register__wrp {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    background: var(--third-background-color);
    color: var(--text-color);
    border-radius: 0.4em;
  }
  .register__tech {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    color: var(--secondary-text-color);
  }
  .register__logo {
    display: flex;
    & p {
      margin: 0.5em 0 0 0;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 0.5em;
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
  .auth-form-buttons {
    cursor: pointer;
    text-align: center;
    color: var(--primary-color);
    transition: transform 0.2s ease;
    &:hover {
      color: var(--primary-hover-color) !important;
    }
    &:active {
      transform: scale(0.95);
    }
  }

  .register__nav {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1em;
    & h3 {
      margin: 0;
      font-weight: normal;
      font-size: 2em;
    }
    & nav {
      width: 100%;
      display: flex;
      justify-content: center;
      gap: 2em;
      & ul {
        width: 60%;
        display: flex;
        // justify-content: space-between;
        padding-inline-start: 0;
        & li {
          width: 100%;
          display: block;
          list-style-type: none;
          text-align: center;
          & a {
            text-decoration: none;
            color: var(--text-color);
            text-align: center;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 3em;
            padding: 0.5em 1em;
            background: linear-gradient(180deg, var(--fourth-color) 0%, rgba(255, 255, 255, 0) 93%);
            border-radius: 0.4em;
          }
          & a:hover {
            background: linear-gradient(180deg, var(--fourth-hover-color) 0%, rgba(255, 255, 255, 0) 93%);
          }
        }
        & .router-link-active > a {
          box-shadow: none;
          background: linear-gradient(180deg, var(--primary-color) 0%, rgba(255, 255, 255, 0) 93%);
        }
        & .router-link-active :hover {
          background: linear-gradient(180deg, var(--primary-hover-color) 0%, rgba(255, 255, 255, 0) 93%);
        }
      }
    }
  }
  .router-link-active {
    background-color: var(--primary-color);
  }
</style>
