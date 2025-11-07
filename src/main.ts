import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import PrimeVue from "primevue/config";
import Aura from "@primeuix/themes/aura";
import "@fortawesome/fontawesome-free/css/all.css";

// PrimeIcons
import "primeicons/primeicons.css";
import DialogService from "primevue/dialogservice";
import ToastService from "primevue/toastservice";

// Routing
import router from "./router/index.ts";
import { createPinia } from "pinia";
import {Button, Dialog, InputText, Tooltip} from "primevue";

//Auth0
import { createAuth0 } from "@auth0/auth0-vue";

const app = createApp(App);
app
  .use(PrimeVue, {
    theme: {
      preset: Aura,
      options: {
        prefix: "p",
        cssLayer: false,
        darkModeSelector: "manual",
      },
    },
  })
  .use(DialogService)
  .use(ToastService)
  .use(router)
  .use(createPinia())
  .use(createAuth0({
      domain: import.meta.env.VITE_AUTH0_DOMAIN,
      clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
      authorizationParams: {
          redirect_uri: window.location.origin
      }
  }))

app.component("pv-dialog", Dialog);
app.component("pv-text",InputText)
app.component("pv-button",Button)
app.directive('tooltip', Tooltip);
app.mount("#app");
