div
<script lang="ts" setup>
  import { useStore } from "@/entities";
  import { PropType, computed, onMounted, onUpdated, ref, watch } from "vue";
  import { useRoute } from "vue-router";
  import { fileUploadedList } from "@/widgets";
  import { contextMenu } from "@/share/UI";
  import { doRequest } from "@/helpers";
  import { FileUploader } from "@/featues";
  const store = useStore();
  const route = useRoute();
  const loaderState = ref(false);
  const events = computed(() => store.state.events.messages);
  const message = ref("");
  const fileUploaded = ref<{ filename: string; mimetype: string; size: number; url: string }[]>([]);
  const fileUploadedModal = ref(false);
  const __messages_wrp = ref<HTMLDivElement>();
  const loaded = ref<boolean>(false);

  const props = defineProps({
    task: {
      type: Object as PropType<iStore.Task>,
      required: true,
    },
    personalList: {
      type: Object as PropType<iStore.Personal[]>,
      required: true,
    },
  });

  const topContext = ref(0);
  const leftContext = ref(0);
  const showContext = ref(false);

  function contextOpen(e: MouseEvent) {
    topContext.value = e.pageY || e.clientY;
    leftContext.value = e.pageX || e.clientX;
    if (window.screen.availWidth - leftContext.value < 200) {
      leftContext.value = leftContext.value - 170;
    }
    showContext.value = true;
  }
  function contextClose() {
    topContext.value = 0;
    leftContext.value = 0;
    showContext.value = false;
  }
  function getTask() {
    return new Promise((resolve) => {
      store.dispatch("tasks/GET_TASK_BY_ID", route.params.id).then((res) => {
        resolve(true);
      });
    });
  }
  watch(events.value, (e) => {
    loaderState.value = false;
    getTask().then(() => {
      return (loaderState.value = true);
    });
  });
  function scrollByDown() {
    let count = 0;
    let interval = setInterval(() => {
      if (__messages_wrp.value) {
        if (count > 3) {
          clearInterval(interval);
        }
        __messages_wrp.value.scrollBy(0, 999999999);
        count++;
      }
    }, 50);
  }
  function senderPers(_id: number | null) {
    if (_id) {
      return props.personalList.filter((pers) => pers.id === _id)[0];
    }
    return null;
  }

  function getDateString(date: string) {
    const str = new Date(new Date(date)).toLocaleDateString().split(".").reverse().join("-");
    return Date.parse(str);
  }
  function getDate(index: number) {
    if (index < 1) return false;
    const prev = getDateString(props.task.info.log.filter((msg) => msg.type === "message")[index - 1].timestamp!);
    const current = getDateString(props.task.info.log.filter((msg) => msg.type === "message")[index].timestamp!);
    if (current - prev > 0) return true;
  }

  onUpdated(() => {
    scrollByDown();
  });
  onMounted(() => {
    window.addEventListener("contextmenu", (event) => {
      if (showContext.value) {
        event.preventDefault();
      }
    });
    scrollByDown();
  });

  function sendMessages() {
    if (message.value || fileUploaded.value.length > 0) {
      loaded.value = true;
      fileUploadedModal.value = false;
      const payload = {
        message: {
          text: message.value,
          files: fileUploaded.value,
        },
        taskId: store.state.tasks.task?.id,
      };

      doRequest("/tasks/update/message", {
        headers: { "Content-Type": "application/json; charset=utf-8" },
        method: "POST",
        body: JSON.stringify(payload),
      })
        .then(() => {
          message.value = "";
          fileUploaded.value = [];
          loaded.value = false;
          scrollByDown();
        })
        .catch((error) => {
          store.commit("events/PUSH_MESSAGE", {
            id: undefined,
            message: error,
            type: "error",
          });
        });
    }
  }
  function getParsedDateString(date: string) {
    if (new Date(date).toLocaleDateString() === new Date().toLocaleDateString()) return "Сегодня";
    else return new Date(date).toLocaleDateString("ru", { day: "2-digit", month: "long" });
  }
  function downloadFile(url: string, filename: string) {
    fetch(`${process.env.VUE_APP_API_URL}/upload${url}`, { method: "GET", credentials: "include" })
      .then((resp) => resp.blob())
      .then((blob) => {
        const link = document.createElement("a");
        document.body.appendChild(link);
        const url = window.URL.createObjectURL(blob);
        link.href = url;
        link.download = filename;
        link.click();
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
          document.body.removeChild(link);
        }, 0);
      });
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
  function files(file: { filename: string; mimetype: string; size: number; url: string }) {
    fileUploadedModal.value = true;
    fileUploaded.value.push(file);
  }
