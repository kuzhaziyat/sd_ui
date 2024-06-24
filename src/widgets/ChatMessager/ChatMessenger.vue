<script setup lang="ts">
  import { useStore } from "@/entities";
  import { sockets } from "@/main";
  import { PropType, computed, onMounted, onUnmounted, onUpdated, ref } from "vue";
  import { FileUploader } from "@/featues";
  import { contextMenu } from "@/share/UI";
  import { fileUploadedList } from "@/widgets";

  const store = useStore();
  const __messages_wrp = ref<HTMLDivElement>();
  const fileUploadedModal = ref(false);
  const messageVal = ref("");

  const topContext = ref(0);
  const leftContext = ref(0);
  const showContext = ref(false);

  const props = defineProps({
    selected: {
      type: Number as PropType<number> | PropType<null>,
      required: true,
    },
    mobile: {
      type: Boolean as PropType<boolean>,
      required: true,
    },
  });

  const personalList = computed(() =>
    store.state.personal.personalList.filter((pers) => {
      if (pers.user === undefined) return false;
      return pers.id !== store.state.user.info?.id;
    })
  );

  const message = ref<Omit<iStore.SocketsMessages, "id" | "delivered">>({
    files: [],
    message: ``,
    reciverId: 0,
    senderId: 0,
    readed: false,
    timestamp: ``,
  });

  const isPersNullText = computed(() => {
    if (personalList.value.length > 0) {
      return "Выберите чат";
    } else return "Для начала общения, пожалуйста, зарегистрируйте других пользователей в системе";
  });
  const selectedPers = computed(
    () =>
      props.selected !== null &&
      personalList.value.find((pers) => {
        return pers.id === props.selected;
      })
  );
  const messages = computed(
    () =>
      (props.selected !== null &&
        personalList.value.find((pers) => {
          return pers.id === props.selected;
        })?.messages) ||
      []
  );

  function sendMessages(e: Event) {
    fileUploadedModal.value = false;
    if (props.selected === undefined || props.selected === null) return;
    if (!messageVal.value.length && !message.value.files.length) return;
    message.value.timestamp = new Date().toISOString();
    message.value.reciverId = personalList.value.find((pers) => {
      return pers.id === props.selected;
    })!.id;
    message.value.message = messageVal.value;
    sockets.emit("sendPrivateMessages", message.value);
    messageVal.value = "";
    message.value.message = "";
    message.value.files = [];
  }
  function renderMessage(msg: string, readed: boolean, id: number, senderId: number) {
    setTimeout(() => {
      __messages_wrp.value?.scrollBy(0, 999999999);
    });
    if (readed === false && senderId !== store.state.user.info.id) {
      sockets.emit("setReadedMessage", { messageId: id, senderId });
    }
    return msg;
  }
  function getParsedDateString(date: string) {
    if (new Date(date).toLocaleDateString() === new Date().toLocaleDateString()) return "Сегодня";
    else return new Date(date).toLocaleDateString("ru", { day: "2-digit", month: "long" });
  }

  function getDateString(date: string) {
    const str = new Date(new Date(date)).toLocaleDateString().split(".").reverse().join("-");
    return Date.parse(str);
  }

  function getDate(index: number) {
    if (index < 1) return false;
    const prev = getDateString(messages.value[index - 1].timestamp);
    const current = getDateString(messages.value[index].timestamp);
    if (current - prev > 0) return true;
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

  function contextOpen(e: MouseEvent) {
    topContext.value = e.pageY || e.clientY;
    leftContext.value = e.pageX || e.clientX;
    if (window.screen.availWidth - leftContext.value < 200) {
      leftContext.value = leftContext.value - 170;
    }
    showContext.value = true;
  }
  function contextClose(e: MouseEvent) {
    topContext.value = 0;
    leftContext.value = 0;
    showContext.value = false;
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

  function filesUpload(file: { filename: string; mimetype: string; size: number; url: string }) {
    message.value.files.push(file);
    fileUploadedModal.value = true;
  }

  onMounted(() => {
    if (selectedPers.value) store.commit("titles/SET_TITLE", `${selectedPers.value.lastName} ${selectedPers.value.firstName[0]}. ${selectedPers.value.surName[0]}.`);

    window.addEventListener("contextmenu", (event) => {
      if (showContext.value) {
        event.preventDefault();
      }
    });

    let count = 0;
    let interval = setInterval(() => {
      if (__messages_wrp.value) {
        if (count > 3) {
          clearInterval(interval);
        }
        __messages_wrp.value.scrollBy(0, 999999999);
        window.scrollBy(0, 999999999);
        count++;
      }
    }, 50);
  });
  onUpdated(() => {
    selectedPers.value;
  });
</script>
<template>
  <div class="messenger messenger__center" v-if="selected === null">
    <img :src="require(`@/share/assets/icons/messagesIcon.svg`)" />
    <p>{{ isPersNullText }}</p>
  </div>
  <div class="messenger" v-else>
    <div class="messenger__resiver" v-if="selectedPers && !mobile">
      <div class="messenger__resiver__avatar">
        <img v-if="selectedPers.user?.avatar" class="messenger__resiver__avatar__image" :src="selectedPers.user?.avatar" />
        <p v-else class="messenger__resiver__avatar__image" :class="selectedPers.class">
          {{ `${selectedPers.lastName[0]}${selectedPers.firstName[0]}` }}
        </p>
      </div>
      <div class="member__name">
        <p>{{ `${selectedPers.lastName} ${selectedPers.firstName} ${selectedPers.surName}` }}</p>
        <p>
          {{
            selectedPers.online
              ? "В сети"
              : selectedPers.lastSeen.length
              ? "Был(а) в сети " + new Date(selectedPers.lastSeen).toLocaleString("ru", { dateStyle: "short", timeStyle: "short" }).split(",").join(" ")
              : ""
          }}
        </p>
      </div>
    </div>
    <div class="messenger__resiver" v-else-if="!mobile">
      <p>&nbsp;</p>
    </div>
    <div class="messenger__messages__wrp" ref="__messages_wrp">
      <div class="messenger__messages">
        <div class="messages" v-for="(msg, index) in messages" :key="index" :class="msg.senderId === $store.state.user.info.id ? 'messenger__messages__own' : ''">
          <p v-if="getDate(index) || index === 0" class="messenger__messages__date">{{ getParsedDateString(msg.timestamp) }}</p>
          <div class="message-content" v-if="msg.message.length" v-on:click.right="contextOpen">
            <div>
              <p v-if="msg.message.length">
                {{ renderMessage(msg.message, msg.readed, msg.id, msg.senderId) }}
              </p>
              <span
                :class="{
                  msgDelivered: msg.delivered && !msg.readed && msg.senderId === $store.state.user.info.id,
                  msgReaded: msg.readed && msg.senderId === $store.state.user.info.id,
                }"
                >{{ new Date(msg.timestamp).toLocaleTimeString("ru", { timeStyle: "short" }) }}</span
              >
            </div>
          </div>
          <div v-if="msg.files.length > 0" class="messenger__messages__files" v-for="(link, i) in msg.files" :key="i">
            <div class="files-wrp">
              <p style="display: none">{{ renderMessage(msg.message, msg.readed, msg.id, msg.senderId) }}</p>
              <input type="button" @click="downloadFile(link.url, link.filename)" />
              <div
                :class="{
                  fileDelivered: msg.delivered && !msg.readed && msg.senderId === $store.state.user.info.id,
                  fileReaded: msg.readed && msg.senderId === $store.state.user.info.id,
                }"
              >
                <p>{{ link.filename.split(".")[0] }}</p>
                <p>{{ link.filename.split(".")[link.filename.split(".").length - 1].toUpperCase() }}, {{ humanFileSize(link.size) }}</p>
                <span
                  :class="{
                    msgDelivered: msg.delivered && !msg.readed && msg.senderId === $store.state.user.info.id,
                    msgReaded: msg.readed && msg.senderId === $store.state.user.info.id,
                  }"
                  >{{ new Date(msg.timestamp).toLocaleTimeString("ru", { timeStyle: "short" }) }}</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="messenger__actions">
      <form class="messenger__actions__form" @submit.prevent="sendMessages">
        <FileUploader :exctraClass="true" @uploaded="filesUpload" />
        <input type="text" placeholder="Написать сообщение" v-model="messageVal" />
        <input type="submit" value="" />
      </form>
    </div>
  </div>
  <fileUploadedList
    v-if="fileUploadedModal"
    :textVal="messageVal"
    :textBool="true"
    :files="message.files"
    @sendText="
      (text) => {
        messageVal = text;
      }
    "
    @sendFiles="
      (files) => {
        message.files = files;
      }
    "
    @sendMessage="sendMessages($event)"
    @close="fileUploadedModal = false"
    @addFiles="(file) => filesUpload(file)"
    @deleteFiles="(index) => message.files.splice(index, 1)"
  />
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
    .messenger__messages {
      padding-bottom: 3.5em !important;
      width: calc(100vw - 2em);
    }
    .messenger__actions {
      width: 100%;
      position: fixed;
      bottom: 0em;
      background-color: var(--secondary-background-color);
      &__form {
        padding: 0 0.5em;
        & label {
          width: 1.5em;
        }
        & label,
        input[type="submit"] {
          margin: 0.5em;
          width: 1.5em;
        }
      }
    }
    .messenger__messages__date {
      margin: 0;
      padding: 0.5em 0.5em;
      font-size: 0.9em;
      border-radius: 10em;
    }
  }
  @media screen and (min-width: 480px) {
    .messenger__messages__wrp {
      max-height: calc(100vh - 16.325em);
    }
    .messenger__actions {
      &__form {
        padding: 1em;
        & label {
          width: 1.5em;
        }
        & label,
        input[type="submit"] {
          margin: 0.5em;
          width: 2em;
        }
      }
    }
    .messenger__messages__date {
      padding: 0.5em 1em;
      font-size: 1.2em;
      border-radius: 10em;
    }
  }
  .messenger {
    height: 100%;
    flex-grow: 1;
    flex-basis: calc(70% - 1.5em);
    display: flex;
    flex-direction: column;
    // gap: 1em;
    border-left: 0.1em solid var(--fourth-border-color);
  }

  .messenger__resiver {
    padding: 1em;
    display: flex;
    gap: 1em;
    & p {
      margin: 0;
    }
  }

  .messenger__messages__wrp {
    display: flex;
    flex-wrap: wrap;
    flex-grow: 1;
    overflow-y: scroll;
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

  .messenger__messages {
    background-color: var(--background-color);
    position: relative;
    display: flex;
    flex-grow: 1;
    flex-direction: column;
    display: flex;
    justify-content: flex-end;
    gap: 1em;
    padding: 1em;
    & .messages {
      width: 100%;
      display: flex;
      flex-direction: column;
      flex-wrap: wrap;
      align-items: stretch;
      border-radius: 0.7em;
      position: relative;
      flex-wrap: wrap;
      word-break: break-word;
      & .message-content {
        display: flex;
        gap: 0.5em;
        flex-direction: column;
        & div {
          display: flex;
          max-width: 70%;
          min-width: fit-content;
          gap: 0.2em;
          flex-direction: column;
          background-color: var(--secondary-background-color);
          padding: 1em;
          border-radius: 0.7em;
          align-self: baseline;
          & p {
            margin: 0;
          }
          & span {
            display: inline-block;
            align-self: flex-end;
            color: var(--fourth-text-color) !important;
            font-size: 0.7em;
          }
        }
      }
    }
  }
  .member__name {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5em;
    word-wrap: break-word;
    & > p:nth-child(1) {
      font-weight: bold;
      color: var(--secondary-text-color);
    }
    & > p:nth-child(2) {
      max-width: 20em;
      color: var(--third-text-color);
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }
  }
  .messenger__messages__date {
    text-align: center;
    background-color: var(--button-background-button);
    align-self: center;
    color: var(--text-color);
  }

  .messenger__messages__own {
    & div {
      align-self: flex-end !important;
      & p {
        align-self: flex-end !important;
        color: var(--secondary-text-color) !important;
        & span {
          color: var(--fourth-text-color) !important;
        }
      }
    }
  }

  .messenger__messages__files {
    margin: 0.5em 0;
    & .files-wrp {
      border-radius: 0.7em;
      display: flex;
      flex-direction: row !important;
      background-color: var(--secondary-background-color);
      gap: 0.5em;
      padding: 1em;
      & div {
        display: flex;
        gap: 0.2em;
        align-self: center !important;
        flex-direction: column !important;
        & > p {
          text-overflow: ellipsis;
          overflow: hidden;
          align-self: flex-end !important;
          background-color: transparent !important;
          padding: 0;
          color: var(--secondary-text-color);
          margin: 0;
        }
        & span {
          display: inline-block;
          align-self: flex-end;
          color: var(--fourth-text-color) !important;
          font-size: 0.7em;
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

  .messenger__resiver__avatar {
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
      background-color: #707070;
      border-radius: 50%;
      color: var(--text-color);
    }
  }

  .messenger__actions {
    display: flex;
    justify-content: center;
    &__form {
      height: 3em;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 1em;
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
        flex-basis: 90%;
        cursor: text;
      }
    }
  }

  .delivered {
    background-image: url("@/share/assets/icons/deliveredIcon.svg");
    background-repeat: no-repeat;
    background-position: center center;
  }
  .readed {
    background-image: url("@/share/assets/icons/readed.svg");
    background-repeat: no-repeat;
    background-position: center center;
  }

  .msgDelivered {
    position: relative;
    width: 4em;
    &::after {
      position: absolute;
      content: "";
      width: 1.3em;
      aspect-ratio: 1/1;
      top: 50%;
      right: -0.5em;
      transform: translate(0, -50%);
      background-image: url("@/share/assets/icons/deliveredIcon.svg");
      background-repeat: no-repeat;
      background-position: center center;
    }
  }
  .msgReaded {
    position: relative;
    width: 4em;
    &::after {
      position: absolute;
      content: "";
      width: 1.3em;
      aspect-ratio: 1/1;
      top: 50%;
      right: -0.5em;
      transform: translate(0, -50%);
      background-image: url("@/share/assets/icons/readed.svg");
      background-repeat: no-repeat;
      background-position: center center;
    }
  }

  .newMessage {
    position: relative;
    &::after {
      content: "";
      position: absolute;
      width: 0.5em;
      aspect-ratio: 1/1;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: var(--weekend-color);
      border-radius: 50%;
    }
  }

  .messenger__center {
    display: grid;
    place-content: center;
    text-align: center;
    background-color: var(--background-color);
    & img {
      aspect-ratio: 1/1;
      width: 6em;
      place-self: center;
    }
    & p {
      width: 70%;
      place-self: center;
      margin: 0;
      font-size: 1.5em;
    }
  }
  .orange {
    background-color: #f79236 !important;
    color: var(--secondary-background-color) !important;
  }
  .grey {
    background-color: #738086 !important;
    color: var(--secondary-background-color) !important;
  }
  .black {
    background-color: #2f3c42 !important;
    color: var(--secondary-background-color) !important;
  }
  .red {
    background-color: #cd5322 !important;
    color: var(--secondary-background-color) !important;
  }
  .darkgray {
    background-color: #2f3c42 !important;
    color: var(--secondary-background-color) !important;
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
</style>
