import { createRouter, createWebHistory } from "vue-router";
import LoginPage from "@/iam/interfaces/pages/login-page.component.vue";
import RegisterPage from "@/iam/interfaces/pages/register-page.component.vue";
import AuthCallback from "@/iam/interfaces/pages/auth-callback.component.vue";
import MainLayoutPage from "@/shared/pages/main-layout-page.vue";
import DashboardPage from "@/analytics/interfaces/pages/dashboard.component.vue";
import ChoosePlanPage from "@/payment/interfaces/pages/choose-plan-page.component.vue";

import PaymentSuccededPage from "../payment/interfaces/pages/payment-succeded-page.component.vue";
import ConsultingPageComponent from "../crm/interfaces/pages/consulting-page.component.vue";
import OrderPlanningPage from "../planning/interfaces/pages/order-planning.component.vue";
import InstallationPreferenceSelectionPage from "../planning/interfaces/pages/installation-preference-selection.component.vue";
import OrderPaymentPage from "../planning/interfaces/pages/order-payment-page.component.vue";
import ProfileInformationPage from "../profile/interfaces/pages/profile-information-page.component.vue";
import ProfileInformationPageComponent from "../profile/interfaces/pages/profile-information-page.component.vue";
import PlantInfoPageComponent from "../monitoring/interfaces/pages/plant-info-page.component.vue";
import OrderPaymentSuccededPage from "../planning/interfaces/pages/order-payment-succeded.component.vue";


const isAuthenticated = () => {
  const auth0User = localStorage.getItem('auth0_user');
  if (auth0User) {
    try {
      const parsed = JSON.parse(auth0User);
      return parsed.role && parsed.role !== 'GUEST';
    } catch (e) {
      return false;
    }
  }

  const token = localStorage.getItem('token');
  return !!token;
};

const routes = [
  {
    path: '/',
    redirect: () => {
      return isAuthenticated() ? '/home' : '/login';
    }
  },
  { path: "/login", component: LoginPage },
  { path: "/register", component: RegisterPage },
  { path: "/callback", component: AuthCallback },
  { path: "/choose-plan", component: ChoosePlanPage },
  { path: "/payment-succeded", component: PaymentSuccededPage },
  { path: "/payment-order-succeded", component: OrderPaymentSuccededPage },
  {
    path: "/",
    component: MainLayoutPage,
    children: [
      {
        path: "/home",
        name: "Dashboard",
        component: DashboardPage,
        props: true,
      },
      {
        path: "/installation",
        name: "Installation",
        component: InstallationPreferenceSelectionPage,
        props: true,
      },
      {
        path: "/order-planning",
        name: "Schedule Installation",
        component: OrderPlanningPage,
        props: true,
      },
      {
        path: "/order-payment",
        name: "Order Payment",
        component: OrderPaymentPage,
        props: true,
      },
      {
        path: "/profile",
        name: "Profile",
        component: ProfileInformationPage,
        props: true,
      },
      {
        path: "/consulting",
        name: "Consulting",
        component: ConsultingPageComponent, // Asegúrate de que esta sea la página correcta
        props: true,
      },
      {
        path: "/profile",
        name: "Profile Page",
        component: ProfileInformationPageComponent,
        props: true,
      },
      {
        path: "/info-panel",
        name: "Information Panel",
        component: PlantInfoPageComponent,
        props: true,
      }
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});


export default router;