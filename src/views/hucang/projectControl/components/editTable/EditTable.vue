<template>
    <div class="edit-table-component">
        <a-table
            :pagination="false"
            :columns="props.columns"
            :data-source="props.dataSource"
            bordered
        >
            <template #bodyCell="{ column, text, record }">
                <template v-if="column.isEdit">
                    <a-input-number
                        v-if="column.type"
                        :min="record.min"
                        :max="record.max"
                        v-model:value="record[column.dataIndex]"
                        :controls="false"
                        style="margin: -5px 0"
                    />
                    <a-input
                        v-else
                        v-model:value="record[column.dataIndex]"
                        style="margin: -5px 0"
                    />
                </template>
            </template>
        </a-table>
    </div>
</template>
<style scoped lang="scss">
    @import './EditTable.scss';
</style>
<script setup>
    import { reactive, ref } from 'vue';
    const props = defineProps({
        columns: {
            type: Array,
            default: () => {
                return [];
            },
        },
        dataSource: {
            type: Array,
            default: () => {
                return [];
            },
        },
    });
</script>
