<script lang="ts" setup>
  import { PropType } from "vue";

  const props = defineProps({
    task: {
      type: Object as PropType<iStore.Task>,
      required: true,
    },
  });

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
</script>

<template>
  <div class="files">
    <div class="nullTask" v-if="!task.info.files.length">
      <h1>В задаче нет вложений.</h1>
      <img :src="require(`@/share/assets/icons/NullFilesTask.svg`)" alt="logo" />
    </div>
    <div class="files-wrp" v-else>
      <div v-if="task.info.files && task.info.files.length" v-for="(file, index) in task.info.files">
        <p v-if="index === 0" class="date-files">{{ getParsedDateString(task.info.createdAt) }}</p>
        <div>
          <input type="button" @click="downloadFile(file.url, file.filename)" />
          <p>{{ file.filename }}</p>
          <p>{{ humanFileSize(file.size) }} {{ new Date(task.info.createdAt).toLocaleTimeString("ru", { timeStyle: "short" }) }}</p>
        </div>
      </div>
      <div v-for="(msg, index) in task.info.log.filter((msg) => msg.type === 'message' && msg.files && msg.files.length > 0)">
        <p v-if="getDate(index)" class="date-files">{{ getParsedDateString(msg.timestamp) }}</p>
        <div v-if="msg.files.length" v-for="file in msg.files">
          <input type="button" @click="downloadFile(file.url, file.filename)" />
          <p>{{ file.filename }}</p>
          <p>{{ humanFileSize(file.size) }} {{ new Date(msg.timestamp).toLocaleTimeString("ru", { timeStyle: "short" }) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  @media screen and (max-width: 480px) {
    .task__right {
      width: 100%;
    }
  }
  @media screen and (min-width: 480px) {
    .files {
      padding: 1em;
      max-height: calc(100vh - 12.3em);
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
  .files {
    display: flex;
    flex-wrap: wrap;
    flex-grow: 1;

    .files-wrp {
      background-color: var(--background-color);
      position: relative;
      display: flex;
      flex-grow: 1;
      flex-direction: column;
      display: flex;
      padding: 1em;
      gap: 1em;
      & div {
        display: flex;
        flex-direction: column;
        gap: 1em;
        & .date-files {
          margin: 0;
          font-size: 1.3em;
          font-weight: bold;
        }
        & div {
          display: flex;
          flex-direction: row;
          padding: 0.5em;
          background-color: var(--secondary-background-color);
          gap: 0.5em;
          border-radius: 0.7em;
          justify-content: space-between;
          align-items: center;
          & p {
            text-overflow: ellipsis;
            overflow: hidden;
            margin: 0;
            width: 50%;
          }

          & p:last-child {
            text-align: end;
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
</style>
