<script setup lang="ts">
  import { PropType, ref } from "vue";
  const select = ref(false);
  const emit = defineEmits(["clickEv"]);

  const props = defineProps({
    active: {
      type: Boolean as PropType<boolean>,
      required: false,
      default: true,
    },
    disabled: {
      type: Boolean as PropType<boolean>,
      required: false,
      default: false,
    },
    text: {
      type: String as PropType<string>,
      required: true,
    },
  });
</script>
<template>
  <button :class="{ 'active-button': active }" :disabled="disabled" @click="$emit('clickEv')">{{ text }}</button>
</template>
<style scoped lang="scss">
  button {
    display: block;
    padding: 0.6em 1em;
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

  .active-button {
    background: var(--primary-color) !important;
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
</style>
