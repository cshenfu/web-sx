<template>
    <tips-modal
        title="删除提示"
        okText="确认删除"
        :openTipsModal.sync="openDeleteModal"
        @handleChangeFileModal="handleDeleteFileModal"
    >
        <span class="modalTip">{{ props.msg }} </span>
    </tips-modal>
</template>

<script setup>
    import { ref, reactive, toRefs, onBeforeMount, onMounted, watch } from 'vue';
    import { message, Modal } from 'ant-design-vue';
    import TipsModal from './TipsModal.vue';
    import { detaleProject, detaleLightProject } from '@/api/modules/project1';
    import eventBus from '@/utils/eventBus';
    import usePublicDataStore from '@/pinia/modules/public';
    const publicDataStore = usePublicDataStore();
    const props = defineProps({
        msg: {
            type: String,
            default: '确定删除此项目及所有历史版本么？删除后不可恢复',
        },
    });
    const emits = defineEmits(['updateList']);
    const chooseListDetil = ref({});
    const openDeleteModalFn = (val) => {
        chooseListDetil.value = val;
        openDeleteModal.value = true;
    };
    const openDeleteModal = ref(false);
    const handleDeleteFileModal = async (val) => {
        if (val) {
            let res = null;
            if (publicDataStore.headActiveKey == 'light') {
                res = await detaleLightProject(chooseListDetil.value.id);
            } else {
                res = await detaleProject(chooseListDetil.value.id);
            }
            if (res && res.code === 200) {
                message.success('删除成功');
                openDeleteModal.value = false;
                if (chooseListDetil.value.projectStatus == 1) {
                    // 删除后刷新草稿列表数量
                    eventBus.emit('updateDraftCount', true);
                } else {
                    // 删除后刷新项目列表数量
                    eventBus.emit('updateProjectCount', true);
                }
                emits('updateList', val);
            }
        } else {
            openDeleteModal.value = false;
            emits('updateList', val);
        }
    };
    onBeforeMount(() => {});
    onMounted(() => {});

    defineExpose({
        openDeleteModalFn,
    });
</script>
<style scoped lang="less"></style>
