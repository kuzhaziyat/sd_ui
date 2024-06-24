<script setup lang="ts">
  import { PropType, ref, watchEffect } from "vue";

  const emit = defineEmits(["close"]);
  const context = ref();
  const X = ref();
  const Y = ref();

  const props = defineProps({
    display: {
      type: Boolean as PropType<boolean>,
      required: true,
    },
    top: {
      type: Number as PropType<number>,
      required: true,
    },
    left: {
      type: Number as PropType<number>,
      required: true,
    },
  });

  function close() {
    emit("close");
  }
  watchEffect(() => {
    if (context.value) {
      context.value.focus();
      if (props.left !== 0 && props.top !== 0) {
        const menuRect = context.value.getBoundingClientRect();
        if (menuRect) {
          const viewportHeight = window.innerHeight;
          if (props.top + menuRect.height > viewportHeight) {
            Y.value = menuRect.height - props.top;
          } else {
            Y.value = props.top;
          }
          const viewportWidth = window.innerWidth;

          if (props.left + menuRect.width > viewportWidth) {
            X.value = viewportWidth - menuRect.width;
          } else {
            X.value = props.left;
          }
        }
      }
    }
  });
</script>
<template>
  <div class="context-menu" ref="context" v-if="display" :style="{ top: Y + 'px', left: X + 'px' }" tabindex="0" @blur="close()">
    <slot></slot>
  </div>
</template>
<style scoped lang="scss">
  .context-menu {
    width: fit-content;
    padding: 1em;
    display: flex;
    flex-direction: column;
    gap: 0.5em;
    position: fixed;
    background: white;
    z-index: 999;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
    border-radius: 0.4em;
  }
</style>
