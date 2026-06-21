<template>
    <div class="g-table">
        <div
            v-if="title || searchable || $slots.topRight"
            class="g-table__top"
        >
            <div class="g-table__top-left">
                <div
                    v-if="title"
                    class="g-table__title"
                >
                    {{ title }}
                </div>

                <div
                    v-if="subtitle"
                    class="g-table__subtitle"
                >
                    {{ subtitle }}
                </div>
            </div>

            <div class="g-table__top-right">
                <div
                    v-if="searchable"
                    class="g-table__search"
                >
                    <input
                        v-model="search"
                        type="text"
                        class="g-table__search-input"
                        :placeholder="searchPlaceholder"
                    >
                </div>

                <slot name="topRight" />
            </div>
        </div>

        <div class="g-table__wrapper">
            <table class="g-table__table">
                <thead>
                    <tr>
                        <th
                            v-for="column in normalizedColumns"
                            :key="column.name"
                            :class="[
                                'g-table__th',
                                column.headerClass,
                                {
                                    'text-left': column.align === 'left',
                                    'text-center': column.align === 'center',
                                    'text-right': column.align === 'right',
                                }
                            ]"
                            :style="{ width: column.width || 'auto' }"
                        >
                            {{ column.label }}
                        </th>
                    </tr>
                </thead>

                <tbody v-if="loading">
                    <tr
                        v-for="n in loadingRows"
                        :key="`loading-${n}`"
                    >
                        <td
                            v-for="column in normalizedColumns"
                            :key="column.name"
                            class="g-table__td"
                        >
                            <div class="g-table__skeleton" />
                        </td>
                    </tr>
                </tbody>

                <tbody v-else-if="filteredRows.length">
                    <tr
                        v-for="row in filteredRows"
                        :key="getRowKey(row)"
                        class="g-table__tr"
                    >
                        <td
                            v-for="column in normalizedColumns"
                            :key="column.name"
                            :class="[
                                'g-table__td',
                                column.cellClass,
                                {
                                    'text-left': column.align === 'left',
                                    'text-center': column.align === 'center',
                                    'text-right': column.align === 'right',
                                }
                            ]"
                        >
                            <slot
                                :name="`body-cell-${column.name}`"
                                :row="row"
                                :column="column"
                                :value="getCellValue(row, column)"
                            >
                                {{ getCellValue(row, column) }}
                            </slot>
                        </td>
                    </tr>
                </tbody>

                <tbody v-else>
                    <tr>
                        <td
                            :colspan="normalizedColumns.length"
                            class="g-table__empty"
                        >
                            <slot name="empty">
                                <div class="g-table__empty-content">
                                    <div class="g-table__empty-title">
                                        Nenhum registro encontrado
                                    </div>

                                    <div class="g-table__empty-text">
                                        Não há dados para exibir nesta tabela.
                                    </div>
                                </div>
                            </slot>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

type Align = "left" | "center" | "right";

interface Column {
    name: string;
    label: string;
    field: string | ((row: Record<string, any>) => any);
    align?: Align;
    width?: string;
    headerClass?: string;
    cellClass?: string;
}

const props = defineProps({
    title: {
        type: String,
        default: "",
    },
    subtitle: {
        type: String,
        default: "",
    },
    columns: {
        type: Array as () => Column[],
        default: () => [],
    },
    rows: {
        type: Array as () => Record<string, any>[],
        default: () => [],
    },
    rowKey: {
        type: String,
        default: "id",
    },
    loading: {
        type: Boolean,
        default: false,
    },
    loadingRows: {
        type: Number,
        default: 5,
    },
    searchable: {
        type: Boolean,
        default: false,
    },
    searchPlaceholder: {
        type: String,
        default: "Buscar...",
    },
});

const search = ref("");

const normalizedColumns = computed(() =>
    props.columns.map((column) => ({
        align: "left",
        ...column,
    }))
);

