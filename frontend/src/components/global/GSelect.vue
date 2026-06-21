<template>
    <q-select
        use-input
        @filter="search"
        :options="optionsByURL"
        ref="select"
        :class="{
            'q-select-ellipsis': props.textoResponsivo
        }"
        :loading="loading"
        :bg-color="`$q.dark.isActive ? 'grey-10' : 'white'`"
        @keydown.tab.prevent="onTab"
        :option-label="optionLabel"
        :option-value="optionValue"
        :rules="computedRules"
        @update:model-value="onModelValueChange"
    >
        <template
            v-if="props.icon || $slots.prepend"
            v-slot:prepend
        >
            <slot name="prepend">
                <q-icon
                    v-if="props.icon"
                    :name="props.icon"
                />
            </slot>
        </template>

        <template v-slot:option="scope">
            <q-item
                v-bind="scope.itemProps"
                v-on="scope.itemEvents"
                :v-close-popup="!attrs.multiple"
                clickable 
                v-ripple
            >
                <q-item-section
                    v-if="slots['item-left']"                
                    avatar
                >
                    <slot name="item-left" v-bind="scope"></slot>
                </q-item-section>

                <q-item-section class="q-mr-sm">
                    <q-item-label class="row">
                        <slot 
                            name="option-value" 
                            :props="scope"
                        >
                            <strong v-if="!hideId" class="q-mr-xs">{{ getValue(scope.opt) }}</strong>
                        </slot>
                        
                        <div v-if="!hideId" class="q-mr-xs q-ml-xs text-bold">-</div>

                        <slot 
                            name="option-label" 
                            v-bind="scope"
                        >
                            {{ getLabel(scope.opt) }}
                        </slot>
                    </q-item-label>

                    <slot name="item-subtitle" v-bind="scope"></slot>
                </q-item-section>

                <q-item-section thumbnail>
                    <slot name="item-right" v-bind="scope"></slot>
                </q-item-section>
            </q-item>
        </template>

        <template
            v-slot:selected-item="scope"
        >
            <slot name="selected-item" v-bind="scope">
                <q-chip
                    v-if="props.useChips"
                    removable
                    dense
                    @remove="scope.removeAtIndex(scope.index)"
                    :tabindex="scope.tabindex"
                    class="q-mt-xs q-mr-xs"
                >
                    <span v-if="!hideId" class="text-weight-bold q-mr-xs">
                        {{ getValue(scope.opt) }} - 
                    </span>
                    {{ getLabel(scope.opt) }}
                </q-chip>

                <div
                    v-else
                    class="hu-select__selected-item"
                    :class="{
                        'q-mr-xs': scope.index < (optionsByURL?.length || 0) - 1
                    }"
                >
                    <span class="hu-select__selected-text">
                        <strong v-if="!hideId">{{ getValue(scope.opt) }} - </strong>
                        {{ getLabel(scope.opt) }}
                    </span>

                    <q-tooltip
                        v-if="attrs.modelValue"
                        class="text-caption"
                        style="width: fit-content;"
                    >
                        <strong v-if="!hideId">{{ getValue(scope.opt) }} - </strong>
                        {{ getLabel(scope.opt) }}
                    </q-tooltip>
                </div>
            </slot>
        </template>

        <template v-slot:append>
            <slot name="append" />                            
        </template>

        <template v-slot:no-option>
            <q-item>
                <q-item-section class="text-italic text-grey">
                    <div v-if="optionsByURL.length == 0 && !loading">
                        Nenhum registro encontrado.
                    </div>

                    <div 
                        v-else-if="loading"
                        class="row items-center"
                    >
                        <q-spinner/>
                        <div class="q-ml-sm">Carregando</div>
                    </div>
                </q-item-section>
            </q-item>
        </template>
    </q-select>
</template>

<style>
.q-select-ellipsis .q-field__native {
    display: flex !important;
    flex-wrap: nowrap !important;
    align-items: center !important;
    min-width: 0 !important;
    overflow: hidden !important;
}

.q-select-ellipsis .q-field__control-container {
    min-width: 0 !important;
    overflow: hidden !important;
}

.q-select-ellipsis .hu-select__selected-item {
    flex: 1 1 auto;
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
}

.q-select-ellipsis .hu-select__selected-text {
    display: block;
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}native:has(.hu-select_selected-item, .q-chip) .q-field_

.q-select-ellipsis:not(.q-field--focused) .q-field__input.col {
    flex: 0 0 1px !important;
    min-width: 1px !important;
    max-width: 1px !important;
    padding: 0 !important;
}
</style>

<script setup>
import { ref, watch, onMounted, useAttrs, computed, nextTick, useSlots } from "vue";
import { api } from "boot/axios";

const optionsByURL = ref([]);
const loading = ref(false);
const select = ref();
let changedFirstTime = false;
let optionsBackup = [];

const attrs = useAttrs();
const slots = useSlots();

