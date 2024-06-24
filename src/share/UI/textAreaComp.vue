<script setup lang="ts">
  import { PropType, defineProps, defineEmits, ref } from "vue";

  const emit = defineEmits(["inputVal"]); // Define the emitted event
  const modelVal = ref(""); // Reactive reference for the input value

  // Define props
  const props = defineProps({
    readonly: {
      type: Boolean as PropType<boolean>,
      required: false,
      default: false,
    },
    textVal: {
      type: String as PropType<string>,
      required: false,
      default: "",
    },
    rowsCount: {
      type: Number as PropType<number>,
      required: false,
      default: 2,
    },
  });

  function updateValue(e: Event) {
    const newValue = (e.target as HTMLInputElement).value;
    modelVal.value = newValue;
    emit("inputVal", newValue);
  }
</script>

<template>
  <textarea :class="{ readonly: props.readonly }" type="text" :rows="rowsCount" :value="props.textVal" @input="updateValue" :readonly="props.readonly"></textarea>
</template>

<!-- Scoped styles -->
<style scoped lang="scss">
  textarea {
    justify-self: auto;
    padding: 0.5em;
    border: 0.1em solid var(--fourth-border-color);
    outline: none;
    border-radius: 0.4em;
    word-wrap: break-word !important;
    background-color: var(--secondary-background-color);
  }

  .readonly {
    cursor: default !important;
    border: 0.1em solid transparent !important;
    background-color: transparent !important;
  }
</style>
