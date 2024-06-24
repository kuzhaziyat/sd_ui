<script setup lang="ts">
  import { PropType, ref, watch } from "vue";
  const select = ref(false);
  const emit = defineEmits(["inputVal"]); // Define the emitted event

  const props = defineProps({
    listOptions: {
      type: Object as PropType<Record<string, any>[]>,
      required: true,
    },
    selected: {
      type: Number as PropType<number>,
      required: false,
    },
  });

  const _value = ref(props.selected);

  function changeToggleUp() {
    select.value = true;
  }
  function changeToggleDown(e: Event) {
    select.value = false;
    (e.target as HTMLElement).blur();
  }
  watch(_value, (val) => {
    emit("inputVal", val);
  });
</script>
<template>
  <select :class="{ selected: select, unselected: !select }" v-model="_value" @change="changeToggleDown" @focus="changeToggleUp" @blur="changeToggleDown">
    <option v-for="(item, index) in listOptions" :key="index" :value="item.value">{{ item.name }}</option>
  </select>
</template>
<style scoped lang="scss">
  select {
    cursor: pointer;
    outline: none;
    border: none;
    border: 0.1em solid var(--fourth-border-color);
    padding: 0.5em;
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
</style>
