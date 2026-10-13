<template>
    <div class="calculation-settings">
        <p>流场发电量模型</p>
        <a-radio-group v-model:value="model" @change="changeModelFn">
            <a-radio :value="1">A1.0</a-radio>
            <a-radio :value="2">H1.0</a-radio>
        </a-radio-group>
    </div>
</template>

<script setup>
    import { ref, reactive, toRefs, onBeforeMount, onMounted, watch, computed } from 'vue';
    import { useRoute, useRouter } from 'vue-router';
    import {changeModel} from '@/api/modules/projectManage'
import { message } from 'ant-design-vue';
    const props = defineProps({
        activeModel: {
            type: Number,
        },
    });
    const route = useRoute();
    const model = ref(2);
    const changeModelFn = async()=> {
        try {
            let data = {
                model: model.value,
                projectId: route.query.id,
            }
            let res = await changeModel(data)
            if(res.code ==200 && res.data) {
                console.log(res.data)
                message.success('模型切换成功')
            }
        }catch(err){

        }
    }
    watch(() => props.activeModel, (val) => {
        model.value = val;
    })
    onBeforeMount(() => {
        model.value = props.activeModel;
    });
    onMounted(() => {});
</script>
<style scoped lang="scss">
    .calculation-settings {
        display: flex;
        align-items: center;
        padding-bottom: 200px;
        p {
            margin-right: 24px;
        }
    }
</style>
