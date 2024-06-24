<script lang="ts" setup>
  import { useStore } from "@/entities";
  import { doRequest } from "@/helpers";
  import { PropType, onMounted, ref } from "vue";

  const store = useStore();

  const props = defineProps({
    exctraClass: {
      type: Boolean as PropType<boolean>,
      required: false,
      default: false,
    },
  });

  const files = ref<HTMLInputElement>();
  const emit = defineEmits(["uploaded"]);

  function filesUpload(e: Event) {
    const { files } = e.target as HTMLInputElement;
    if (files?.length) {
      [...files].forEach((file) => {
        const form = new FormData();
        form.append("file", file, file.name);
        doRequest("/files/upload", { method: "POST", body: form, headers: { "Content-Length": `${file.size}` } })
          .then(({ response }) => {
            emit("uploaded", response);
          })
          .catch((error) => {
            store.commit("events/PUSH_MESSAGE", {
              id: undefined,
              message: error.message,
              type: "error",
            });
          });
      });
    }
  }

  onMounted(() => {
    files.value?.addEventListener("change", filesUpload);
  });
</script>

<template>
  <div class="file-uploader" v-if="!exctraClass">
    <label for="_files">Добавить файлы</label>
    <input
      type="file"
      id="_files"
      multiple
      accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document, image/*,.pdf"
      ref="files"
    />
  </div>
  <div v-else class="hidden">
    <label for="_files"></label>
    <input
      type="file"
      id="_files"
      multiple
      accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document, image/*,.pdf"
      ref="files"
    />
  </div>
</template>

<style lang="scss" scoped>
  .file-uploader {
    display: flex;
    align-items: center;
    gap: 1em;
    & p {
      margin: 0;
    }
    & label {
      display: block;
      width: max-content;
      outline: none;
      border: none;
      background-color: transparent;
      padding: 0.6em 1em;
      background-color: var(--primary-color);
      border-radius: 0.4em;
      color: var(--text-color);
      cursor: pointer;
      transition: transform 0.2s ease;
      &:hover {
        background-color: var(--primary-hover-color) !important;
      }
      &:active {
        transform: scale(0.95);
      }
    }
    & input[type="file"] {
      display: none;
    }
  }
  .hidden {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 0.5em;
    & label {
      display: block;
      width: 1.5em;
      aspect-ratio: 1/1;
      background-image: url("@/share/assets/icons/filesIcon.svg");
      background-size: contain;
      background-position: center center;
      background-repeat: no-repeat;
      cursor: pointer;
    }
    & input[type="file"] {
      display: none;
    }
  }
</style>
