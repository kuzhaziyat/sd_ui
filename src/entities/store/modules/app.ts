import { Module } from "vuex";

export const appState: Module<{ mobile: boolean; mobileMenu: boolean; returnMobile: boolean; stateTask: string }, iStore.RootState> = {
  namespaced: true,
  state: {
    mobile: false,
    mobileMenu: false,
    returnMobile: false,
    stateTask: "",
  },
  mutations: {
    CHANGE_STATE_MENU(state, payload) {
      state.mobileMenu = payload;
    },
    CHANGE_STATE_MOBILE(state, payload) {
      state.mobile = payload;
    },
    CHANGE_STATE_RETURN(state, payload) {
      state.returnMobile = payload;
    },
    CHANGE_STATE_TASK(state, payload) {
      state.stateTask = payload;
    },
  },
};
