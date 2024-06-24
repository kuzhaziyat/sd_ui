<script lang="ts" setup>
  import { useStore } from "@/entities";
  import { doRequest } from "@/helpers";
  import { onMounted, ref } from "vue";
  import { textAreaComp } from "@/share/UI";

  const store = useStore();
  const emit = defineEmits(["close"]);
  const __wrp = ref();
  const userInfo = ref(store.state.user.info);
  const persInfo = store.state.personal.personalList.find((pers) => pers.id === userInfo.value.id);
  const persList = ref(store.state.personal.personalList);

  const selectId = ref<number[]>();
  const select = ref<number>();
  const comment = ref("");

  function close(e: Event, close?: boolean) {
    if (close) return emit("close");
    const target = e.target as HTMLElement;
    if (target.className === "task__actions") emit("close");
  }

  function doAction() {
    const payload = {};
    store.commit("componentLoader/TOGGLE_STATE");
    doRequest("/tasks/update/executor", {
      headers: { "Content-Type": "application/json; charset=utf-8" },
      method: "POST",
      body: JSON.stringify(payload),
    })
      .then(({ response }) => {
        store.commit("componentLoader/TOGGLE_STATE");
        emit("close");
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

  onMounted(() => {
    __wrp.value?.focus();
  });
  function agreemented() {
    const control = persList.value.find((pers) => pers.id === persInfo?.department.controlId);
    const depHead = persList.value.find((pers) => pers.id === persInfo?.department.headId);

    if (userInfo.value.isDepHead) {
      return [{ name: `${control?.lastName} ${control?.firstName[0]}. ${control?.surName[0]}. ${control?.position.name}`, id: control?.id }];
    }
    if (!userInfo.value.isHead && !userInfo.value.isVice && !userInfo.value.isDepHead) {
      return [{ name: `${depHead?.lastName} ${depHead?.firstName[0]}. ${depHead?.surName[0]}. ${depHead?.position.name}`, id: depHead?.id }];
    }
  }
  function setPers() {
    const id = select.value;
    if (id !== undefined) {
      selectId.value?.push(id);
      select.value = undefined;
    }
  }
  function agreementList() {
    const _selectedid = selectId.value;
    const
    persList.value.filter((pers) => )
    for
    for (pers in   )
    return [{ name: `${depHead?.lastName} ${depHead?.firstName[0]}. ${depHead?.surName[0]}. ${depHead?.position.name}`, id: depHead?.id }];
  }
</script>

<template>
  <div class="task__actions" @click="close($event, false)" @keyup.esc="close($event, false)" ref="__wrp" tabindex="0">
    <div class="setagreement">
      <div class="setagreement__wrp">
        <h2>Лист согласования</h2>
        <p class="required">Согласующие</p>
        <select v-model="select" @change="setPers()">
          <option value="null" selected disabled>Выбрать согласующих</option>
          <option v-if="agreemented() !== undefined" v-for="pers in agreemented()" :value="pers.id">{{ pers.name }}</option>
        </select>
        <div></div>
        <p>Причина возврата</p>
        <textAreaComp :textVal="comment" @inputVal="(value:string) => (comment = value)"></textAreaComp>
        <button type="button" :class="{ 'active-button': selectId?.length }" :disabled="!selectId?.length" @click="doAction">Назначить</button>
      </div>
      <button type="button" class="close" @click="close($event, true)"></button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  p {
    margin: 0;
  }
  .task__actions {
    z-index: 5;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: var(--dark-background);
    display: grid;
    place-content: center;
  }
  .setagreement {
    position: relative;
    &__wrp {
      border-radius: 0.4em;
      padding: 2em 5em;
      background-color: var(--secondary-background-color);
      position: relative;
      display: flex;
      flex-direction: column;
      gap: 1em;
      height: max-content;

      & select {
        cursor: pointer;
        outline: none;
        border: none;
        border: 0.1em solid var(--fourth-border-color);
        padding: 0.4em 0.4em;
        border-radius: 0.4em;
        color: var(--secondary-text-color);
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
        background-size: 1em;
        background-position: calc(100% - 1em) center;
        background-repeat: no-repeat;
      }
      .selected {
        background-image: url("@/share/assets/icons/arrowStickUpIcon.svg") !important;
      }
      .unselected {
        background-image: url("@/share/assets/icons/arrowStickDownIcon.svg") !important;
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
</style>
