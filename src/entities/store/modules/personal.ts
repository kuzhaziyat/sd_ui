import { doRequest } from "@/helpers";
import { Module } from "vuex";

export const personalState: Module<
  {
    personalList: iStore.Personal[];
    id: number;
    records: { id: number; type: string }[];
    messages: number;
    departments: iStore.Departments[];
    positions: iStore.Positions[];
    roles: { id: number; name: string; descriptions: string }[];
  },
  iStore.RootState
> = {
  namespaced: true,
  state: {
    personalList: [],
    id: 0,
    messages: 0,
    records: [],
    departments: [],
    positions: [],
    roles: [],
  },
  mutations: {
    SET_PRIVATE_MESSAGE(state, payload) {
      for (let a = 0; a < state.personalList.length; a++) {
        const pers = state.personalList[a].id;
        const reciver = payload.reciverId;
        const sender = payload.senderId;
        if ((reciver === pers && sender === state.id) || (reciver === state.id && sender === pers)) state.personalList[a].messages.push(payload);
      }
    },
    SET_ID(state, payload) {
      state.id = payload;
    },
    SET_ONLINE(state, payload) {
      if (Array.isArray(payload)) {
        for (let i = 0; i < payload.length; i++) {
          for (let a = 0; a < state.personalList.length; a++) {
            if (state.personalList[a].id === payload[i].id) {
              state.personalList[a].online = payload[i].status;
              state.personalList[a].lastSeen = payload[i].timestamp;
            }
          }
        }
      } else {
        for (let i = 0; i < state.personalList.length; i++) {
          if (state.personalList[i].id === payload) {
            state.personalList[i].online = true;
            return;
          }
        }
      }
    },
    SET_OFFLINE(state, payload) {
      for (let i = 0; i < state.personalList.length; i++) {
        if (state.personalList[i].id === payload.personalId) {
          state.personalList[i].online = false;
          state.personalList[i].lastSeen = payload.lastSeen;
          return;
        }
      }
    },
    SET_MESSAGE_TO_READED(state, payload) {
      for (let i = 0; i < state.personalList.length; i++) {
        if (state.personalList[i].id === payload.senderId || state.id === payload.senderId) {
          for (let a = 0; a < state.personalList[i].messages.length; a++) {
            if (state.personalList[i].messages[a].id === payload.messageId) {
              state.personalList[i].messages[a].readed = true;
              return;
            }
          }
        }
      }
    },
    SET_PRIVATE_MESSAGES(state, payload: iStore.SocketsMessages[]) {
      if (Array.isArray(payload)) {
        for (let a = 0; a < state.personalList.length; a++) {
          state.personalList[a].messages = [];
          const pers = state.personalList[a].id;
          for (let i = 0; i < payload.length; i++) {
            const reciver = payload[i].reciverId;
            const sender = payload[i].senderId;
            if ((reciver === pers && sender === state.id) || (reciver === state.id && sender === pers)) state.personalList[a].messages.push(payload[i]);
          }
        }
      }
    },
    SET_PERSONAL_LIST(state, payload) {
      if (Array.isArray(payload)) {
        for (let i = 0; i < payload.length; i++) {
          const randomClassMap = {
            1: "orange",
            2: "grey",
            3: "black",
            4: "red",
            5: "darkgray",
          };
          payload[i].class = randomClassMap[Math.floor(Math.random() * 6) as keyof typeof randomClassMap];
          payload[i].messages = [];
          payload[i].online = false;
          payload[i].lastSeen = "";
        }
      }
      state.personalList = payload;
    },
    SET_DATA(state, payload) {
      state.departments = payload.departments;
      state.positions = payload.positions;
      state.roles = payload.roles;
      state.records = payload.records;
    },
  },
  actions: {
    GET_PERSONAL_LIST({ commit }): Promise<void> {
      return new Promise((resolve) => {
        doRequest("/personal/get/list", { method: "GET" })
          .then(({ response }) => {
            commit("SET_PERSONAL_LIST", response);
            resolve();
          })
          .catch((error) => {
            commit("events/PUSH_MESSAGE", {
              id: undefined,
              message: error.message,
              type: "error",
            });
          });
      });
    },
    GET_REQUIRED_DATA({ commit }): Promise<void> {
      return new Promise((resolve) => {
        doRequest("/personal/get/data", { method: "GET" })
          .then(({ response }) => {
            commit("SET_DATA", response);
            resolve();
          })
          .catch((error) => {
            commit("events/PUSH_MESSAGE", {
              id: undefined,
              message: error.message,
              type: "error",
            });
          });
      });
    },
  },
};
