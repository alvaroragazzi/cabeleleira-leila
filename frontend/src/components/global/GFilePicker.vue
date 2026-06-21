<template>
    <q-uploader
        ref="uploader"
        :auto-upload="false"
        hide-upload-btn
        hide-upload-progress
        flat
        bordered
        @added="onFilesAdded"
        @removed="onFilesRemoved"
        :multiple="props.multiple"
    >
        <template v-slot:header="scope">
            <q-bar class="bg-primary">
                <q-btn
                    v-if="scope.queuedFiles.length > 0 && !props.hideDeleteAllBtn"
                    flat
                    dense
                    icon="clear_all"
                    label="Remover todos os arquivos"
                    @click="onAllFilesRemove(scope)"
                >
                    <q-tooltip class="text-caption">Remover todos os arquivos</q-tooltip>
                </q-btn>

                <div style="font-size: 15px">{{ attrs.label }}</div>

                <q-space/>

                <q-btn
                    v-if="scope.canAddFiles && !props.hideAddBtn"
                    flat
                    dense
                    @click="emit('fileDialogOpen')"
                    icon="upload"
                    :label="`Enviar arquivo${props.multiple ? 's' : ''}`"
                >
                    <q-uploader-add-trigger/>
                    <q-tooltip class="text-caption">Adicionar arquivos</q-tooltip>
                </q-btn>
            </q-bar>
        </template>

        
        <template v-slot:list="scope">
            <q-list style="overflow-y: auto" class="q-gutter-y-sm">
                <q-inner-loading :showing="props.loading">
                    <q-spinner/>
                </q-inner-loading>

                <div
                    v-for="(file, index) in scope.files"
                    :key="file.__key"
                >
                    <q-item
                        v-if="file.type.startsWith('image/')"
                        class="q-pa-none q-card--bordered rounded-borders"
                    >
                        <q-img
                            :src="fileToObjectUrl(file)"
                            fit="contain"
                            class="rounded-borders"
                        >
                            <div class="full-width row justify-between">
                                <div class="column">
                                    <div><strong>{{ file.name }}</strong></div>
                                    <div class="text-caption">{{ file.size ? `${Math.round(file.size / 1024)}kb` : 'Tamanho desconhecido' }}</div>
                                    <slot name="item-section-name" v-bind="{ file, index }"></slot>
                                </div>

                                <div class="row items-center q-gutter-x-xs">
                                    <q-btn
                                        v-if="!props.hideDownloadAndDeleteBtn"
                                        flat
                                        icon="download"
                                        round
                                        dense
                                        @click="download(file)"
                                    >
                                        <q-tooltip class="text-caption">Baixar arquivo</q-tooltip>
                                    </q-btn>

                                    <q-btn
                                        flat
                                        icon="visibility"
                                        round
                                        dense
                                        @click="visualizar(file)"
                                    >
                                        <q-tooltip class="text-caption">Visualizar arquivo</q-tooltip>
                                    </q-btn>

                                    <q-btn
                                        v-if="!props.hideDownloadAndDeleteBtn"
                                        icon="cancel"
                                        flat
                                        round
                                        dense
                                        @click="onFileRemove(scope, file, index)"
                                    >
                                        <q-tooltip class="text-caption">Remover arquivo</q-tooltip>
                                    </q-btn>
                                </div>
                            </div>
                        </q-img>
                    </q-item>

                    <q-item
                        v-else
                        class="rounded-borders q-card--bordered"
                    >
                        <q-item-section>
                            <q-item-label><strong>{{ file.name }}</strong></q-item-label>
                            <q-item-label caption>
                                {{ file.size ? `${Math.round(file.size / 1024)}kb` : 'Tamanho desconhecido' }}
                            </q-item-label>

                            <slot name="item-section-name" v-bind="{ file, index }"></slot>
                        </q-item-section>

                        <q-item-section thumbnail>
                            <div class="q-gutter-x-xs row items-center">
                                <slot name="thumbnail" v-bind="scope"></slot>

                                <q-btn
                                    v-if="!props.hideDownloadAndDeleteBtn"
                                    flat
                                    icon="download"
                                    @click="download(file)"
                                    round
                                    dense
                                >
                                    <q-tooltip class="text-caption">Baixar arquivo</q-tooltip>
                                </q-btn>

                                <q-btn
                                    flat
                                    icon="visibility"
                                    round
                                    dense
                                    @click="visualizar(file)"
                                >
                                    <q-tooltip class="text-caption">Visualizar arquivo</q-tooltip>
                                </q-btn>

                                <q-btn
                                    v-if="!props.hideDownloadAndDeleteBtn"
                                    icon="cancel"
                                    class="q-mr-sm"
                                    round
                                    dense
                                    flat
                                    @click="onFileRemove(scope, file, index)"
                                >
                                    <q-tooltip class="text-caption">Remover arquivo</q-tooltip>
                                </q-btn>
                            </div>
                        </q-item-section>

                        <slot name="item-section"></slot>
                    </q-item>
                </div>
            </q-list>

            <q-card v-if="!props.modelValue" flat bordered class="q-mt-sm">
                <q-card-section class="row items-center justify-center q-gutter-x-sm">
                    <q-icon name="cloud_upload" size="1.5rem" color="primary"/>
                    <div class="text-caption">Arraste e solte arquivos aqui</div>
                </q-card-section>
            </q-card>
        </template>
    </q-uploader>