function getCellValue(row: Record<string, any>, column: Column) {
    if (typeof column.field === "function") {
        return column.field(row);
    }

    return row[column.field];
}

function getRowKey(row: Record<string, any>) {
    return row[props.rowKey] ?? Math.random();
}

const filteredRows = computed(() => {
    if (!props.searchable || !search.value.trim()) {
        return props.rows;
    }

    const term = search.value.toLowerCase().trim();

    return props.rows.filter((row) =>
        normalizedColumns.value.some((column) => {
            const value = getCellValue(row, column);
            return String(value ?? "").toLowerCase().includes(term);
        })
    );
});
</script>

<style scoped>
.g-table {
    width: 100%;
    background: #ffffff;
    border: 1px solid #e8ecf7;
    border-radius: 14px;
    overflow: hidden;
    box-shadow:
        0 12px 30px rgba(15, 23, 42, 0.06),
        0 2px 8px rgba(15, 23, 42, 0.04);
}

.g-table__top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    padding: 20px 22px;
    border-bottom: 1px solid #eef2fb;
    background: linear-gradient(180deg, #ffffff 0%, #fbfcff 100%);
}

.g-table__top-left {
    min-width: 0;
}

.g-table__title {
    font-size: 18px;
    font-weight: 700;
    color: #1f2a44;
    line-height: 1.2;
}

.g-table__subtitle {
    margin-top: 6px;
    font-size: 14px;
    color: #8b93b8;
    line-height: 1.4;
}

.g-table__top-right {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
}

.g-table__search {
    min-width: 240px;
}

.g-table__search-input {
    width: 100%;
    height: 44px;
    padding: 0 14px;
    border: 1px solid #dbe3f5;
    border-radius: 14px;
    background: #f8faff;
    color: #1f2a44;
    font-size: 14px;
    outline: none;
    transition: all 0.22s ease;
    box-sizing: border-box;
}

.g-table__search-input:focus {
    border-color: var(--g-primary, #2f66f6);
    background: #ffffff;
    box-shadow: 0 0 0 4px rgba(47, 102, 246, 0.10);
}

.g-table__wrapper {
    width: 100%;
    overflow-x: auto;
}

.g-table__table {
    width: 100%;
    min-width: 720px;
    border-collapse: separate;
    border-spacing: 0;
}

.g-table__th {
    position: sticky;
    top: 0;
    z-index: 1;
    padding: 16px 18px;
    background: #f8faff;
    border-bottom: 1px solid #e9eef9;
    font-size: 13px;
    font-weight: 700;
    color: #7b86ab;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    white-space: nowrap;
}

.g-table__td {
    padding: 18px;
    border-bottom: 1px solid #f0f3fb;
    font-size: 14px;
    font-weight: 500;
    color: #33415c;
    vertical-align: middle;
    background: #ffffff;
}

.g-table__tr {
    transition: background 0.18s ease, transform 0.18s ease;
}

.g-table__tr:hover .g-table__td {
    background: #fafcff;
}

.g-table__empty {
    padding: 40px 20px;
    text-align: center;
    background: #ffffff;
}

.g-table__empty-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
}

.g-table__empty-title {
    font-size: 16px;
    font-weight: 700;
    color: #1f2a44;
}

.g-table__empty-text {
    font-size: 14px;
    color: #8b93b8;
}

.g-table__skeleton {
    width: 100%;
    height: 16px;
    border-radius: 999px;
    background: linear-gradient(
        90deg,
        #eef2fb 25%,
        #f7f9fd 50%,
        #eef2fb 75%
    );
    background-size: 200% 100%;
    animation: g-table-skeleton 1.2s infinite linear;
}

.text-left {
    text-align: left;
}

.text-center {
    text-align: center;
}

.text-right {
    text-align: right;
}

@keyframes g-table-skeleton {
    0% {
        background-position: 200% 0;
    }
    100% {
        background-position: -200% 0;
    }
}
</style>