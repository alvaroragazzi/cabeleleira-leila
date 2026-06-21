<template>
    <g-card 
        use-form 
        :title="title"
        :loading="loading"
        :hide-save-btn="props.hideSaveBtn"
        @submit="submit"
    >
        <template
            v-for="(_, slot) of $slots"
            #[slot]="scope"
        >
            <slot
                :name="slot"
                v-bind="scope"
            />
        </template>

        <slot></slot>
    </g-card>
</template>

<script setup>
import { api } from "boot/axios";
import { computed, ref, onMounted, useAttrs } from "vue";
import { useQuasar } from "quasar";

import objectToFormData from "src/functions/objectToFormData";

const $q = useQuasar();

const loading = ref(true);

const attrs = useAttrs();

const props = defineProps({
    buttonColor: {
        type: String,
        default: "primary",
    },

    modelValue: {
        type: Object,
    },

    creatingTitle: {
        type: String,
    },

    updatingTitle: {
        type: String,
    },

    readonlyTitle: {
        type: String,
    },

    primaryKeyName: {
        type: String,
    },

    loadEndpoint: {
        type: String,
    },

    updateEndpoint: {
        type: String,
    },

    createEndpoint: {
        type: String,
    },

    updatedSuccessMessage: {
        type: String,
    },

    createdSuccessMessage: {
        type: String,
    },

    useFormData: {
        type: Boolean,
    },

    id: {
        type: String,
    },

    hideSaveBtn: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits([
    "created",
    "updated",
]);

const submit = () => {
    if (props.id) {
        update();
    } else {
        create();
    }
}

const load = () => {
    api.get(props.loadEndpoint.replace("{id}", props.id)).then(res => {
        emit("update:model-value", res.data);
        emit("loaded");
    }).finally(() => loading.value = false);
}

const onBeforeSubmitHandler = async() => {
    if (attrs.onBeforeSubmit && typeof(attrs.onBeforeSubmit) == "function") {
        return new Promise((resolve, reject) => {
            const done = (data = props.modelValue) => resolve(data);
            emit("beforeSubmit", done, reject);
        });
    }

    return props.modelValue;
}

const create = () => {
    onBeforeSubmitHandler().then(data => {
        $q.loading.show();

        let formData;

        if (props.useFormData) {
            formData = objectToFormData(data);
        }

        api.post(props.createEndpoint, props.useFormData ? formData : data)
            .then(res => {
                if (res.status >= 200 && res.status < 300) {
                    emit("ok", {
                        type: "created",
                        data: res.data,
                    });
                    
                    if (props.createdSuccessMessage) {
                        $q.notify({
                            type: "positive",
                            message: props.createdSuccessMessage,
                        });
                    }
                }
            })
            .finally(() => $q.loading.hide());
    });
}

const update = () => {
    $q.loading.show();

    onBeforeSubmitHandler()
        .then(data => {
            let formData;

            if (props.useFormData) {
                formData = objectToFormData(data);
                //formData.append("_method", "PUT");
            }
            
            api.put(props.updateEndpoint.replace("{id}", props.id), props.useFormData ? formData : data).then(res => {
                if (res.status >= 200 && res.status < 300) {
                    emit("ok", {
                        type: "update",
                        data: res.data,
                    });

                    if (props.updatedSuccessMessage) {
                        $q.notify({
                            type: "positive",
                            message: props.updatedSuccessMessage,
                        });
                    }
                }
            }).finally(() => $q.loading.hide());
        });
}

const title = computed(() => {
    return props.id ? props.updatingTitle : props.creatingTitle;
});

onMounted(() => {
    if (props.id) {
        load();
    } else {
        loading.value = false;
    }
});
</script>