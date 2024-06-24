import { doRequest } from "@/helpers";
import { Module } from "vuex";

export const eventsState: Module<{ messages: iStore.iEvents[]; notifications: iStore.iNotifications[] }, iStore.RootState> = {
  namespaced: true,
  state: {
    messages: [],
    notifications: [],
  },
  mutations: {
    PUSH_MESSAGE(state, payload) {
      state.messages.push({ message: payload.message, type: payload.type, id: payload.id });
      setTimeout(() => {
        state.messages.splice(-1);
      }, 6000);
    },
    SUCCESS_ACTION(state, payload) {
      state.messages.push({ message: payload.message, type: "success" });
      setTimeout(() => {
        state.messages.splice(-1);
      }, 6000);
    },
    SET_NOTIFICATIONS(state, payload) {
      state.notifications = payload;
    },
    SET_NOTIFICATIONS_BY_ID(state, payload) {
      const index = state.notifications.findIndex((not) => not.id === payload.id);
      if (index === -1) state.notifications.push(payload);
      else state.notifications[index] = payload;
    },
  },
  actions: {
    GET_NOTIFICATIONS({ commit }): Promise<void> {
      return new Promise((resolve) => {
        doRequest("/personal/get/notifications", { method: "GET" })
          .then(({ response }) => {
            commit("SET_NOTIFICATIONS", response);
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
    GET_NOTIFICATIONS_BY_ID({ commit }, id: number): Promise<void> {
      return new Promise((resolve) => {
        doRequest(`/personal/get/notifications/${id}`, { method: "GET" })
          .then(({ response }) => {
            commit("SET_NOTIFICATIONS_BY_ID", response);
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
