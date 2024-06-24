import "vue-router";
export {};

declare module "vue-router" {
  interface RouteMeta {
    layout: "main" | "login";
    auth: boolean;
  }
}
