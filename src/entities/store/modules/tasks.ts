import { doRequest } from "@/helpers";
import { map } from "@/helpers/tasksMap";
import { Module } from "vuex";

export const tasksState: Module<iStore.Tasks, iStore.RootState> = {
  namespaced: true,
  mutations: {
    SET_TASKS_OF_SELECTED_DAY(state, payload) {
      state.taskOfSelectedDay = {
        day: payload.day,
        tasks: payload.tasks || [],
      };
    },
    SET_COUNTS(state, payload) {
      state.counts = payload;
      if (Array.isArray(payload)) {
        const all = (payload as iStore.Counts[]).find((count) => count.priority === 1);
        if (!all) return;
        state.selected = all.count;
      }
    },
    SET_TASKS(state, payload) {
      state.allTasks = payload;
    },
    SET_SELECTED_TASKS_COUNT(state, payload) {
      state.selected = payload;
    },
    SET_REQUIRED_DATA(state, payload) {
      state.requiredData = payload;
    },
    SET_TASK(state, payload) {
      state.task = payload;
    },
  },
  actions: {
    GET_TASKS_OF_MONTH({ commit }, month) {
      return new Promise(function (resolve) {
        doRequest(`/tasks/get/month/${month}`, { method: "GET" })
          .then(({ response }) => resolve(response))
          .catch((error) => {
            commit("events/PUSH_MESSAGE", {
              id: undefined,
              message: error.message,
              type: "error",
            });
          });
      });
    },
    GET_ALL_INFO({ commit }) {
      return new Promise(function (resolve) {
        doRequest(`/tasks/stats`, { method: "GET" })
          .then(({ response }) => {
            const taskCounter: {
              title: string;
              count: number;
              icon: string;
              link: string;
              priority: number;
            }[] = [];
            const temp = Object.entries(response);
            for (let i = 0; i < temp.length; i++) {
              const val = map[temp[i][0] as keyof typeof map];
              val.count = temp[i][1] as number;
              taskCounter.push(val);
            }
            taskCounter.sort((a, b) => a.priority - b.priority);
            commit("SET_COUNTS", taskCounter);
            return resolve(true);
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
    GET_REQUIRED_DATA({ commit }) {
      return new Promise((resolve) => {
        doRequest("/tasks/get/data", { method: "GET" })
          .then(({ response }) => {
            commit("SET_REQUIRED_DATA", response);
            return resolve(true);
          })
          .catch((error) => {
            commit("events/PUSH_MESSAGE", {
              id: undefined,
              message: error.message,
              type: "error",
            });
          });
      }).catch((error) => {
        commit("events/PUSH_MESSAGE", {
          id: undefined,
          message: error.message,
          type: "error",
        });
      });
    },
    GET_ALL_TASKS({ commit }, payload: Record<string, string>) {
      return new Promise((resolve) => {
        const query: Record<string, string> = { offset: payload.offset, count: payload.count };
        if (payload.filter) query.filter = payload.filter;
        if (payload.sort) query.sort = payload.sort;
        if (payload.desc) query.desc = payload.desc;
        getTasks(query)
          .then(({ response }) => {
            commit("SET_TASKS", response);
            return resolve(true);
          })
          .catch((error) => {
            commit("events/PUSH_MESSAGE", {
              id: undefined,
              message: error.message,
              type: "error",
            });
          });
      }).catch((error) => {
        commit("events/PUSH_MESSAGE", {
          id: undefined,
          message: error.message,
          type: "error",
        });
      });
    },
    GET_TASK_BY_ID({ commit, state }, payload) {
      return new Promise((resolve) => {
        if (state.allTasks) state.allTasks.forEach((task) => (task.id === parseInt(payload) ? resolve(task) : undefined));
        doRequest(`/tasks/info/${payload}`, { method: "GET" })
          .then(({ response }) => {
            commit("SET_TASK", response);
            return resolve(true);
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
  getters: {
    GET_COUNTS(state) {
      return state.counts;
    },
    GET_TASK_OF_DAY(state) {
      return state.taskOfSelectedDay;
    },
    GET_ALL_TASKS(state) {
      return state.allTasks;
    },
  },
};

function getTasks(payload: Record<string, string>): Promise<{ response: iStore.Task[] }> {
  return new Promise(function (resolve) {
    doRequest(`/tasks/get?${new URLSearchParams(payload)}`, { method: "GET" }).then(({ response }) => {
      resolve({ response });
    });
  });
}
