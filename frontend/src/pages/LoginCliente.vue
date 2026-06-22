<template>
    <q-layout class="login-shell">
        <q-page-container>
            <q-page class="login-page row no-wrap">
                <div class="col bg-primary flex flex-center gt-xs image-side relative-position">
                    <div class="image-side__overlay absolute-full" />

                    <div class="image-side__content q-pa-xl text-white">
                        <div class="text-overline text-weight-medium opacity-80">Leila Salão de Beleza</div>
                        <div class="text-h3 text-weight-bold q-mt-sm">Seu atendimento começa aqui.</div>
                        <div class="text-body1 q-mt-md image-side__subtitle">
                            Uma experiência elegante para acessar sua agenda, consultar horários e acompanhar seus agendamentos.
                        </div>

                        <div class="row q-gutter-sm q-mt-lg">
                            <q-badge rounded color="white" text-color="primary" class="text-weight-medium q-px-md q-py-sm">
                                Agenda online
                            </q-badge>
                            <q-badge rounded color="white" text-color="primary" class="text-weight-medium q-px-md q-py-sm">
                                Atendimento premium
                            </q-badge>
                        </div>
                    </div>
                </div>

                <div class="col-12 col-sm-7 col-md-5 col-lg-4 flex flex-center login-form-side q-pa-md q-pa-lg-xl">
                    <q-card flat bordered class="login-card">
                        <q-card-section class="q-pa-lg">
                            <div class="row items-center q-gutter-md q-mb-lg">
                                <q-avatar size="56px" class="login-logo-wrap">
                                    <q-img
                                        :src="logoLeila"
                                        fit="contain"
                                        class="login-logo"
                                    />
                                </q-avatar>

                                <div>
                                    <div class="text-overline text-primary text-weight-medium">Área do cliente</div>
                                    <div class="text-h5 text-weight-bold">Bem-vindo(a) de volta</div>
                                </div>
                            </div>

                            <div class="text-body2 text-grey-7 q-mb-lg">
                                Entre para acessar sua agenda e acompanhar seus agendamentos com praticidade.
                            </div>

                            <q-form @submit.prevent="login">
                                <div class="q-gutter-md">
                                    <g-input
                                        label="Celular/Telefone"
                                        type="number"
                                        v-model="dados.ds_telefone"
                                        :disable="isLoading"
                                        @update:model-value="exibirRestoCadastro = false"
                                        obrigatorio
                                        hide-bottom-space
                                    />

                                    <div v-if="exibirRestoCadastro">
                                        <div>Não encontramos seu cadastro. Por favor, preencha os dados abaixo:</div>
                                        <g-input
                                            label="Nome"
                                            v-model="dados.nm_cliente"
                                            :disable="isLoading"
                                            obrigatorio
                                        />

                                        <g-input
                                            label="E-mail"
                                            type="email"
                                            v-model="dados.ds_email"
                                            :disable="isLoading"
                                            obrigatorio
                                        />
                                    </div>
                                </div>

                                <g-btn
                                    color="primary"
                                    icon="LogIn"
                                    text-color="white"
                                    label="Entrar"
                                    class="full-width q-mt-lg login-button"
                                    type="submit"
                                />
                            </q-form>

                            <div class="q-mt-lg login-note text-center text-grey-6 text-caption">
                                Leila Salão de Beleza · acesso seguro para clientes.
                            </div>
                        </q-card-section>
                    </q-card>
                </div>
            </q-page>
        </q-page-container>
    </q-layout>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { api } from "boot/axios";

import logoLeila from "assets/logo_leila.svg";

const exibirRestoCadastro = ref(false);
const isLoading = ref(false);

const dados = ref({});

const $router = useRouter();

const login = () => {
    isLoading.value = true;

    api.post("/auth/loginCliente", dados.value).then(res => {
        $router.push("/areaCliente/agendamentos");
    }).catch(err => {
        if (err.response?.status == 404) {
            exibirRestoCadastro.value = true;
        }
    }).finally(() => {
        isLoading.value = false;
    });
}

</script>

<style scoped>
.login-shell {
    background:
        radial-gradient(circle at top left, rgba(255, 255, 255, 0.14), transparent 28%),
        linear-gradient(135deg, #f6efe7 0%, #f8f5f1 34%, #efe7df 100%);
}

.login-page {
    height: 100dvh;
    overflow: hidden;
}

.image-side {
    height: 100%;
    overflow: hidden;
}

.login-wallpaper {
    filter: saturate(1.05) contrast(1.03);
}

.image-side__overlay {
    background:
        linear-gradient(135deg, rgba(27, 19, 16, 0.62), rgba(111, 76, 63, 0.22)),
        radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.1), transparent 25%);
}

.image-side__content {
    max-width: 560px;
    z-index: 1;
}

.image-side__subtitle {
    max-width: 440px;
    line-height: 1.7;
}

.login-form-side {
    position: relative;
}

.login-form-side::before {
    content: "";
    position: absolute;
    inset: 24px;
    border-radius: 28px;
    background: rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(16px);
    pointer-events: none;
}

.login-card {
    width: min(100%, 430px);
    border-radius: 28px;
    overflow: hidden;
    position: relative;
    z-index: 1;
    box-shadow: 0 24px 70px rgba(31, 28, 26, 0.12);
    background: rgba(255, 255, 255, 0.82);
    backdrop-filter: blur(18px);
}

.login-logo-wrap {
    background: linear-gradient(135deg, rgba(246, 239, 231, 0.95), rgba(255, 255, 255, 0.92));
    border: 1px solid rgba(111, 76, 63, 0.12);
}

.login-logo {
    width: 34px;
}

.login-button {
    min-height: 48px;
    border-radius: 16px;
}

.forgot-link {
    letter-spacing: 0.01em;
}

.login-note {
    letter-spacing: 0.02em;
}

@media (max-width: 599px) {
    .login-form-side::before {
        inset: 0;
        border-radius: 0;
    }

    .login-card {
        width: 100%;
        border-radius: 22px;
    }
}
</style>