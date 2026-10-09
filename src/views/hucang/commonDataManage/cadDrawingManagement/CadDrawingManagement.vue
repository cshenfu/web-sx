<template>
    <div class="template-home-components">
        <h1>
            <iconpark-icon name="fengdian" size="24"></iconpark-icon>
            <i>风电-陆上</i>
        </h1>
        <a-row>
            <a-col
                @click="goJump(0, item)"
                v-for="item in fanTemplateData"
                :span="6"
                class="flex-item"
            >
                <h2>{{ item.count }}</h2>
                <h4>{{ item.title }}</h4>
                <iconpark-icon name="heiyoujiantou"></iconpark-icon>
            </a-col>
        </a-row>
        <h1>
            <iconpark-icon name="guangfu" size="24"></iconpark-icon>
            <i>光伏-陆上</i>
        </h1>
        <a-row>
            <a-col
                @click="goJump(1, item)"
                v-for="item in sunTemplateData"
                class="flex-item"
                :span="6"
            >
                <h2>{{ item.count }}</h2>
                <h4>{{ item.title }}</h4>
                <iconpark-icon name="heiyoujiantou"></iconpark-icon>
            </a-col>
        </a-row>
    </div>
</template>
<style scoped lang="scss">
    .template-home-components {
        padding: 24px;
        background: #ffffff;
        min-height: calc(100vh - 120px);
        h1 {
            display: flex;
            align-items: center;
            font-size: 14px;
            iconpark-icon {
                margin-right: 12px;
            }
            > i {
                font-size: 14px;
                font-weight: 500;
            }
        }
        .flex-item {
            flex: 1;
            background: #f2f7f7;
            border-radius: 4px;
            height: 122px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #3d435d;
            flex-direction: column;
            margin: 16px 24px 16px 0;
            position: relative;
            cursor: pointer;
            &:first-child {
                margin-left: 0;
            }
            &:last-child {
                margin-right: 0;
            }
            h2 {
                font-size: 32px;
                font-weight: bold;
                margin-bottom: 10px;
            }
            > h4 {
                font-size: 12px;
            }
            iconpark-icon {
                position: absolute;
                top: 50%;
                right: 16px;
                margin-top: -4px;
                display: none;
                transition: all linear 0.3s;
            }
            &:hover {
                iconpark-icon {
                    display: block;
                }
                background: url(@/assets/img/template/card-active.png) no-repeat;
                background-size: 100% 100%;
                box-shadow: 0px 2px 25px 0px rgba(27, 51, 112, 0.1);
            }
        }
    }
</style>
<script setup>
    import { reactive } from 'vue';
    import { useRouter } from 'vue-router';
    const router = useRouter();

    const fanTemplateData = reactive([
        {
            title: '资源',
            count: 2,
            type: 0
        },
        {
            title: '电气',
            count: 2,
            type: 1
        },
        {
            title: '线路',
            count: 2,
            type: 2
        },
        {
            title: '道路',
            count: 2,
            type: 3
        },
        {
            title: '土建',
            count: 2,
            type: 3
        },
        {
            title: '施组',
            count: 2,
            type: 3
        }
    ]);
    const sunTemplateData = reactive([
        {
            title: '资源',
            count: 222,
            type: 0
        },
        {
            title: '电气',
            count: 2,
            type: 1
        },
        {
            title: '线路',
            count: 2,
            type: 2
        },
        {
            title: '道路',
            count: 2,
            type: 3
        },
        {
            title: '土建',
            count: 2,
            type: 3
        },
        {
            title: '施组',
            count: 2,
            type: 3
        }
    ]);

    const goJump = (type, item) => {
        router.push({
            path: '/cadDrawwing/list',
            query: {
                type: item.type
            }
        });
    };
</script>
