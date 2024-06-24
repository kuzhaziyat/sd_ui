import { Module } from "vuex";

export const userState: Module<iStore.User, iStore.RootState> = {
  namespaced: true,
  mutations: {
    SET_USER(state, payload) {
      payload.isHead = false;
      payload.isAdmin = false;
      payload.isVice = false;
      payload.isDepHead = false;
      for (let i = 0; i < payload.roles.length; i++) {
        if (["Руководитель"].indexOf(payload.roles[i].name) !== -1) payload.isHead = true;
        if (["Заместитель"].indexOf(payload.roles[i].name) !== -1) payload.isVice = true;
        if (["Начальник отдела"].indexOf(payload.roles[i].name) !== -1) payload.isDepHead = true;
        if (["Администратор"].indexOf(payload.roles[i].name) !== -1) payload.isAdmin = true;
        if (["Кадровая служба"].indexOf(payload.roles[i].name) !== -1) payload.isManager = true;
      }
      state.info = payload;
    },
  },
  getters: {
    GET_TASK_RIGHT(state) {
      for (let i = 0; i < state.info.roles.length; i++) {
        if (["Начальник отдела", "Заместитель", "Руководитель"].indexOf(state.info.roles[i].name) !== -1) return true;
      }
    },
  },
};
