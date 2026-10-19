<template>
    <div class="template-preview">
        <!-- 顶部工具栏 -->
        <div class="preview-toolbar">
            <div class="mode-tabs">
                <span
                    class="tab-item"
                    :class="{ active: mode === 'outline' }"
                    @click="mode = 'outline'"
                >大纲模式</span>
                <span
                    class="tab-item"
                    :class="{ active: mode === 'page' }"
                    @click="mode = 'page'"
                >页面模式</span>
            </div>
            <div class="page-nav">
                <span class="nav-btn" @click="prevPage" :class="{ disabled: currentPage <= 1 }">‹</span>
                <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
                <span class="nav-btn" @click="nextPage" :class="{ disabled: currentPage >= totalPages }">›</span>
            </div>
        </div>

        <div class="preview-body">
            <!-- 左侧缩略图 -->
            <div class="preview-sidebar">
                <div
                    v-for="page in totalPages"
                    :key="page"
                    class="thumb-item"
                    :class="{ active: currentPage === page }"
                    @click="currentPage = page"
                >
                    <div class="thumb-img">
                        <!-- 可替换为实际缩略图 -->
                        <span class="thumb-page-num">{{ page }}</span>
                    </div>
                </div>
            </div>

            <!-- 右侧内容区 -->
            <div class="preview-content">
                <div class="page-container">
                    <!-- 根据实际内容替换，例如渲染 HTML/PDF -->
                    <div class="page-placeholder">
                        <p>模版 ID：{{ templateId }}</p>
                        <p>当前第 {{ currentPage }} 页</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const templateId = ref(route.query.id);
const quotaCatalogId = ref(route.query.quotaCatalogId);

const mode = ref('page'); // 'outline' | 'page'
const currentPage = ref(1);
const totalPages = ref(18); // 从接口获取实际总页数

const prevPage = () => {
    if (currentPage.value > 1) currentPage.value--;
};
const nextPage = () => {
    if (currentPage.value < totalPages.value) currentPage.value++;
};

onMounted(() => {
    // 根据 templateId 加载模版数据
    // loadTemplateData(templateId.value);
});
</script>

<style scoped lang="scss">
.template-preview {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: #f0f2f5;
}

.preview-toolbar {
    display: flex;
    align-items: center;
    gap: 24px;
    padding: 12px 24px;
    background: #fff;
    border-bottom: 1px solid #e8e8e8;

    .mode-tabs {
        display: flex;
        gap: 4px;

        .tab-item {
            padding: 4px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            color: #666;
            border: 1px solid #d9d9d9;

            &.active {
                background: #1890ff;
                color: #fff;
                border-color: #1890ff;
            }
        }
    }

    .page-nav {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;

        .nav-btn {
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid #d9d9d9;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
            user-select: none;

            &.disabled {
                opacity: 0.4;
                cursor: not-allowed;
            }
        }

        .page-info {
            min-width: 60px;
            text-align: center;
        }
    }
}

.preview-body {
    display: flex;
    flex: 1;
    overflow: hidden;
}

.preview-sidebar {
    width: 160px;
    background: #fff;
    border-right: 1px solid #e8e8e8;
    overflow-y: auto;
    padding: 12px 8px;
    display: flex;
    flex-direction: column;
    gap: 8px;

    .thumb-item {
        cursor: pointer;
        border: 2px solid transparent;
        border-radius: 4px;
        padding: 4px;

        &.active {
            border-color: #1890ff;
        }

        .thumb-img {
            width: 100%;
            aspect-ratio: 3/4;
            background: #f5f5f5;
            border: 1px solid #d9d9d9;
            border-radius: 2px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .thumb-page-num {
            font-size: 12px;
            color: #999;
        }
    }
}

.preview-content {
    flex: 1;
    overflow-y: auto;
    display: flex;
    justify-content: center;
    padding: 32px;

    .page-container {
        width: 794px; // A4 宽度
        background: #fff;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
        min-height: 1123px; // A4 高度
        padding: 60px;
    }
}
</style>