</script>

<template>
  <div class="comments">
    <div class="comments__comment" ref="__messages_wrp">
      <div class="comments-wrp">
        <div class="nullTask" v-if="!task.info.log.filter((msg) => msg.type === 'message').length">
          <h1>В задаче нет комментариев.</h1>
          <img :src="require(`@/share/assets/icons/NullCommentTask.svg`)" alt="logo" />
        </div>
        <div v-else v-for="(msg, index) in task.info.log.filter((msg) => msg.type === 'message')" :key="index" class="msg">
          <p v-if="getDate(index) || index === 0" class="personal__right__messages__date">{{ getParsedDateString(msg.timestamp) }}</p>
          <div class="msg-column">
            <div class="personal__left__list__member__avatar" v-if="senderPers(msg.senderId) && msg.senderId !== $store.state.user.info.id">
              <img v-if="senderPers(msg.senderId)?.user.avatar" class="personal__right__resiver__avatar__image" :src="senderPers(msg.senderId)?.user?.avatar || ''" />
              <p v-else class="personal__right__resiver__avatar__image">
                {{ `${senderPers(msg.senderId)?.lastName[0]}${senderPers(msg.senderId)?.firstName[0]}` }}
              </p>
            </div>
            <div class="msg-wrp">
              <div
                v-if="msg.files && msg.files.length > 0"
                v-on:click.right="contextOpen"
                class="personal__right__messages__files"
                :class="{ 'right-msg': msg.senderId === $store.state.user.info.id, 'left-msg': msg.senderId !== $store.state.user.info.id }"
              >
                <div v-if="msg.files && msg.files.length > 0" v-for="(link, i) in msg.files" :key="i">
                  <input type="button" @click="downloadFile(link.url, link.filename)" />
                  <div>
                    <p>{{ link.filename.split(".")[0] }}</p>
                    <p>{{ link.filename.split(".")[link.filename.split(".").length - 1].toUpperCase() }}, {{ humanFileSize(link.size) }}</p>
                  </div>
                </div>
                <span>{{ new Date(msg.timestamp).toLocaleTimeString("ru", { timeStyle: "short" }) }}</span>
              </div>
              <div
                v-if="msg.message"
                v-on:click.right="contextOpen"
                class="item-msg"
                :class="{ 'right-msg': msg.senderId === $store.state.user.info.id, 'left-msg': msg.senderId !== $store.state.user.info.id }"
              >
                <p class="msg-sender" v-if="msg.senderId !== $store.state.user.info.id">
                  {{ `${senderPers(msg.senderId)?.lastName} ${senderPers(msg.senderId)?.firstName[0]}.${senderPers(msg.senderId)?.surName[0]}.` }}
                </p>
                <p>{{ msg.message }}</p>
                <span>{{ new Date(msg.timestamp).toLocaleTimeString("ru", { timeStyle: "short" }) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="task.approved !== true" class="comments__actions">
      <form class="comments__actions__form" @submit.prevent="sendMessages">
        <FileUploader :exctraClass="true" @uploaded="files" ref="childComponentRef" />
        <input type="text" placeholder="Написать сообщение" v-model="message" />
        <input v-if="!loaded" type="submit" value="" />
        <span class="loader-btn" v-else></span>
      </form>
    </div>
    <fileUploadedList
      v-if="fileUploadedModal"
      :textVal="message"
      :textBool="true"
      :files="fileUploaded"
      @sendText="
        (text) => {
          message = text;
        }
      "
      @sendFiles="
        (files) => {
          fileUploaded = files;
        }
      "
      @sendMessage="sendMessages()"
      @close="fileUploadedModal = false"
      @addFiles="(file) => files(file)"
      @deleteFiles="
        (index) => {
          fileUploaded.splice(index, 1);
          if (fileUploaded.length < 1) {
            fileUploadedModal = false;
          }
        }
      "
    />
  </div>

  <contextMenu class="contextMenu" :display="showContext" :top="topContext" :left="leftContext" @close="contextClose">
    <div>
      <img :src="require(`@/share/assets/icons/editPencilIcon.svg`)" />
      <p>Редактировать</p>
    </div>
    <div>
      <img :src="require(`@/share/assets/icons/deleteIcon.svg`)" />
      <p>Удалить</p>
    </div>
  </contextMenu>
</template>

<style lang="scss" scoped>
  @media screen and (max-width: 480px) {
    .comments__actions {
      width: 100%;
      position: fixed;
      bottom: 0em;
      background-color: var(--secondary-background-color);
      justify-content: center;
    }

    .comments__actions__form {
      height: 3em;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 1em;
      flex-grow: 1;
      padding: 0 0.5em;
      & label {
        width: 1.5em;
      }
      & input[type="file"] {
        display: none;
      }
      & label,
      input[type="submit"] {
        margin: 0.5em;
        width: 1.5em;
        aspect-ratio: 1/1;
      }
      & input:nth-child(2) {
        flex-basis: 80%;
      }
    }
    .comments__comment {
      padding: 0 0 3em 0;
    }
    .comments-wrp {
      width: calc(100vw - 2em);
    }
  }
  @media screen and (min-width: 480px) {
    .comments__actions__form {
      padding: 1em;
      gap: 1em;
      flex-grow: 1;
      height: 3em;
      & label {
        width: 1.5em;
      }
      & input[type="file"] {
        display: none;
      }
      & input[type="submit"] {
      }
      & label,
      input[type="submit"] {
        margin: 0.5em;
        width: 2em;
        aspect-ratio: 1/1;
      }
      & input:nth-child(2) {
        flex-basis: 90%;
      }
    }

    .comments__comment {
      max-height: calc(100vh - 15.2466em);
      flex-grow: 1;
      overflow-y: auto;
      overflow-x: hidden;
      &::-webkit-scrollbar {
        width: 0.5em;
      }
      &::-webkit-scrollbar-thumb {
        background: var(--primary-color);
        border-radius: 0.5em;
      }

      &::-webkit-scrollbar-track {
        background-color: var(--background-color);
      }
    }
  }
  .nullTask {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    & img {
      width: 40%;
    }
  }
  .personal__right__messages__date {
    text-align: center;
    background-color: var(--button-background-button);
    align-self: center;
    color: var(--text-color);
    padding: 0.5em 1em;
    font-size: 1.2em;
    border-radius: 10em;
  }

  .personal__right__messages__files {
    background-color: var(--secondary-background-color);
    padding: 0.5em;
    border-radius: 0.7em;
    display: flex;
    flex-direction: column;
    max-width: 40%;
    & span {
      text-align: end;
      color: var(--fourth-text-color) !important;
      font-size: 0.7em;
    }
    & div {
      width: 100%;
      display: flex;
      flex-direction: row !important;
      gap: 0.5em;
      padding: 0.5em;
      border-radius: 0.7em;
      & div {
        display: flex;
        gap: 0.2em;
        align-self: center !important;
        flex-direction: column !important;
        overflow: hidden;
        & p {
          width: 95%;
          align-self: flex-start !important;
          background-color: transparent !important;
          padding: 0;
          margin: 0;
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
        }
      }

      & input {
        display: block;
        width: 3em;
        aspect-ratio: 1/1;
        background-color: transparent;
        border: none;
        align-self: center !important;
        outline: none;
        cursor: pointer;
        background-image: url("@/share/assets/icons/arrowDownIcon.svg");
        background-size: 40%;
        background-position: center center;
        background-repeat: no-repeat;
        background-color: var(--primary-color);
        border-radius: 50%;
      }
    }
  }
  .msg-sender {
    font-size: 0.8em;
    font-weight: bold;
  }
  .contextMenu {
    & div {
      display: flex;
      align-items: center;
      gap: 0.3em;
      cursor: pointer;
      transition: transform 0.2s ease;
      &:hover {
        transform: scale(1.05);
      }
      &:active {
        transform: scale(0.95);
      }
      & p {
        color: var(--primary-color);
        margin: 0;
      }
      & img {
        width: 1.2em;
      }
    }
  }
  .personal__left__list__member__avatar {
    & p,
    img {
      display: flex;
      margin: 0;
      padding: 0;
      padding: 0.4em;
      font-size: 1.2em;
      width: 2em;
      aspect-ratio: 1/1;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      object-fit: contain;
      background-color: var(--fourth-background-color);
      border-radius: 50%;
      color: var(--text-color);
    }
  }
  .comments {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    &__closed_chat {
      display: flex;
      width: 100%;
      height: 100%;
      justify-content: center;
      align-items: center;
    }
    &__comment {
      display: flex;
      flex-wrap: wrap;
    }
    &__actions {
      display: flex;
      justify-content: center;
      background-color: var(--secondary-background-color);
      &__form {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        flex-grow: 1;
        & label {
          display: block;
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
        & input[type="submit"] {
          background-image: url("@/share/assets/icons/subtract.svg");
          background-size: contain;
          background-position: center center;
          background-repeat: no-repeat;
        }
        & label,
        input[type="submit"] {
          display: inline-block;
          aspect-ratio: 1/1;
        }
        & input {
          outline: none;
          border: navajowhite;
          background-color: transparent;
          cursor: pointer;
        }
        & input:nth-child(2) {
          cursor: text;
        }
      }
    }
  }

  .msg {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.5em;
    padding: 0.3em;
    & .item-msg {
      display: flex;
      max-width: 70%;
      gap: 0.2em;
      flex-direction: column;
      background-color: var(--secondary-background-color);
      padding: 1em;
      border-radius: 0.7em;
      word-break: break-word;
      & p {
        margin: 0;
      }
    }
    & span {
      align-self: flex-end;
      color: var(--fourth-text-color) !important;
      font-size: 0.7em;
    }
  }

  .comments-wrp {
    background-color: var(--background-color);
    position: relative;
    display: flex;
    flex-grow: 1;
    flex-direction: column;
    display: flex;
    justify-content: flex-end;
    padding: 1em;
  }
  .msg-wrp {
    display: flex;
    gap: 0.5em;
    flex-direction: column;
    width: 100%;
  }
  .right-msg {
    align-self: flex-end !important;
  }
  .left-msg {
    align-self: flex-start !important;
  }

  .msg-column {
    display: flex;
    gap: 0.5em;
    align-items: end;
  }
  .loader-btn,
  .loader-btn:before,
  .loader-btn:after {
    border-radius: 50%;
    width: 2em;
    height: 2em;
    animation-fill-mode: both;
    animation: bblFadInOut 1.8s infinite ease-in-out;
  }
  .loader-btn {
    display: block;
    color: var(--secondary-text-color);
    font-size: 0.3em;
    position: relative;
    text-indent: -9999em;
    transform: translateZ(0);
    animation-delay: -0.16s;
  }
  .loader-btn:before,
  .loader-btn:after {
    content: "";
    position: absolute;
    top: 0;
  }
  .loader-btn:before {
    left: -3.5em;
    animation-delay: -0.32s;
  }
  .loader-btn:after {
    left: 3.5em;
  }
  @keyframes bblFadInOut {
    0%,
    80%,
    100% {
      box-shadow: 0 2.5em 0 -1.3em;
    }
    40% {
      box-shadow: 0 2.5em 0 0;
    }
  }
</style>
