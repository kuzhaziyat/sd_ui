import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Home",
    meta: { layout: "main", auth: true },
    component: () => import(/* webpackChunkName: "HomeView" */ "@/views/HomeView.vue"),
  },
  {
    path: "/calendar",
    name: "CalendarMobile",
    meta: { layout: "main", auth: true },
    component: () => import(/* webpackChunkName: "HomeView" */ "@/views/CalendarMobile.vue"),
  },
  {
    path: "/requests",
    name: "Requests",
    redirect: "/requests/tasks",
    meta: { layout: "main", auth: true },
    children: [
      {
        path: "tasks",
        name: "Tasks",
        children: [
          {
            path: "",
            name: "TaskList",
            component: () => import(/* webpackChunkName: "RequestsTaskList" */ "@/views/childrens/Requests/childrens/TaskList.vue"),
          },
          {
            path: "info/:id",
            name: "TaskInfo",
            component: () => import(/* webpackChunkName: "RequestsTaskInfo" */ "@/views/childrens/Requests/childrens/TaskInfo.vue"),
          },
          {
            path: "create",
            name: "TaskCreate",
            component: () => import(/* webpackChunkName: "RequestsTaskInfo" */ "@/widgets/modalWidgets/modalMain/CreateTask/CreateTask.vue"),
          },
        ],
        component: () => import(/* webpackChunkName: "RequestsTasks" */ "@/views/childrens/Requests/RequestsTasks.vue"),
      },
    ],
    component: () => import(/* webpackChunkName: "RequestsView" */ "@/views/RequestsView.vue"),
  },
  {
    path: "/chat",
    name: "Chat",
    meta: { layout: "main", auth: true },
    component: () => import(/* webpackChunkName: "ChatView" */ "@/views/ChatView.vue"),
  },
  {
    path: "/members",
    name: "Members",
    meta: { layout: "main", auth: true },
    component: () => import(/* webpackChunkName: "MembersView" */ "@/views/MembersView.vue"),
  },
  {
    path: "/members/:index",
    name: "MembersCard",
    meta: { layout: "main", auth: true },
    component: () => import(/* webpackChunkName: "MembersView" */ "@/views/MemberCardView.vue"),
  },
  {
    path: "/settings",
    name: "Settings",
    meta: { layout: "main", auth: true },
    component: () => import(/* webpackChunkName: "SettingsView" */ "@/views/SettingsView.vue"),
  },
  {
    path: "/settings/:id",
    name: "SettingsInfo",
    meta: { layout: "main", auth: true },
    component: () => import(/* webpackChunkName: "SettingsView" */ "@/views/DepartmentEditView.vue"),
  },
  {
    path: "/login",
    name: "Login",
    meta: { layout: "login", auth: false },
    component: () => import(/* webpackChunkName: "LoginView" */ "@/views/LoginView.vue"),
  },
  {
    path: "/invite/:guid",
    name: "Invite",
    meta: { layout: "login", auth: false },
    component: () => import(/* webpackChunkName: "InviteView" */ "@/views/InviteView.vue"),
  },
  {
    path: "/register",
    name: "Register",
    redirect: "/register/org",
    meta: { layout: "login", auth: false },
    children: [
      {
        path: "org",
        name: "RegOrganization",
        component: () => import(/* webpackChunkName: "RegOrganization" */ "@/views/childrens/Register/RegisterOrgView.vue"),
      },
      {
        path: "user",
        name: "RegUser",
        component: () => import(/* webpackChunkName: "RegOrganization" */ "@/views/childrens/Register/RegisterUserView.vue"),
      },
    ],
    component: () => import(/* webpackChunkName: "Register" */ "@/views/RegisterView.vue"),
  },
  {
    path: "/:catchAll(.*)",
    name: "NotFoundView",
    meta: { layout: "main", auth: true },
    component: () => import(/* webpackChunkName: "NotFoundView" */ "@/views/NotFoundView.vue"),
  },
];

export const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const auth = await fetch(`${process.env.VUE_APP_API_URL}/auth/state`, {
    method: "GET",
    credentials: "include",
  });
  if (to.meta.auth && !auth.ok) {
    next({ name: "Login" });
  } else if (auth.ok && to.path === "/login") {
    next({ name: "Home" });
  } else {
    next();
  }
});
