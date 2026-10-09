<template>
    <div class="text-field-components">
        <Toolbar
            style="border-bottom: 1px solid #ccc"
            :editor="editorRef"
            :defaultConfig="toolbarConfig"
            :mode="mode"
        />
        <Editor
            style="height: 400px; overflow-y: hidden"
            v-model="valueHtml"
            :defaultConfig="editorConfig"
            :mode="mode"
            @onCreated="handleCreated"
            @onBlur="getContent"
        />
    </div>
    <!-- <button @click="getValue">获取内容</button> -->
</template>
<script setup>
    import '@wangeditor/editor/dist/css/style.css';
    import { Editor, Toolbar } from '@wangeditor/editor-for-vue';
    import { reactive, ref, shallowRef } from 'vue';
    const editor = ref(null);
    const html = ref('<p>1111</p>');
    const toolbarConfig = reactive({});
    const editorConfig = reactive({
        placeholder: '请输入内容',
        MENU_CONF: {
            uploadImage: {
                customUpload(file, insertFn) {
                    // 华为云上传文件逻辑
                    console.log(file);
                    insertFn('https://henry-test1.obs.cn-east-3.myhuaweicloud.com/one-step/point-file/9.jpeg','图片', '链接');
                }
            }
        }
    });
    const mode = ref('default');

    const onCreated = (editor) => {};
    const editorRef = shallowRef();
    const handleCreated = (editor) => {
        editorRef.value = editor;
    };

    // 获取内容
    const getValue = () => {
        console.log(editorRef.value);
    };
    editorConfig.onchange = (editor) => {
        console.log('content', editor.children);
    };
    const getContent = (editor) => {
        console.log(editor);
    };
</script>
<style scoped lang="scss">
    .text-field-components {
        background: #fafafa;
        border: 1px solid #e4e6ee;
    }
</style>
