<template>
    <div class="select-search">
        <a-select
            :allowClear="props.allowClear"
            v-model:value="defaultSelect"
            placeholder="请选择"
            :style="{ width: width }"
            :getPopupContainer="trigger => trigger.parentNode"
            @change="handleChange"
            @dropdownVisibleChange="openDropDown"
            v-bind="$attrs"
        >
            <template #suffixIcon>
                <iconpark-icon name="xiala" v-if="!isSelectOpen"></iconpark-icon>
                <iconpark-icon
                    name="shouqi"
                    v-if="isSelectOpen"
                    :class="isSelectOpen ? 'green' : ''"
                ></iconpark-icon>
            </template>
            <a-select-option v-for="item in options" :key="item.value" :value="item.value">{{
                item.label
            }}</a-select-option>
        </a-select>
    </div>
</template>

<script setup>
    import { ref, reactive, toRefs, onBeforeMount, onMounted, watchEffect, computed } from 'vue';

    const props = defineProps({
        selectValue: {
            type: null,
        },
        width: {
            type: String,
            default: '140px',
        },
        options: {
            type: Array,
            default: () => [],
        },
        allowClear: {
            type: Boolean,
            default: true,
        }
    });
    const defaultSelect = ref('');
    const isSelectOpen = ref(false);
    const openDropDown = (open) => {
        isSelectOpen.value = open;
    };
    watchEffect(() => {
        defaultSelect.value = props.selectValue;
    });
    onMounted(() => {
        defaultSelect.value = props.selectValue;
    });
    const emit = defineEmits(['update:selectValue', 'changeAreaData','updateSearch']);
    const handleChange = (e) => {
        emit('update:selectValue', e);
        emit('changeAreaData', e);
        emit('updateSearch');
    };
</script>
<style scoped lang="scss">
    .select-search {
        :deep(.green) {
            color: #036b64;
        }
    }
</style>
