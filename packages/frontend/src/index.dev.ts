import PrimeVue from "primevue/config";
import { CaidoDark } from "@caido/primevue";

import "./styles/style.css";
import {createApp} from "vue";

import App from "./views/App.vue";


const app = createApp(App);
app.use(PrimeVue, {
  theme: {
    preset: CaidoDark
  },
});

app.mount("#app");

