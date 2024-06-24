<script lang="ts" setup>
  import { useStore } from "@/entities";
  import { sockets } from "@/main";
  import { computed, onMounted, ref } from "vue";
  import { ChatMessenger } from "@/widgets";

  const store = useStore();

  const selected = ref<number | null>(null);
  const emit = defineEmits(["selected"]);

  const personalList = computed(() =>
    store.state.personal.personalList
      .filter((pers) => {
        if (pers.user === undefined) return false;
        return pers.id !== store.state.user.info?.id;
      })
      .sort((x, y) => {
        const a =
          y.messages.findLast((e) => {
            return e;
          })?.timestamp || "0";
        const b =
          x.messages.findLast((e) => {
            return e;
          })?.timestamp || " 0";
        return new Date(b) > new Date(a) ? -1 : 1;
      })
  );

  function getMessages(id: number) {
    selected.value = id;
    emit("selected", selected.value);
    sockets.emit("getPrivateMessages", id);
  }

  function getLastMessage(message: iStore.SocketsMessages[]) {
    if (message.length === 0) return { message: `Нет сообщений`, delivered: null };
    const lastMessage = message[message.length - 1 < 0 ? 0 : message.length - 1];
    return {
      message: `${lastMessage.senderId === store.state.user.info.id && lastMessage.message ? "Вы: " : ""}${lastMessage.message}`,
      file: `${lastMessage.senderId === store.state.user.info.id && lastMessage.files.length > 0 ? "Вы: " : ""}${
        lastMessage.files.length > 0 ? lastMessage.files[lastMessage.files.length - 1].filename : ""
      }`,
      delivered: lastMessage.delivered,
      readed: lastMessage.readed,
      senderId: lastMessage.senderId,
      time: new Date(lastMessage.timestamp).toLocaleString("ru", { timeStyle: "short" }),
    };
  }
</script>

<template>
  <div class="chat__personal">
    <!-- <div class="chat__personal__search">
        <input type="text" placeholder="Поиск по имени" />
      </div> -->
    <div class="chat__personal__list">
      <div
        class="chat__personal__list__member"
        v-for="(person, index) in personalList"
        :key="person.id"
        @click="getMessages(person.id)"
        :class="{ 'selected-reciver': selected === person.id, online: person.online }"
      >
        <div class="chat__personal__list__member__avatar">
          <img v-if="person.user?.avatar" class="chat__personal__list__member__avatar__image" :src="person.user.avatar" />
          <p v-else class="chat__personal__list__member__avatar__image" :class="person.class">
            {{ `${person.lastName[0]}${person.firstName[0]}` }}
          </p>
        </div>
        <div class="chat__personal__list__member__name">
          <p>{{ `${person.lastName} ${person.firstName[0]}. ${person.surName[0]}.` }}</p>
          <p v-if="getLastMessage(person.messages).message && !getLastMessage(person.messages)?.file">
            {{ getLastMessage(person.messages).message }}
          </p>
          <p v-else-if="getLastMessage(person.messages)?.file">{{ getLastMessage(person.messages).file }}</p>
        </div>
        <div class="chat__personal__list__member__status">
          <p>{{ getLastMessage(person.messages).time }}</p>
          <p
            v-if="getLastMessage(person.messages).delivered !== null"
            :class="{
              delivered:
                getLastMessage(person.messages).delivered && !getLastMessage(person.messages).readed && getLastMessage(person.messages).senderId === $store.state.user.info.id,
              readed: getLastMessage(person.messages).readed && getLastMessage(person.messages).senderId === $store.state.user.info.id,
              newMessage: !getLastMessage(person.messages).readed && getLastMessage(person.messages).senderId !== $store.state.user.info.id,
            }"
          >
            &nbsp;
          </p>
          <p v-else>&nbsp;</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  @media screen and (max-width: 480px) {
    .chat__personal__list {
      width: calc(100vw) !important;
    }
    .chat__personal__list__member {
      gap: 0.5em;
    }
    .chat__personal__list__member__name {
      & > p:nth-child(1) {
        font-size: 0.9em;
      }
      & > p:nth-child(2) {
        font-size: 0.9em;
        max-width: 15em !important;
      }
    }
    .chat__personal__list__member__status {
      & > p:nth-child(1) {
        font-size: 0.9em;
      }
    }
    .chat__personal__list__member__avatar {
      & p,
      img {
        font-size: 1.1em;
        width: 2em;
        color: var(--text-color);
      }
    }
  }
  @media screen and (min-width: 480px) {
    .chat__personal {
      flex-basis: 30%;
    }
    .chat__personal__list__member {
      gap: 1em;
    }
    .chat__personal__list {
      max-height: calc(100vh - 9em);
      &::-webkit-scrollbar {
        width: 0.3em;
      }

      &::-webkit-scrollbar-thumb {
        background: var(--primary-color);
        border-radius: 0.5em;
      }

      &::-webkit-scrollbar-track {
        background-color: var(--background-color);
      }
    }
    .chat__personal__list__member__avatar {
      & p,
      img {
        font-size: 1.2em;
        width: 2em;
        color: var(--text-color);
      }
    }
  }
  .chat__personal {
    display: flex;
    flex-direction: column;
  }

  .chat__personal__search {
    display: flex;
    & input {
      flex-grow: 1;
      outline: none;
      display: block;
      border: none;
      background-color: transparent;
      border: 0.1em solid var(--fourth-border-color);
      border-radius: 0.7em;
      padding: 1em 1.5em;
    }
    & input:nth-child(1) {
      flex-basis: 25%;
      background-image: url("@/share/assets/icons/search.svg");
      background-repeat: no-repeat;
      background-position: 95% center;
      background-size: 5%;
    }
  }

  .chat__personal__list {
    width: 100%;
    display: flex;
    flex-direction: column;
    overflow: auto;
  }
  .chat__personal__list__member {
    position: relative;
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: 1em 1em;
    border-bottom: 0.1em solid var(--fourth-color);
    & p {
      margin: 0;
    }
  }
  .chat__personal__list__member:hover {
    background-color: var(--background-chat-hover-color);
  }
  .chat__personal__list__member__avatar {
    & p,
    img {
      display: flex;
      margin: 0;
      padding: 0;
      padding: 0.4em;

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
  .chat__personal__list__member__name {
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
  .chat__personal__list__member__status {
    display: flex;
    flex-direction: column;
    gap: 0.5em;
    & > p:nth-child(1) {
      color: var(--fourth-text-color);
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
</style>
