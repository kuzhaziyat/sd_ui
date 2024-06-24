<script setup lang="ts">
  import { PropType, defineProps, defineEmits, ref, onMounted } from "vue";
  import { FileUploader } from "@/featues";
  import {textAreaComp} from "@/share/UI"
  const emit = defineEmits(["close", "deleteFiles",'addFiles','sendFiles','sendText','sendMessage']);
  const __wrp = ref();
  const textValue = ref('');

  const props = defineProps({
    files: {
      type: Object as PropType<{ filename: string; mimetype: string; size: number; url: string }[]>,
      required: true,
    },
    textVal:{
      type: String as PropType<string>,
      required: false,
      defoult:''
    },
    textBool:{
      type: Boolean as PropType<boolean>,
      required:false,
      defoult:true
    }
  });

  function close(e: Event, close?: boolean) {
    if (close){ 
      emit('sendFiles',[]); 
      emit("close");
      return;
    };
    const target = e.target as HTMLElement;
    if (target.className === "actions") {
      emit("close");
      emit('sendFiles',[]);
    };
  }
  
  function humanFileSize(bytes: number, si: boolean = false, dp: number = 1) {
    const thresh = si ? 1000 : 1024;
    if (Math.abs(bytes) < thresh) {
      return bytes + " B";
    }
    const units = si ? ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"] : ["KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    let u = -1;
    const r = 10 ** dp;
    do {
      bytes /= thresh;
      ++u;
    } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);
    return bytes.toFixed(dp) + " " + units[u];
  }

  onMounted(() => {
    __wrp.value?.focus();
  });

  function filess(file: { filename: string; mimetype: string; size: number; url: string }) {
    emit('addFiles',file)
  }
  function sendMessage(){
    emit('sendFiles',props.files)
    emit('sendText',textValue.value)
    emit('sendMessage')
    emit("close");

  }
</script>
<template>
  <div class="actions" ref="__wrp" tabindex="0">
    <div class="listFiles">
      <div class="listFiles__wrp">
        <h3>Выбранно {{ files.length }} файлов</h3>
        <div class="files__wrp">
          <div  v-for="(file, index) in files">
          <div><img :src="require(`@/share/assets/icons/fileIcon.svg`)" />
          <p>{{ file.filename }}
            <p class="fileSize">{{ humanFileSize(file.size) }}</p>
          </p>
          </div>
          <button @click="emit('deleteFiles', index)" class="close"></button>
        </div>
        </div>
        <p  v-if="textBool" class="fileSize">Комментарий</p>
        <textAreaComp
          v-if="textBool"
          :textVal="textVal"
          @inputVal="(value:string) => (textValue = value)"
        ></textAreaComp>
        <div class="button-wrp">
          <FileUploader :exctraClass="false" @uploaded="filess" ref="childComponentRef" />
        </div>
        <div class="button-wrp">
          <button  v-if="!textBool" @click="close($event, true)" class="cancel">Очистить</button>
          <button v-if="!textBool" @click="sendMessage()" class="aproved">Сохранить</button>

          <button  v-if="textBool" @click="close($event, true)" class="cancel">Отмена</button>
          <button v-if="textBool" @click="sendMessage()" class="aproved">Отправить</button>
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
@media screen and (max-width: 480px) {
    .listFiles__wrp {
      width: calc(100vw - 4em);
      padding: 1em;
      & div {
      & p {
        width: 15em;
      }
    }
    }
   .actions{
    position: fixed;
   }
  }
  @media screen and (min-width: 480px) {
    .actions{
      position: absolute;
    }
    .listFiles__wrp {
      width: 100%;
      padding: 1.3em;

    }
    .files__wrp{
      & div {
        & p {
          width: 20em;
        }
      }}
  }
  .actions {
    z-index: 5;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: var( --dark-background);
    display: grid;
    place-content: center;
  }
  .fileSize{
    color: var(--third-text-color);
    margin: 0;
  }
  .button-wrp {
    & button {
      display: block;
      padding: 1em;
      width: 100%;
      border: none;
      outline: none;
      color: var(--text-color);
      border-radius: 0.4em;
      cursor: pointer !important;
      transition: transform 0.2s ease;
      &:active {
        transform: scale(0.95);
      }
    }
  }
  .files__wrp{
    display: flex;
      flex-direction: column;
      gap: 1em;
      max-height: 50vh;
      overflow-y: auto;
      overflow-x: hidden;
      &::-webkit-scrollbar {
        width: 0.2em;
      }
      &::-webkit-scrollbar-thumb {
        background: var(--primary-color);
        border-radius: 0.5em;
      }

      &::-webkit-scrollbar-track {
        background-color: var(--background-color);
      }
      & div {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 0.5em;
        position: relative;
        & img {
          width: 3em;
        }
        & p {
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
          margin: 0;
        }
      }
      
  }
  .listFiles {
    position: relative;
    &__wrp {
      border-radius: 0.4em;
      background-color: var(--secondary-background-color);
      display: flex;
      flex-direction: column;
      gap: 0.5em;
      height: max-content;
      & div {
        padding: 0.3em;
        display: flex;
        justify-content: space-between;
        gap: 0.5em;}
    }
  }

  .close {
    display: block;
    outline: none;
    border: none;
    background-color: transparent;
    width: 1em;
    aspect-ratio: 1/1;
    background-image: url("@/share/assets/icons/closeIcon.svg");
    background-position: center center;
    background-repeat: no-repeat;
    cursor: pointer;
    transition: transform 0.2s ease;
    &:hover {
      background-image: url("@/share/assets/icons/closeDarkIcon.svg");
    }
    &:active {
      transform: scale(0.8);
    }
  }
  .aproved {
    background-color: var(--primary-color);

    &:hover {
      background-color: var(--primary-hover-color) !important;
    }
  }
  .cancel {
    background-color: var(--secondary-text-color);

    &:hover {
      background-color: var(--button-deactivate-color) !important;
    }
  }
</style>
