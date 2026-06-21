<template>
    <q-card 
        :flat="$q.dark.isActive" 
        style="max-width: 100vw; max-height: 100vh; border-radius: 16px;"
    >   
        <q-toolbar
            v-if="props.title || $slots.title"
            class="q-mt-sm text-weight-bold"
        >
            <q-toolbar-title class="row items-center text-h5">
                <slot name="title">
                    <q-icon v-if="props.icon" :name="props.icon" class="q-mr-sm" />
                    {{ props.title }}
                </slot>
            </q-toolbar-title>

            <div class="q-gutter-sm row items-center">
                <slot name="top-right"/>

                <g-btn
                    v-if="!props.hideCloseBtn"
                    icon="X"
                    flat
                    round
                    dense
                    v-close-popup
                />
            </div>
        </q-toolbar>

        <q-separator v-if="props.title || $slots.title" spaced/>
        
        <div style="overflow: auto" v-if="props.useForm">
            <div
                v-show="props.loading"
                class="flex flex-center"
                style="min-height: 240px;"
            >
                <q-spinner-tail
                    size="5rem"
                    color="primary"
                />
            </div>

            <Transition name="fade">
                <q-form
                    v-if="!props.loading"
                    @submit.prevent="emit('submit')"
                    @validation-error="scrollToValidationError"
                    class="column"
                >
                    <div style="overflow: auto" class="col q-px-sm">
                        <slot></slot>
                    </div>

                    <q-separator spaced/>
                    
                    <div class="row justify-end q-gutter-sm q-px-sm q-pb-sm">
                        <g-btn
                            v-if="!props.hideCloseBtn"
                            :compact="false"
                            icon="X"
                            label="Cancelar"
                            dense
                            flat
                            v-close-popup
                        />
                        <g-btn
                            v-if="!props.hideSaveBtn"
                            type="submit"
                            label="Salvar"
                            color="primary"
                            icon="Save"
                        />
                        <slot name="actions"></slot>
                    </div>
                </q-form>
            </Transition>
        </div>

        <div 
            v-else
            class="q-pa-sm"
            style="overflow-y: auto" 
        >
            <slot></slot>
        </div>

        <q-card-actions v-if="$slots['bottom-left']">
            <slot name="bottom-left"/>
        </q-card-actions>

        <q-card-actions align="right" v-if="$slots['bottom-right']">
            <slot name="bottom-right"/>
        </q-card-actions>
    </q-card>
</template>

<script setup>
const props = defineProps({
    hideTopBorder: {
        type: Boolean,
    },

    useForm: {
        type: Boolean,
    },

    hideSaveBtn: {
        type: Boolean,
    },

    loading: {
        type: Boolean,
    },

    hideCloseBtn: {
        type: Boolean,
    },

    title: {
        type: String,
    },

    borderBgColor: {
        type: String,
        default: "bg-primary",
    },

    icon: String,
});

const emit = defineEmits(["submit"]);

const scrollToValidationError = (ref) => {
    ref.$el.scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "nearest",
    });
}
</script>