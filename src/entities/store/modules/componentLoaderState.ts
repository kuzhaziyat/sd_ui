import { Module } from "vuex";

export const componentLoaderState: Module<{ status: boolean }, iStore.RootState> = {
  namespaced: true,
  state: {
    status: false,
  },
  mutations: {
    TOGGLE_STATE(state) {
      state.status = !state.status;
    },
  },
};
