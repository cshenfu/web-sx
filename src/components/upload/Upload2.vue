<template>
    <div class="omni-uploader">
      <input
        ref="inputRef"
        type="file"
        :accept="accept"
        :multiple="maxCount > 1"
        style="display: none"
        @change="onFileChange"
      />
  
      <!-- 多文件模式 -->
      <template v-if="maxCount > 1">
        <div class="multi-upload-list">
          <div
            v-for="(file, idx) in multiFiles"
            :key="idx"
            class="uploaded-name"
            @click="downloadFile(file)"
          >
            <el-icon style="color: #67c23a"><CircleCheckFilled /></el-icon>
            {{ file.fileName || file.name }}
            <!-- 移除按钮加 .stop -->
            <el-icon class="remove-btn" @click.stop="handleRemoveMulti(idx)"><Close /></el-icon>
          </div>
  
          <div v-if="uploading && showProgress" class="upload-progress">
            <el-progress :percentage="uploadProgress" :stroke-width="6" />
          </div>
  
          <div class="uploader-row">
            <el-button
              v-if="multiFiles.length < maxCount"
              type="primary"
              plain
              :size="size"
              :loading="uploading"
              :icon="UploadFilled"
              :disabled="disabled"
              @click="triggerFileSelect"
            >
              {{ buttonText }}
            </el-button>
            <!-- 行内错误提示（多文件模式） -->
            <span v-if="inlineError" class="inline-error">{{ inlineError }}</span>
          </div>
        </div>
  
        <div v-if="hint" class="upload-hint">{{ hint }}</div>
        <div v-if="errorMsg" class="upload-error">{{ errorMsg }}</div>
      </template>
  
      <!-- 单文件模式（原有逻辑） -->
  
  
  
  
  
  
      <template v-else>
        <div class="uploader-row">
          <el-button
            type="primary"
            plain
            :size="size"
            :loading="uploading"
            :icon="UploadFilled"
            :disabled="disabled"
            :title="disabled ? '请先上传场区范围文件' : ''"
            @click="triggerFileSelect"
          >
            {{ buttonText }}
          </el-button>
  
          <span v-if="uploadedName" class="uploaded-name" @click="downloadCurrent">
            <el-icon style="color: #67c23a"><CircleCheckFilled /></el-icon>
            {{ uploadedName }}
            <!-- 移除按钮加 .stop -->
            <el-icon class="remove-btn" @click.stop="handleRemove"><Close /></el-icon>
          </span>
  
          <!-- 行内错误提示（单文件模式），文件移除后在按钮右侧显示 -->
          <span v-if="inlineError && !uploadedName" class="inline-error">{{ inlineError }}</span>
        </div>
  
        <div v-if="uploading && showProgress" class="upload-progress">
          <el-progress :percentage="uploadProgress" :stroke-width="6" />
        </div>
  
        <div v-if="hint" class="upload-hint">{{ hint }}</div>
        <div v-if="errorMsg" class="upload-error">{{ errorMsg }}</div>
      </template>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from "vue";
  import { ElMessage } from "element-plus";
  import { UploadFilled, CircleCheckFilled, Close } from "@element-plus/icons-vue";
  import {
    getObjectKeyByUserName,
    getObjectKeyByProjectId,
    uploadFile,
    downloadByObjectKey,
    getTempUrl
  } from "@/api/modules/upload";
  
  const props = defineProps({
    modelValue: {
      type: [Object, Array],
      default: null,
    },
    accept: {
      type: String,
      required: true,
    },
    bizType: {
      type: String,
      default: "",
    },
    userName: {
      type: String,
      default: "",
    },
    projectId: {
      type: [Number, String],
      default: null,
    },
    namePrefix: {
      type: String,
      default: "upload",
    },
    buttonText: {
      type: String,
      default: "点击上传",
    },
    size: {
      type: String,
      default: "default",
    },
    hint: {
      type: String,
      default: "",
    },
    maxSizeMB: {
      type: Number,
      default: 100,
    },
    showProgress: {
      type: Boolean,
      default: false,
    },
    returnRawResponse: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    // 大于 1 时启用多文件模式，表示最多可上传的文件数
    maxCount: {
      type: Number,
      default: 0,
    },
    // 外部传入的行内错误提示（由父组件在校验失败后设置，显示在按钮右侧）
    inlineError: {
      type: String,
      default: "",
    },
  });
  
  const emit = defineEmits(["update:modelValue", "success", "error", "remove", "start", "end"]);
  
  const effectiveUserName = computed(() => {
    return props.userName || sessionStorage.getItem("userName") || "anonymous";
  });
  
  // 单文件模式：显示已上传的文件名
  const uploadedName = computed(() => {
    if (!props.modelValue || Array.isArray(props.modelValue)) return "";
    return props.modelValue.fileName || props.modelValue.name || "";
  });
  
  // 多文件模式：已上传文件列表
  const multiFiles = computed(() => {
    if (!props.modelValue || !Array.isArray(props.modelValue)) return [];
    return props.modelValue;
  });
  
  const inputRef = ref(null);
  const uploading = ref(false);
  const uploadProgress = ref(0);
  const errorMsg = ref("");
  
  const triggerFileSelect = () => {
    if (props.disabled) return;
    if (inputRef.value) {
      inputRef.value.click();
    }
  };
  
  const validateExtension = (file) => {
    if (!props.accept) return true;
  
    const allowedExts = props.accept
      .split(",")
      .map((s) => s.trim().replace(/^\./, "").toLowerCase());
  
    const fileExt = file.name.split(".").pop().toLowerCase();
    const isValid = allowedExts.includes(fileExt);
  
    if (!isValid) {
      errorMsg.value = `文件格式不符合要求，仅支持 ${props.accept}`;
      ElMessage.warning(errorMsg.value);
    }
  
    return isValid;
  };
  
  const validateSize = (file) => {
    const maxSize = props.maxSizeMB * 1024 * 1024;
    const isValid = file.size <= maxSize;
  
    if (!isValid) {
      errorMsg.value = `文件不能超过 ${props.maxSizeMB}MB，当前文件 ${(file.size / 1024 / 1024).toFixed(2)}MB`;
      ElMessage.warning(errorMsg.value);
    }
  
    return isValid;
  };
  
  const getObjectKey = async (file) => {
    const prefix = file.name;
  
    let objectKey = "";
  
    if (props.projectId) {
      const res = await getObjectKeyByProjectId(prefix, props.projectId);
      objectKey = res?.data || res;
    } else {
      const res = await getObjectKeyByUserName(prefix, effectiveUserName.value);
      objectKey = res?.data || res;
    }
  
    if (!objectKey || typeof objectKey !== "string") {
      throw new Error(`获取 objectKey 失败: ${JSON.stringify(objectKey)}`);
    }
  
    return objectKey;
  };
  
  const uploadFileToServer = async (objectKey, file) => {
    console.log(file)
    if (props.showProgress) {
      const interval = setInterval(() => {
        if (uploadProgress.value < 90) {
          uploadProgress.value += 10;
        }
      }, 200);
  
      try {
        const uploadRes = await uploadFile(objectKey, file);
        clearInterval(interval);
        uploadProgress.value = 100;
        return uploadRes;
      } catch (err) {
        clearInterval(interval);
        throw err;
      }
    } else {
      return await uploadFile(objectKey, file);
    }
  };
  
  const buildFileDto = (uploadRes, file, objectKey) => {
    const responseData = uploadRes?.data || uploadRes;
    const uploadResult = responseData;
  
    return {
      fileType: props.bizType,
      fileName: file.name,
      filePath: uploadResult?.key || objectKey,
      fileSuffix: file.name.includes(".") ? file.name.split(".").pop().toLowerCase() : "",
      url: uploadResult?.url || "",
      size: uploadResult?.size || file.size,
      mimeType: uploadResult?.mimeType || file.type || "",
      objectKey: objectKey,
    };
  };
  
  // 上传单个文件的核心逻辑（内部复用）
  const uploadSingleFile = async (file) => {
    if (!validateExtension(file)) return null;
    if (!validateSize(file)) return null;
  
    const objectKey = await getObjectKey(file);
    const uploadRes = await uploadFileToServer(objectKey, file);
  
    const result = props.returnRawResponse
      ? { response: uploadRes, file, objectKey }
      : buildFileDto(uploadRes, file, objectKey);
  
    return { result, file, uploadRes };
  };
  
  const onFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
  
    // 清空 input，允许重复选同一文件
    if (inputRef.value) {
      inputRef.value.value = "";
    }
  
    if (!files.length) return;
  
    errorMsg.value = "";
    uploadProgress.value = 0;
    uploading.value = true;
    emit("start");
    // ── 多文件模式：依次上传所有选中文件 ──
    if (props.maxCount > 1) {
      const remaining = props.maxCount - (Array.isArray(props.modelValue) ? props.modelValue.length : 0);
      const toUpload = files.slice(0, remaining); // 超出上限的静默截断
  
      let accumulated = Array.isArray(props.modelValue) ? [...props.modelValue] : [];
  
      // 包一层 try/finally，保证无论成功/失败都触发 end
      try {
        for (const file of toUpload) {
          try {
            const res = await uploadSingleFile(file);
            if (!res) continue;
            accumulated = [...accumulated, res.result];
            emit("update:modelValue", accumulated);
            emit("success", res.result, res.file, res.uploadRes);
            ElMessage.success(`文件 "${file.name}" 上传成功`);
          } catch (err) {
            errorMsg.value = err.message || "上传失败，请重试";
            ElMessage.error(`文件 "${file.name}" 上传失败：${errorMsg.value}`);
            emit("error", err, file);
          }
        }
      } finally {
        // 所有文件处理完毕，重置状态 + 触发 end
        if (props.showProgress) {
          setTimeout(() => { uploadProgress.value = 0; }, 1000);
        }
        uploading.value = false;
        emit("end");
      }
      return;
    }
  
    // ── 单文件模式：只处理第一个文件 ──
    const file = files[0];
    try {
      const res = await uploadSingleFile(file);
      if (!res) { uploading.value = false; return; }
  
      emit("update:modelValue", res.result);
      emit("success", res.result, res.file, res.uploadRes);
      ElMessage.success(`文件 "${file.name}" 上传成功`);
  
      if (props.showProgress) {
        setTimeout(() => { uploadProgress.value = 0; }, 1000);
      }
    } catch (err) {
      errorMsg.value = err.message || "上传失败，请重试";
      ElMessage.error(errorMsg.value);
      emit("error", err, file);
      uploadProgress.value = 0;
    } finally {
      uploading.value = false;
      emit("end");
    }
  };
  
  // 单文件模式移除
  const handleRemove = () => {
    emit("update:modelValue", null);
    emit("remove");
    errorMsg.value = "";
    uploadProgress.value = 0;
    ElMessage.info("已移除文件");
  };
  
  // 多文件模式移除指定索引
  const handleRemoveMulti = (idx) => {
    const current = Array.isArray(props.modelValue) ? [...props.modelValue] : [];
    const removed = current.splice(idx, 1);
    emit("update:modelValue", current);
    emit("remove", removed[0], idx);
    errorMsg.value = "";
    ElMessage.info("已移除文件");
  };
  
  
  // 单文件下载
  const downloadCurrent = () => {
    const fileObj = props.modelValue;
    console.log(fileObj)
    if (fileObj?.filePath) {
      downloadFile(fileObj);
    } else {
      ElMessage.warning('文件信息不完整，无法下载');
    }
  };
  
  // 通用下载函数
  const downloadFile = async (fileObj) => {
    if (!fileObj) {
      ElMessage.warning('文件信息为空');
      return;
    }
  
    // 提取 key（优先 objectKey，其次 filePath，兼容不同字段）
    const key = fileObj.objectKey || fileObj.filePath;
    if (!key) {
      ElMessage.warning('未找到文件标识');
      return;
    }
  
    try {
      // 1. 获取临时下载 URL
      const res = await getTempUrl(key);
      // 根据你的接口返回结构，提取 URL（常见为 res.data 或 res.url）
      const url = res?.data || res?.url;
      if (!url) {
        ElMessage.error('获取下载链接失败');
        return;
      }
  
      // 2. 打开链接（浏览器会直接下载或预览）
      // 方式一：新窗口打开（适用于浏览器能预览的文件如 PDF、图片）
      window.open(url, '_blank');
  
      // 方式二：强制下载（若同源，可使用 a 标签 download）
      // const link = document.createElement('a');
      // link.href = url;
      // link.download = fileObj.fileName || fileObj.name || '下载文件';
      // document.body.appendChild(link);
      // link.click();
      // document.body.removeChild(link);
    } catch (error) {
      console.error('获取下载链接失败', error);
      ElMessage.error('下载文件失败，请重试');
    }
  };
  
  defineExpose({
    triggerFileSelect,
    clearFile: handleRemove,
  });
  </script>
  
  <style scoped>
  .omni-uploader {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
  }
  
  .uploader-row {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }
  
  .multi-upload-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .uploaded-name {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: #67c23a;
    max-width: 300px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    background: #f0f9eb;
    padding: 4px 8px;
    border-radius: 4px;
    line-height: 1;
    cursor: pointer;
  }
  
  .uploaded-name .el-icon:first-child {
    flex-shrink: 0;
  }
  
  .remove-btn {
    cursor: pointer;
    color: #c0c4cc;
    flex-shrink: 0;
    margin-left: 4px;
    transition: color 0.2s;
  }
  
  .remove-btn:hover {
    color: #f56c6c;
  }
  
  .upload-progress {
    width: 100%;
    max-width: 300px;
  }
  
  .upload-hint {
    font-size: 12px;
    color: #909399;
    line-height: 1.5;
  }
  
  .upload-error {
    font-size: 12px;
    color: #f56c6c;
    line-height: 1.5;
  }
  
  /* 行内错误提示：显示在上传按钮右侧 */
  .inline-error {
    font-size: 12px;
    color: #f56c6c;
    line-height: 1.5;
    white-space: nowrap;
  }
  
  @media (max-width: 768px) {
    .uploaded-name {
      max-width: 200px;
      font-size: 12px;
    }
  }
  </style>
  