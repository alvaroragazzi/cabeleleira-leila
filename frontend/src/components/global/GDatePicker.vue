<template>
    <g-input
        @update:model-value="onInputRawChange"
        mask="##/##/####"
        v-model="inputValue"
        :rules="computedRules"
    >
        <template v-if="!$attrs.readonly" v-slot:prepend>
            <q-icon name="calendar_month" class="cursor-pointer">
                <q-popup-proxy transition-show="scale" transition-hide="scale">
                    <q-date
                        :color="color"
                        mask="DD/MM/YYYY"
                        v-model="inputValue"
                        @update:model-value="onInputRawChange"
                    >
                        <template v-slot:default>
                            <q-btn :color="color" v-close-popup label="Fechar" />
                        </template>
                    </q-date>
                </q-popup-proxy>
            </q-icon>
        </template>
    </g-input>
</template>

<script>
import dayjs from "dayjs";

export default {
    data() {
        return {
            inputValue: null,
            ignoreNextWatch: false,
        };
    },

    watch: {
        computedModel(val) {
            if (this.ignoreNextWatch) {
                this.ignoreNextWatch = false;
                return;
            }

            if (!val) {
                this.inputValue = null;
                return;
            }

            const isIso = /^\d{4}-\d{2}-\d{2}$/.test(val);
            const isBr  = /^\d{2}\/\d{2}\/\d{4}$/.test(val);

            let iso, br;

            if (isIso) {
                iso = val;
                br  = dayjs(val, "YYYY-MM-DD").format("DD/MM/YYYY");
            } else if (isBr) {
                br  = val;
                iso = dayjs(val, "DD/MM/YYYY").format("YYYY-MM-DD");
            } else {
                return;
            }

            this.inputValue = br;

            if (isBr) {
                this.ignoreNextWatch = true;

                const saida = iso;

                this.$emit("update:model-value", saida);
                this.$emit("update:data", saida);
            }
        },
    },

    methods: {
        onInputRawChange(val) {
            this.ignoreNextWatch = true;

            if (!val || val.length < 10) {
                this.$emit("update:model-value", null);
                this.$emit("update:data", null);
                return;
            }

            const iso = dayjs(val, "DD/MM/YYYY").isValid()
                ? dayjs(val, "DD/MM/YYYY").format("YYYY-MM-DD")
                : null;

            this.inputValue = val;

            const saida = iso;

            this.$emit("update:model-value", saida);
            this.$emit("update:data", saida);
        },

        onQDateChange(isoVal) {
            this.ignoreNextWatch = true;
            
            if (!isoVal) {
                this.inputValue = null;
                this.$emit("update:model-value", null);
                this.$emit("update:data", null);
                return;
            }

            const br = dayjs(isoVal, "YYYY-MM-DD").format("DD/MM/YYYY");

            this.inputValue = isoVal;

            this.$emit("update:model-value", isoVal);
            this.$emit("update:data", isoVal);
        },


        handleChange(val) {
            this.onInputRawChange(val);
        },
    },

    computed: {
        computedModel() {
            return this.data ?? this.modelValue;
        },

        computedRules() {
            const rules = [];

            rules.push(
                (val) => !val || val.length == 10 || "Data inválida",
                (val, rules) =>
                !val ||
                rules.date(dayjs(val, "DD/MM/YYYY").format("YYYY/MM/DD")) ||
                "Data inválida"
            );

            if (this.obrigatorio) {
                rules.push((val) => !!val || "Campo obrigatório");
            }

            rules.push(...this.rules);

            return rules;
        },
    },

    mounted() {
        if (this.computedModel) {
            this.computedModel && this.$nextTick(() => {
                this.$options.watch.computedModel.call(this, this.computedModel);
            });
        }
    },

    props: {
        rules: { 
            type: Array, 
            default: () => [] 
        },
        data: { 
            type: String 
        },
        modelValue: { 
            type: String 
        },
        obrigatorio: { 
            type: Boolean 
        },
        color: { 
            type: String, 
            default: "primary" 
        },
    },
};
</script>