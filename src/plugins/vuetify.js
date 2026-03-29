/**
 * plugins/vuetify.js
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import "@mdi/font/css/materialdesignicons.css";
import '@fortawesome/fontawesome-free/css/all.css'
import { aliases as faAliases, fa } from 'vuetify/iconsets/fa'
import { aliases as mdiAliases, mdi } from 'vuetify/iconsets/mdi'
import "vuetify/styles";

// Composables
import { createVuetify } from "vuetify";

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  theme: {
    defaultTheme: "dark",
    options: { customProperties: true },
    variations: {
      colors: ["surface"],
      lighten: 2,
      darken: 2,
    },
    themes: {
      light: {
        colors: {
          primary: "#1867C0",
          secondary: "#5CBBF6",
        },
      },
    },
  },
  icons: {
    defaultSet: 'mdi',
    aliases: {
      ...mdiAliases,
      ...faAliases,
      // map plain `discord` to FontAwesome brands discord so `icon="discord"` works
      // Vuetify expects the fa icon value to include the fa set prefix and classes, e.g. 'fa:fab fa-discord'
      discord: 'fa:fab fa-discord',
    },
    sets: {
      fa,
      mdi,
    },
  },
});
