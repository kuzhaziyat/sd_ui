<script setup lang="ts">
  import { activeButton } from "@/share/UI";
  import { useStore } from "@/entities";
  import { doRequest } from "@/helpers";

  const store = useStore();

  function logout() {
    store.commit("componentLoader/TOGGLE_STATE");
    doRequest("/auth/logout", { method: "GET" }).then((response) => window.location.reload());
  }
</script>
<template>
  <div class="update">
    <div class="update-wrp">
      <div>
        <img :src="require(`@/share/assets/icons/errorIcon.svg`)" />
        <p>
          Обновите систему! <br />
          После нажатия на кнопку Вам будет необходимо повторно авторизоваться
        </p>
        <activeButton text="Обновить" @clickEv="logout()" />
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
  .update {
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: var(--darkening-background);
    z-index: 4;
    & .update-wrp {
      bottom: 0;
      right: 0;
      left: 0;
      padding: 1em;
      background-color: var(--secondary-background-color);
      position: fixed;
      & div {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 2em;
        & img {
          width: 3em;
          aspect-ratio: 1/1;
        }
      }
    }
  }
</style>
