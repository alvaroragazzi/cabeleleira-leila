import { boot } from "quasar/wrappers";
import axios, { AxiosInstance } from "axios";
import { Cookies } from "quasar";

declare module "@vue/runtime-core" {
    interface ComponentCustomProperties {
        $axios: AxiosInstance;
        $api: AxiosInstance;
    }
}

const api = axios.create({ baseURL: "http://localhost:3000/api", withCredentials: true });

api.interceptors.request.use(config => {
    const csrf = Cookies.get("csrf");

    if (csrf) {
        config.headers["X-CSRF"] = csrf;
    }

    return config;
});

export default boot(({ app }) => {
    app.config.globalProperties.$axios = axios;

    app.config.globalProperties.$api = api;
});

export { api, axios };
