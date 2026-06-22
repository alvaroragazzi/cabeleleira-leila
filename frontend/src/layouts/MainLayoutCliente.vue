<template>
    <q-layout view="hHh Lpr ff">
        <q-header class="bg-white text-dark">
            <q-toolbar>
                <q-btn
                    flat
                    dense
                    round
                    icon="menu"
                    @click="drawerOpen = !drawerOpen"
                    class="lt-md"
                />

                <q-toolbar-title>
                    <q-img width="50px" :src="logoLeila"/>
                </q-toolbar-title>
            </q-toolbar>
        </q-header>

        <q-drawer
            v-model="drawerOpen"
            show-if-above
            bordered
            :width="72"
            class="modern-drawer"
        >
            <div
                class="drawer-panel"
                :class="{ 'is-expanded': !miniState }"
                @mouseenter="miniState = false"
                @mouseleave="miniState = true"
            >
                <div class="drawer-header">
                    <div class="drawer-avatar-box">
                        <q-avatar size="40px" color="primary" text-color="white">
                            {{ iniciaisNome(dadosCliente?.nm_cliente) }}
                        </q-avatar>
                    </div>

                    <div class="drawer-brand">
                        <div class="brand-title">{{ dadosCliente?.nm_cliente }}</div>
                        <div class="brand-subtitle">{{ activeItem }}</div>
                    </div>

                    <q-space/>

                    <g-btn class="drawer-brand" dense flat icon="LogOut" @click="logout"/>
                </div>

                <q-separator/>

                <q-list class="drawer-menu">
                    <q-item
                        v-for="item in menuItems"
                        :key="item.label"
                        clickable
                        v-ripple
                        class="drawer-item"
                        :active="activeItem === item.label"
                        active-class="active-menu-item"
                        @click="activeItem = item.label"
                        :to="item.to"
                    >
                        <div class="drawer-icon-box">
                            <g-icon :name="item.icon"/>
                        </div>

                        <q-item-section class="drawer-label">
                            <q-item-label>
                                {{ item.label }}
                            </q-item-label>
                        </q-item-section>

                        <q-tooltip
                            v-if="miniState"
                            anchor="center right"
                            self="center left"
                            :offset="[12, 0]"
                        >
                            {{ item.label }}
                        </q-tooltip>
                    </q-item>
                </q-list>
            </div>
        </q-drawer>

        <q-page-container>
            <q-page padding>
                <router-view/>
            </q-page>
        </q-page-container>
    </q-layout>
</template>

<script setup>
import { ref } from "vue";
import { useQuasar } from "quasar";
import { api } from "boot/axios";
import { useRouter } from "vue-router";

import logoLeila from "assets/logo_leila.svg";

import iniciaisNome from "src/functions/iniciaisNome";

const $q = useQuasar();
const $router = useRouter();

const dadosCliente = $q.localStorage.getItem("dadosCliente");
const drawerOpen = ref(true);
const miniState = ref(true);
const activeItem = ref("Agendamentos");

const menuItems = [
    {
        label: "Agendamentos",
        icon: "CalendarCheck",
        to: "/areaCliente/agendamentos",
    },
]

const logout = () => {
    $q.localStorage.removeItem("dadosCliente");
    
    $q.loading.show();

    api.post("/auth/logoutCliente").then(() => {
        $router.push("/areaCliente/login");
    }).finally(() => $q.loading.hide());
}
</script>

<style scoped>
.modern-drawer {
    background: transparent;
    overflow: visible !important;
}

.modern-drawer :deep(.q-drawer__content) {
    overflow: visible !important;
    background: transparent;
}

.drawer-panel {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;

    width: 72px;
    background: #ffffff;
    color: #1f2937;

    overflow: hidden;
    z-index: 10;

    border-right: 1px solid rgba(0, 0, 0, 0.12);

    transition:
        width 0.22s ease,
        box-shadow 0.22s ease;
}

.drawer-panel.is-expanded {
    width: 260px;
    box-shadow: 8px 0 24px rgba(0, 0, 0, 0.08);
}

.drawer-header {
    height: 72px;
    display: flex;
    align-items: center;
    padding: 0 10px;
    overflow: hidden;
}

.drawer-avatar-box {
    width: 52px;
    min-width: 52px;
    max-width: 52px;
    height: 72px;

    display: flex;
    align-items: center;
    justify-content: center;

    flex: 0 0 52px;
}

.drawer-brand {
    padding-left: 12px;
    white-space: nowrap;
    overflow: hidden;

    opacity: 0;
    visibility: hidden;
    transform: translateX(-6px);

    transition:
        opacity 0.16s ease,
        visibility 0.16s ease,
        transform 0.16s ease;
}

.drawer-panel.is-expanded .drawer-brand {
    opacity: 1;
    visibility: visible;
    transform: translateX(0);
}

.brand-title {
    font-size: 15px;
    font-weight: 700;
    line-height: 1.2;
}

.brand-subtitle {
    font-size: 12px;
    color: #6b7280;
    margin-top: 2px;
}

.drawer-menu {
    padding: 12px 0;
}

.drawer-item {
    width: calc(100% - 20px);
    height: 46px;
    min-height: 46px;

    margin: 6px 10px;
    padding: 0 !important;

    border-radius: 14px;

    display: flex;
    align-items: center;

    overflow: hidden;

    transition:
        background 0.2s ease,
        color 0.2s ease;
}

.drawer-item:hover {
    background: #f3f4f6;
}

.drawer-icon-box {
    width: 52px;
    min-width: 52px;
    max-width: 52px;
    height: 46px;

    display: flex;
    align-items: center;
    justify-content: center;

    flex: 0 0 52px;
}

.drawer-icon-box .q-icon {
    flex-shrink: 0;
}

.drawer-label {
    min-width: 0;
    padding-left: 0;
    white-space: nowrap;

    opacity: 0;
    visibility: hidden;
    transform: translateX(-6px);

    transition:
        opacity 0.16s ease,
        visibility 0.16s ease,
        transform 0.16s ease;
}

.drawer-panel.is-expanded .drawer-label {
    opacity: 1;
    visibility: visible;
    transform: translateX(0);
}

.active-menu-item {
    background: #eef2ff;
    color: #4f46e5;
    font-weight: 600;
}

.drawer-footer {
    position: absolute;
    bottom: 16px;
    left: 0;
    right: 0;
}
</style>