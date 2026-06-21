<template>
    <q-input
        outlined
        ref="input"
        color="primary"
        :rules="computedRules"
        :mask="mask ?? attrs.mask"
        :type="computedType"
        :bg-color="$q.dark.isActive ? 'grey-10' : 'white'"
        @keypress="validaDigitos"
        @paste="onCtrlV"
        v-model="inputValue"
    >
        <template 
            v-if="attrs.icon"
            v-slot:prepend
        >
            <q-icon
                :name="attrs.icon"
            />
        </template>

        <template
            v-for="(_, slot) of slots"
            #[slot]="scope"
        >
            <slot
                v-if="!!scope"
                :name="slot"
            />

            <slot
                v-else
                :name="slot"
                v-bind="scope"
            />
        </template>

        <template 
            v-if="type === 'password'"
            v-slot:append
        >
            <q-icon 
                :name="showPassword ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="showPassword = !showPassword"
            >
                <q-tooltip class="text-caption">{{ showPassword ? 'Ocultar' : 'Mostrar' }}</q-tooltip>
            </q-icon>
        </template>
    </q-input>
</template>

<style>
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

input[type="number"] {
    -moz-appearance: textfield;
}
</style>

<script setup>
import { ref, computed, useAttrs, useSlots, watch, onMounted } from "vue";

const mask = ref(undefined);
const showPassword = ref(false);
let ignoreNextWatch = false;

const emit = defineEmits(["update:model-value"]);

const props = defineProps({
    type: {
        type: String,
        default: "text",
    },
    rules: {
        type: Array,
        default: () => [],
    },
    validaCpf: {
        type: Boolean,
        default: false,
    },
    validaEmail: {
        type: Boolean,
        default: false,
    },
    monetario: {
        type: Boolean,
        default: false,
    },
    obrigatorio: {
        type: [Boolean, String],
        default: false,
    },
    modelValue: {
        type: [String, Number],
    },
});

const attrs = useAttrs();
const slots = useSlots();

const formatCurrency = (val, format = true) => {
    if (!val) return;

    let numeric = val;

    if (format) {
        numeric = val.toString().replace(/[^\d]/g, "");

        if (!numeric) return;

        numeric = parseFloat(numeric) / 100;
    }

    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: 2,
    }).format(numeric);
}

const formatToNumber = (val) => {
    return val.toString()
        .replace(/\s/g, "")
        .replace("R$", "")
        .replace(/\./g, "")
        .replace(",", ".")
}

const validaDigitos = (event) => {
    if (props.type === "number" || props.monetario) {
        const char = String.fromCharCode(event.keyCode);

        if (props.type === "number" && !/[0-9.,\-]/.test(char)) {
            event.preventDefault();
        }
    }
}

const onCtrlV = (event) => {
     if (props.type === "number" || props.monetario) {
        const pasted = event.clipboardData.getData("text");

        if (!/^[0-9.,\-]+$/.test(pasted)) {
            event.preventDefault();
        }
    }
}

const validaCPFRule = (cpf) => {  
    if (!cpf || cpf.length == 0) return true;

    cpf = cpf.replace(/[^\d]+/g, '');
    
    var Soma = 0;
    var Resto;

    if (cpf == "00000000000") return "CPF inválido";

    for (let i=1; i<=9; i++) Soma = Soma + parseInt(cpf.substring(i-1, i)) * (11 - i);
    Resto = (Soma * 10) % 11;

        if ((Resto == 10) || (Resto == 11))  Resto = 0;
        if (Resto != parseInt(cpf.substring(9, 10)) ) return "CPF inválido";

    Soma = 0;

    for (let i = 1; i <= 10; i++) Soma = Soma + parseInt(cpf.substring(i-1, i)) * (12 - i);
    Resto = (Soma * 10) % 11;

    if ((Resto == 10) || (Resto == 11))  Resto = 0;
    if (Resto != parseInt(cpf.substring(10, 11) ) ) return "CPF inválido";

    return true;
}

const validaEmailRule = (email) => {
    if (!email || email.length == 0) return true;

    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!regex.test(email)) {
        return "Email inválido";
    }
    return true;
}

const handleOnchange = (val, format = true) => {
    ignoreNextWatch = true;

    if (val && props.monetario) {
        const formatted = formatCurrency(val, format);
        val = formatToNumber(formatted);
    }

    if (val !== props.modelValue) {
        emit("update:model-value", val);
    }
}

watch(() => props.modelValue, (newValue) => {
    if (ignoreNextWatch) {
        ignoreNextWatch = false;
        return;
    }

    handleOnchange(newValue, false);
});

const inputValue = computed({
    get() {
        if (props.monetario && props.modelValue) {
            return formatCurrency(props.modelValue, false);
        }

        return props.modelValue;
    },
    set(val) {
        ignoreNextWatch = true;

        if (props.monetario) {
            if (!val) {
                emit("update:model-value", "");
                return;
            }

            const numeric = val.toString().replace(/[^\d]/g, "");
            if (!numeric) {
                emit("update:model-value", "");
                return;
            }

            const numero = parseFloat(numeric) / 100;
            emit("update:model-value", numero);
        } else {
            emit("update:model-value", val);
        }
    }
});

const computedType = computed(() => {
    const type = props.type;

    if (type != "password") {
        return type;
    }

    return showPassword.value ? "text" : "password";
});

const computedRules = computed(() => {
    const rules = [];

    if (props.validaCpf) {
        mask.value = "###.###.###-##";
        rules.push(validaCPFRule);
    }

    if (props.validaEmail) {
        rules.push(validaEmailRule);
    }
    
    if (props.obrigatorio || attrs.campoObrigatorio) {
        const msg = typeof props.obrigatorio === "string" ? props.obrigatorio : "Campo obrigatório";
        rules.push(val => val !== null && val !== undefined && val !== "" || msg);
    }

    rules.push(...props.rules);

    return rules;
});

onMounted(() => {
    if (props.modelValue) {
        handleOnchange(props.modelValue, false);
    }
});
</script>