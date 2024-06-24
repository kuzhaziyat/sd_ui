import { Module } from "vuex";

export const titleState: Module<{ title: string }, iStore.RootState> = {
  namespaced: true,
  state: {
    title: "",
  },
  mutations: {
    SET_TITLE(state, payload) {
      state.title = payload;
    },
  },
};
