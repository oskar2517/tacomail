import { addMessages, init, getLocaleFromNavigator } from "svelte-i18n";

import langEn from "../i18n/en.json";
import langDe from "../i18n/de.json";

addMessages("en", langEn);
addMessages("de", langDe);

init({
    fallbackLocale: "en",
    initialLocale: localStorage.getItem("locale") || getLocaleFromNavigator(),
});