</template>

<script setup>
import { ref, useAttrs, watch, computed } from "vue";
import { useQuasar } from "quasar";

const $q = useQuasar();
const uploader = ref();
let ignoreNextWatch = false;

const emit = defineEmits([
    "update:model-value",
    "deleted",
    "fileDialogOpen",
]);

const props = defineProps({
    modelValue: {
        required: true,
    },
    maxSize: {
        type: String,
    },
    totalMaxSize: {
        type: String,
    },
    multiple: {
        type: Boolean,
        default: false,
    },
    loading: {
        type: Boolean,
    },
    dialogExclusao: {
        type: Boolean,
    },
    hideDeleteAllBtn: {
        type: Boolean,
    },
    hideDownloadAndDeleteBtn: {
        type: Boolean,
    },
    hideAddBtn: {
        type: Boolean,
    }
});

const attrs = useAttrs();

const onFilesAdded = (files) => {
    if (props.maxSize) {
        for (const file of files) {
            const totalSizeKB = Math.round(file.size / 1024);

            if (totalSizeKB > parseInt(props.maxSize)) {
                $q.dialog({
                    title: "Aviso",
                    message: `
                        O arquivo <strong>${file.name}</strong> é muito grande.<br>
                        Tamanho máximo permitido: <strong>${props.maxSize}kb</strong><br>
                        Tamanho do arquivo enviado: <strong>${totalSizeKB}kb</strong>
                    `,
                    color: "primary",
                    ok: {
                        flat: false,
                    },
                    html: true,
                });

                uploader.value.removeFile(file);
                return;
            }
        }
    }
    
    if (props.totalMaxSize) {
        const totalSize = Math.round(files.reduce((acc, file) => acc + file.size, 0) / 1024);

        if (totalSize > parseInt(props.totalMaxSize)) {
            $q.dialog({
                title: "Aviso",
                message: `
                    O tamanho total dos arquivos que você enviou excede o limite definido (${props.totalMaxSize}kb)<br>
                    Tamanho total dos arquivos enviados: <strong>${totalSize}kb</strong>
                `,
                color: "primary",
                ok: {
                    flat: false,
                },
                html: true,
            });

            return;
        }
    }

    ignoreNextWatch = true;

    if (props.multiple) {
        const existingKeys = new Set(props.modelValue.map(f => f.__key));
        const newFiles = files.filter(f => !existingKeys.has(f.__key));

        emit("update:model-value", [
            ...props.modelValue,
            ...newFiles,
        ]);
    } else {
        emit("update:model-value", files[0]);
    }
}

const fileToObjectUrl = (file) => {
    return URL.createObjectURL(file);
}

const download = (file) => {
    const link = document.createElement("a");
    const blobUrl = fileToObjectUrl(file);
    link.href = blobUrl;
    link.download = file.name;

    link.click();

    setTimeout(() => {
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    }, 100);
}

const visualizar = (file) => {
    const blobUrl = fileToObjectUrl(file);

    setTimeout(() => {
        window.open(blobUrl, "_blank");
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    }, 100);
}

const onFilesRemoved = (files) => {
    if (props.multiple) {
        const removedKeys = files.map(f => f.__key);

        emit("update:model-value", props.modelValue.filter(f => !removedKeys.includes(f.__key)));
    } else {
        emit("update:model-value", null);
    }
}

const onFileRemove = (scope, file, index) => {
    if (props.dialogExclusao) {
        $q.dialog({
            title: "Aviso",
            message: "Deseja mesmo excluir o arquivo <strong>${file.name}</strong>?",
            html: true,
            color: "primary",
            ok: {
                label: "Sim",
            },
            cancel: {
                label: "Não",
                flat: true,
            }
        }).onOk(() => {
            emit("deleted", { file, index });
            scope.removeFile(file);
        });
    } else {
        emit("deleted", { file, index });
        scope.removeFile(file);
    }
}

const onAllFilesRemove = (scope) => {
    if (props.dialogExclusao) {
        $q.dialog({
            title: "Aviso",
            message: "Deseja mesmo excluir todos os arquivos?",
            html: true,
            color: "primary",
            ok: {
                label: "Sim",
            },
            cancel: {
                label: "Não",
                flat: true,
            }
        }).onOk(() => {
            scope.removeQueuedFiles();
            emit("deleted");
        });
    } else {
        emit("deleted");
        scope.removeQueuedFiles();
    }
}

const isModelValueValid = computed(() => {
    return props.modelValue instanceof File || (Array.isArray(props.modelValue) && props.modelValue.every(file => file instanceof File));
});

watch(() => props.modelValue, (files) => {
    if (ignoreNextWatch) {
        ignoreNextWatch = false;
        return;
    }

    if (!uploader.value) return;

    uploader.value.removeQueuedFiles();
    
    if (files && isModelValueValid.value) {
        Array.isArray(files) ? uploader.value.addFiles(files) : uploader.value.addFiles([files]);
    }
}, {  immediate: true, });

watch(uploader, (newUploader) => {
    if (newUploader && props.modelValue && isModelValueValid.value) {
        Array.isArray(props.modelValue) ? uploader.value.addFiles(props.modelValue) : uploader.value.addFiles([props.modelValue]);
    }
},
    { immediate: true }
);
</script>