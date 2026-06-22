import { RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
    {   
        path: "/areaCliente/login",
        component: () => import("pages/LoginCliente.vue"),
    },

    {
        path: "/areaCliente",
        component: () => import("src/layouts/MainLayoutCliente.vue"),
        meta: {
            validaLoginCliente: true,
        },
        children: [
            {   
                path: "agendamentos",
                component: () => import("pages/AgendamentoCliente.vue"),
            },
        ],
    },

    {  
        path: "/login",
        component: () => import("pages/LoginUsuario.vue"),
    },

    {
        path: "/",
        component: () => import("src/layouts/MainLayout.vue"),
        meta: { 
            validaLoginUsuario: true,
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
                path: "indicadores",
                component: () => import("pages/Indicadores.vue"),
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
