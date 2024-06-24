import { Module } from "vuex";

export const socketsState: Module<{ messages: iStore.SocketsMessages[] }, iStore.RootState> = {
  namespaced: true,
  state: {
    messages: [],
  },
  mutations: {
    SET_PRIVATE_MESSAGES(state, payload) {
      if (Array.isArray(payload) && payload.length) {
        state.messages = payload;
      }
    },
  },
};
