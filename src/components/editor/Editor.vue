<template>
    <div class="editor-content">
        <div style="border: 1px solid #ccc; width: 100%; overflow-y: hidden; z-index: 111111">
            <Toolbar
                v-if="!readOnly"
                style="border-bottom: 1px solid #ccc"
                :editor="editorRef"
                :defaultConfig="toolbarConfig"
                :mode="mode"
            />
            <Editor
                style="width: 100%"
                :defaultContent="defaultContent"
                :style="{ height: height }"
                v-model="valueHtml"
                :defaultConfig="editorConfig"
                :mode="mode"
                @onCreated="handleCreated"
                @onChange="change"
                @onBlur="blur"
            />
        </div>
    </div>
</template>
<script setup>
    import '@wangeditor/editor/dist/css/style.css';
    import { Editor, Toolbar } from '@wangeditor/editor-for-vue';
    import { ref, shallowRef, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
    import { useOssUpload } from '@/components/ossClient/index';

    const props = defineProps({
        id: {
            type: String,
            default: '',
        },
        dataHtml: {
            type: String,
            default: '',
        },
        height: {
            type: String,
            default: '300px',
        },
        // 是否只读
        readOnly: {
            type: Boolean,
            default: false,
        },
        zIndexSelf: {
            type: Number,
            default: 1001,
        },
    });

    // 全组件共用一个上传/签名实例
    const obsUpload = useOssUpload();

    let isInternalUpdate = false;

    // 数据处理核心函数：只清理 p 标签内的 span，保留 img / 其他所有内容
    const formatHtmlContent = (html) => {
        if (!html) return '';

        let processedHtml = html;

        // ========== 清理 ${} 中的多余标签（保留原有功能）==========
        processedHtml = processedHtml.replace(
            /\$\{([\s\S]*?)\}/g,
            (match, content) => {
                const pureVarName = content.replace(/<[^>]*>/g, '').trim();
                return `\${${pureVarName}}`;
            },
        );

        // ========== 只移除 <p> 内的 <span> 标签，保留内容 + 保留 img ==========
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = processedHtml;

        const pTags = tempDiv.querySelectorAll('p');
        pTags.forEach((p) => {
            // 找到 p 里面所有 span
            const spans = p.querySelectorAll('span');

            // 倒序删除，避免 DOM 遍历异常
            Array.from(spans)
                .reverse()
                .forEach((span) => {
                    // 删除 span 标签，但把里面的内容留在原地
                    span.replaceWith(...span.childNodes);
                });
        });

        // 获取处理完的 HTML
        processedHtml = tempDiv.innerHTML;

        // 额外优化
        processedHtml = processedHtml
            .replace(/\n+/g, '\n')
            .replace(/\s+/g, ' ')
            .trim();

        return processedHtml;
    };

    // 判断一个 src 是不是我们自己存储服务上的图片（避免误伤用户粘贴的外部图片链接）
    const isOwnStorageUrl = (src) => {
        if (!src) return false;
        return (
            src.includes('rustfs.wh-ge.com') ||
            src.includes('myhuaweicloud.com') ||
            src.includes('aliyuncs.com')
        );
    };

    // 从完整 URL（带签名参数）中提取出对象 key，用于存库
    // 兼容 path-style（如 rustfs：endpoint/bucket/key）
    const extractKeyFromUrl = (url) => {
        try {
            const u = new URL(url);
            let path = decodeURIComponent(u.pathname).replace(/^\/+/, '');
            const parts = path.split('/');
            if (parts.length > 1) {
                parts.shift(); // 去掉桶名（path-style 的第一段）
            }
            return parts.join('/');
        } catch {
            return '';
        }
    };

    // 存库前：把 html 里我们自己存储服务的 img（无论当前是签名 URL 还是裸 key）
    // 统一转换成裸 key，避免把带有效期的签名参数存进数据库
    const stripSignedUrlsForStorage = (html) => {
        if (!html) return html;

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;

        const imgs = tempDiv.querySelectorAll('img');
        imgs.forEach((img) => {
            const src = img.getAttribute('src') || '';
            if (!isOwnStorageUrl(src)) return;

            const key = extractKeyFromUrl(src);
            if (key) {
                img.setAttribute('src', key);
            }
        });

        return tempDiv.innerHTML;
    };

    // 展示前：把 html 里所有裸 key 的 img，批量换成当次有效的签名 URL
    const resolveSignedUrlsForDisplay = async (html) => {
        if (!html) return html;

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;

        const imgs = Array.from(tempDiv.querySelectorAll('img'));
        await Promise.all(
            imgs.map(async (img) => {
                const src = img.getAttribute('src') || '';
                if (!src) return;
                // 已经是完整 http(s) 链接（外部图片，或已经带签名），不重复处理
                if (/^https?:\/\//i.test(src)) return;

                const signedUrl = await obsUpload.getFileUrl(src);
                if (signedUrl) {
                    img.setAttribute('src', signedUrl);
                }
            }),
        );

        return tempDiv.innerHTML;
    };

    const handleFullscreen = (event) => {
        console.log('进入了全屏模式', event);
        // 在这里可以执行你需要的操作
    };
    const emit = defineEmits(['update:dataHtml', 'blur']);
    const editorRef = shallowRef();
    const mode = ref('default');
    const valueHtml = ref(props.dataHtml);

    // 回显：外部 dataHtml 变化时，将裸 key 转换为当前有效的签名 URL。
    // 必须放在相关函数和 valueHtml 初始化之后，避免 immediate 回调访问未初始化变量。
    watch(
        () => props.dataHtml,
        async (newVal) => {
            if (isInternalUpdate) return;
            const formattedHtml = formatHtmlContent(newVal);
            valueHtml.value = await resolveSignedUrlsForDisplay(formattedHtml);
        },
        { immediate: true },
    );

    const toolbarConfig = {
        excludeKeys: ['insertVideo', 'uploadVideo', 'editVideoSize', 'emotion'],
    };
    const defaultContent = [
        {
            type: 'paragraph',
            lineHeight: '1.5',
            children: [{ text: '', fontFamily: '宋体', fontSize: '12px' }],
        },
    ];
    const editorConfig = ref({
        placeholder: '请输入描述',
        readOnly: props.readOnly,
        MENU_CONF: {
            fontSize: {
                fontSizeList: [
                    '12px',
                    '14px',
                    '18px',
                    '20px',
                    '22px',
                    '24px',
                    '26px',
                    '28px',
                    '30px',
                    '40px',
                ],
            },
            uploadImage: {
                async customUpload(file, insertFn) {
                    await uploadImage(file).then((res) => {
                        insertFn(res, file.name, '');
                    });
                },
            },
        },
    });

    // 上传图片：私有桶上传 + 立即取一个签名 URL 用于编辑器内展示
    // 存库时会由 stripSignedUrlsForStorage 统一转换回裸 key，避免签名过期后失效
    const uploadImage = async (file) => {
        // 生成唯一文件名，避免同名文件互相覆盖
        const ext = file.name.split('.').pop() || 'png';
        const uniqueFileName = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const uniqueFile = new File([file], uniqueFileName, { type: file.type });

        const result = await obsUpload.uploadFile(uniqueFile);
        if (!result || !result.obsPath) {
            throw new Error('图片上传失败');
        }

        // 私有桶，需要签名 URL 才能立即在编辑器里显示
        const signedUrl = await obsUpload.getFileUrl(result.obsPath);
        if (!signedUrl) {
            throw new Error('获取图片访问地址失败');
        }

        return signedUrl;
    };

    onMounted(() => {
        nextTick(() => {
            // console.log('editor.getAllMenuKeys()',editorRef.value.getEditableContainer());
        });
    });

    onBeforeUnmount(() => {
        // const editor = editorRef.value;
        if (editorRef.value == null) return;
        editorRef.value.destroy();
        // editorRef.destroy();
    });
    const handleCreated = (editor) => {
        editorRef.value = editor; // 记录 editor 实例，重要！
    };
    // change 和 blur 里 emit 前先设标志，nextTick 后复位
    // emit 之前先把签名 URL 还原成裸 key，避免存库内容里带有效期的签名参数
    const change = () => {
        const text = editorRef.value.getText();
        const isEmpty = editorRef.value.isEmpty();
        isInternalUpdate = true;
        if (text || !isEmpty) {
            const cleanHtml = stripSignedUrlsForStorage(escape2Html(valueHtml.value));
            emit('update:dataHtml', cleanHtml);
        } else {
            emit('update:dataHtml', '');
        }
        nextTick(() => {
            isInternalUpdate = false;
        });
    };

    const blur = () => {
        const isEmpty = editorRef.value.isEmpty();
        isInternalUpdate = true;
        if (!isEmpty) {
            const cleanHtml = stripSignedUrlsForStorage(escape2Html(valueHtml.value));
            emit('blur', cleanHtml);
        } else {
            emit('blur', '');
        }
        nextTick(() => {
            isInternalUpdate = false;
        });
    };
    const escape2Html = (str) => {
        let arrEntities = { lt: '<', gt: '>', nbsp: ' ', amp: '&', quot: '"' };
        return str.replace(/&(lt|gt|nbsp|amp|quot);/gi, function (all, t) {
            return arrEntities[t];
        });
    };
    defineExpose({
        editorRef,
    });
</script>
<style lang="scss">
    .editor-content {
        position: relative;
        // :deep(.w-e-toolbar .w-e-bar-item:last-child .w-e-menu-tooltip-v5) {
        //   display: none;
        // }
    }
</style>