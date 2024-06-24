import { createApp } from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import { router, store, key } from "@/entities";
import { io } from "socket.io-client";
import { FileUploader } from "@/featues";
// import UIElements from "@/share/UI";
export const sockets = io(process.env.VUE_APP_API_URL!, {
  withCredentials: true,
  autoConnect: false,
  transports: ["websocket", "polling"],
});
const app = createApp(App);

// app.config.errorHandler = function (err, vm, info) {
//   console.log(`Error: ${(err as any).toString()}\nInfo: ${info}`);
// };

// [...UIElements, Loader, FileUploader].forEach((comp) => {
//   const filename = comp.__file;
//   if (!filename) return;
//   const name = filename.split("/");
//   const elem = name[name.length - 1].toLocaleLowerCase();
//   app.component(elem.split(".")[0], comp);
// });

app.use(router);
app.use(store, key);
app.mount("#app");
