import { RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
    {  
        path: "/login",
        component: () => import("pages/Login.vue"),
    },

    {
        path: "/",
        component: () => import("src/layouts/MainLayout.vue"),
        meta: { 
            requiresAuth: true,
        },
        children: [
            {   
                path: "",
                component: () => import("pages/PaginaPrincipal.vue"),
            },
            {   
                path: "clientes",
                component: () => import("pages/Clientes.vue"),
            },
            {   
                path: "servicos",
                component: () => import("pages/Servicos.vue"),
            },
            {   
                path: "usuarios",
                component: () => import("pages/Usuarios.vue"),
            },
            {   
                path: "agendas",
                component: () => import("pages/Agendas.vue"),
            },
            {   
                path: "consultarAgendamentos",
                component: () => import("pages/ConsultarAgendamentos.vue"),
            },
        ],
    },
];

export default routes;
