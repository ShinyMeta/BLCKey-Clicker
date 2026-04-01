// Composables
import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    component: () => import("@/layouts/default/AppLayout.vue"),
    children: [
      {
        path: "",
        name: "BlckeyClicker",
        component: () => import("@/views/BLCKeyClickerPage.vue"),
      },
      {
        path: "/legacy",
        name: "OriginalSimulator",
        component: () => import("@/views/BLCSimulatorPage.vue"),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
