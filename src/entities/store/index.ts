import { InjectionKey } from "vue";
import { createStore, useStore as baseUseStore, Store } from "vuex";
import { userState } from "./modules/auth";
import { titleState } from "./modules/title";
import { appState } from "./modules/app";
import { tasksState } from "./modules/tasks";
import { eventsState } from "./modules/events";
import { personalState } from "./modules/personal";
import { socketsState } from "./modules/sockets";
import { componentLoaderState } from "./modules/componentLoaderState";

export const key: InjectionKey<Store<iStore.RootState>> = Symbol();

export const store = createStore<iStore.RootState>({
  modules: {
    user: userState,
    titles: titleState,
    tasks: tasksState,
    events: eventsState,
    personal: personalState,
    sockets: socketsState,
    componentLoader: componentLoaderState,
    app: appState,
  },
});

export function useStore() {
  return baseUseStore(key);
}