const props = defineProps({
    icon: {
        type: String,
    },
    options: {
        type: Array,
        default: () => [],
    },
    optionsUrl: {
        type: String,
        default: "",
    },
    optionsUrlParams: {
        type: Object,
        default: {},
    },
    responseDataKey: {
        type: String,
        default: "",
    },
    obrigatorio: {
        type: Boolean,
        default: false,
    },
    rules: {
        type: Array,
        default: () => [],
    },
    requestMethod: {
        type: String,
        default: "get",
    },
    optionLabel: {
        type: String,
        default: "label",
    },
    optionValue: {
        type: String,
        default: "value",
    },
    asyncSearch: {
        type: Boolean,
        default: false,
    },
    asyncSearchParamPrefix: {
        type: String,
        default: "search",
    },
    hideId: {
        type: Boolean,
        default: false,
    },
    forcarCarregamento: {
        type: Boolean,
        default: false,
    },
    naoSelecionarPrimeiroItem: {
        type: Boolean,
        default: false,
    },
    useChips: {
        type: Boolean,
        default: false,
    },
    textoResponsivo: {
        type: Boolean,
        default: true,
    },
});

const emit = defineEmits(["update:model-value", "loaded"]);

const onModelValueChange = (val) => {
    if (attrs.multiple == "") {
        select.value.updateInputValue("");
    }

    emit("update:model-value", val);
}

const getLabel = (opt) => {
    return opt[props.optionLabel] ?? opt;
}

const getValue = (opt) => {
    return opt[attrs["option-value-label"]] ?? opt[props.optionValue];
}

const getOptions = () => {
    return optionsBackup;
}

const getSelectedOption = () => {
    const value = attrs.modelValue;

    if (value == null || value == undefined) {
        return null;
    }

    const options = optionsBackup;

    return options.find(opt => opt[props.optionValue] == value) ?? null;
}

const waitForLoad = () => {
    return new Promise(resolve => {
        const timer = setInterval(() => {
            if (!loading.value) {
                clearInterval(timer);
                resolve();
            }
        }, 100);
    });
};

const onTab = async(e) => {
    await selectFirstItem();

    e.preventDefault();
    select.value.hidePopup?.();

    nextTick(() => {
        const focusable = Array.from(document.querySelectorAll(
            "input, textarea, select, button, [tabindex]:not([tabindex=\"-1\"])"
        )).filter(el => !el.disabled && el.tabIndex >= 0);

        const idx = focusable.findIndex(el => el === e.target);

        if (idx > -1 && focusable[idx + 1]) {
            focusable[idx + 1].focus();
        }
    });
}

const selectFirstItem = async() => {
    select.value.setOptionIndex(0);

    await nextTick();
}

const updateOptions = () => {
    const options = JSON.parse(JSON.stringify(props.options))

    optionsByURL.value = options;
    optionsBackup = options;
}

const search = (val, update) => {
    update(() => {
        if (val == "") {
            if (props.asyncSearch) {
                optionsByURL.value = [];
            } else {
                optionsByURL.value = optionsBackup;
            }
        } else {
            if (props.asyncSearch) {
                api[props.requestMethod](`${props.optionsUrl}`, props.requestMethod == "get" ? { 
                    params: { [props.asyncSearchParamPrefix]: val, ...props.optionsUrlParams} } : { [props.asyncSearchParamPrefix]: val, ...props.optionsUrlParams }).then(res => {
                    loading.value = false;

                    const data = props.responseDataKey ? res.data[props.responseDataKey] : res.data;

                    optionsByURL.value = data;
                });
            } else {
                const filtered = optionsBackup.filter(v => v[props.optionLabel].toLowerCase().indexOf(val.toLowerCase()) > -1 || String(v[props.optionValue]).toLowerCase().indexOf(val.toLowerCase()) > -1);
            
                optionsByURL.value = filtered;
            }
        }
    });
}

const computedRules = computed(() => {
    const rules = [];

    if (props.obrigatorio) {
        rules.push(
            (val) => !!val || "Campo obrigatório",
        );
    }

    rules.push(...props.rules);

    return rules;
});

const stopWatchingOptionsByURL = watch(() => optionsByURL.value, (newV) => {
    if (!changedFirstTime) {
        changedFirstTime = true;

        if (newV.length == 1 && !attrs.readonly && !attrs.disable && !attrs.modelValue) {
            props.$emit("update:model-value", attrs["emit-value"] == "" ? newV[0][props.optionValue] : newV[0]);
        }

        nextTick(() => stopWatchingOptionsByURL());
    }
}, {
    immediate: true,
});

watch(() => props.options, () => updateOptions(), { deep: true });

onMounted(() => {
    if (props.options && typeof(props.options) === "object") {
        updateOptions();
    }

    if (props.optionsUrl && !props.asyncSearch) {
        api[props.requestMethod](props.optionsUrl, props.requestMethod == "get" ? { params: props.optionsUrlParams } : props.optionsUrlParams).then(res => {
            loading.value = false;

            const data = props.responseDataKey ? res.data[props.responseDataKey] : res.data;

            optionsByURL.value = data;
            optionsBackup = [...data];

            emit("loaded");
        });
    }
});

defineExpose({
    getOptions,
    getSelectedOption,
    waitForLoad,
});
</script>