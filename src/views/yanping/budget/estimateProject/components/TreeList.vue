<template>
    <div class="tree-menu" v-if="dataSource.length > 0">
        <div class="container" :style="{ width: sidebarWidth + 'px' }">
            <div class="sidebar" :style="{ width: sidebarWidth + 'px' }">
                <a-tree class="tree-list-self" :style="{'height': height}" showLine v-model:selectedKeys="selectedKeys" :tree-data="normalizedData"
                    :defaultExpandedKeys="defaultExpandedKeys" @expand="expandTree" @rightClick="rightClick"
                    @select="onSelect">
                    <template #title="{ title, dataRef }">
                        <a-dropdown :trigger="['contextmenu']">
                            <span>{{ title }}</span>
                            <template #overlay>
                                <slot name="contextMenu" :dataRef="dataRef"></slot>
                                <!-- <a-menu
                                        class="context-menu"
                                        :style="contextMenuStyle"
                                    >
                                        <template v-if="dataRef.level === 1">
                                            <a-menu-item
                                                key="addChild"
                                                @click="handleMenuClick('addChild', dataRef)"
                                            >
                                                添加子类
                                            </a-menu-item>
                                        </template>
<template v-else>
                                            <a-menu-item
                                                key="edit"
                                                @click="handleMenuClick('edit', dataRef)"
                                            >
                                                编辑名称
                                            </a-menu-item>
                                            <a-menu-item
                                                key="addChild"
                                                @click="handleMenuClick('addChild', dataRef)"
                                            >
                                                添加子类
                                            </a-menu-item>
                                            <a-menu-item
                                                key="addFixed"
                                                @click="handleMenuClick('addFixed', dataRef)"
                                            >
                                                添加定额
                                            </a-menu-item>
                                            <a-menu-item
                                                key="delete"
                                                danger
                                                @click="handleMenuClick('delete', dataRef)"
                                            >
                                                删除
                                            </a-menu-item>
                                        </template>
</a-menu> -->
                            </template>
                        </a-dropdown>
                    </template>
                </a-tree>
            </div>
            <div class="resizer" @mousedown="startResize" v-if="customResize">
                <iconpark-icon class="arrow" name="shuangjiantoushouqi"></iconpark-icon>
            </div>
        </div>
        <div></div>
    </div>
    <div class="tree-empty" v-else>暂无数据</div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { message } from 'ant-design-vue';
const props = defineProps({
    dataSource: {
        type: Array,
        default: () => [],
    },
    customFieldNames: {
        type: Object,
        default: () => {
            return {
                title: 'title',
                key: 'key',
                children: 'children'
            }
        }
    },
    height: {
        type: String,
        default: () => 'calc(90vh - 30px)'
    },
    customResize: {
        type: Boolean,
        default: true
    },
    refName: {
        type: String,
        default: ''
    }
});

const emits = defineEmits(['getChooseSelectKey'])
const selectedKeys = ref([]);
const defaultExpandedKeys = ref([]);
// 合并默认配置和自定义配置
const normalizeNode = (node, fields) => {
    return {
        ...node,
        title: node[fields.title],
        key: node[fields.key],
        children: node[fields.children]?.map(child =>
            normalizeNode(child, fields) // 递归处理子节点
        )
    }
}
// 处理数据
const normalizedData = computed(() => {
    const fields = {
        ...props.customFieldNames
    }
    let result = props.dataSource.map(node =>
        normalizeNode(node, fields) // 从根节点开始处理
    )
    return result
})
const expandTree = (key, e) => {
    emits('getChooseSelectKey', { e: e, isRefresh: false, refName: props.refName })
}
const onSelect = (key, e) => {
    selectedKeys.value = key;
    //  需要其他的值时候，就传e,
    emits('getChooseSelectKey', { e: e, isRefresh: true, refName: props.refName })
};
// 右击
const rightClick = (e) => {
}
// 右键菜单相关
const contextMenuStyle = ref({
    left: '0px',
    top: '0px',
});

// 处理菜单点击
const handleMenuClick = (key, dataRef) => {
    console.log('我就是看看', key, "dataRef", dataRef);

    switch (key) {
        case 'edit':
            message.info(`编辑节点: ${dataRef.title}`);
            break;
        case 'addChild':
            message.info(`添加子类到: ${dataRef.title}`);
            break;
        case 'addFixed':
            message.info(`添加定额到: ${dataRef.title}`);
            break;
        case 'delete':
            message.info(`删除节点: ${dataRef.title}`);
            break;
    }
};
const sidebarWidth = ref(300); // 初始宽度为200px
const minWidth = 300; // 设置最小宽度
const maxWidth = 600; // 设置最大宽度
const isResizing = ref(false);
const startX = ref(0);
const startWidth = ref(0);

const startResize = (event) => {
    isResizing.value = true;
    startX.value = event.clientX;
    startWidth.value = sidebarWidth.value;
    document.addEventListener('mousemove', resize);
    document.addEventListener('mouseup', stopResize);
};

const resize = (event) => {
    if (!isResizing.value) return;
    requestAnimationFrame(() => {
        const currentX = event.clientX;
        const deltaX = currentX - startX.value;
        const newWidth = startWidth.value + deltaX;

        if (newWidth >= minWidth && newWidth <= maxWidth) {
            sidebarWidth.value = newWidth;
        }
    });
};

const stopResize = () => {
    isResizing.value = false;
    document.removeEventListener('mousemove', resize);
    document.removeEventListener('mouseup', stopResize);
};
watch(() => props.dataSource, (nl, ol) => {
    // selectedKeys.value = props.dataSource && props.dataSource.length > 0 ?[props.dataSource[0].id] :[]
    defaultExpandedKeys.value = props.dataSource && props.dataSource.length > 0 ? [props.dataSource[0].id] : []
}, { deep: true, immediate: true })
onMounted(() => {

})
onUnmounted(() => {
    document.removeEventListener('mousemove', resize);
    document.removeEventListener('mouseup', stopResize);
});
defineExpose({
    selectedKeys,
})
</script>

<style scoped lang="scss">
.node-title {
    position: relative;
    display: inline-block;
    padding: 0 4px;
}


/* 防止文本选中 */
.node-title {
    user-select: none;
}

.tree-menu {
    height: calc(100vh - 120px);
    :deep(.ant-tree) {
        height: 100%;
    }
    :deep(.tree-list-self) {
        padding: 15px !important;
        overflow-y: auto;
    }

    :deep(.ant-tree-treenode) {
        padding: 4px 0px;
        border-radius: 4px;
        font-size: 12px;
    }

    :deep(.ant-tree-node-selected) {
        background-color: #E5F0EF;
        color: #036b64;
    }

    :deep(.ant-tree-node-content-wrapper) {
        padding: 0px 12px 0 4px;
    }
}

.container {
    height: 100%;
    display: flex;
    position: relative;
}

.sidebar {
    // padding: 15px;
    transition: width 0.3s ease;
    padding-right: 0;
}

.resizer {
    width: 10px;
    cursor: ew-resize;
    display: flex;
    align-items: center;
    justify-content: center;
}

.arrow {
    transform: rotate(90deg);
}


.content {
    flex-grow: 1;
    // padding: 10px;
}

.tree-empty {
    width: 300px;
    background-color: #fff;
    margin-right: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    height: calc(100vh - 120px);
}
</style>
