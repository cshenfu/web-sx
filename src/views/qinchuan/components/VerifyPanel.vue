<template>
  <transition name="verify-slide">
    <aside v-if="visible" class="verify-panel">
      <div class="verify-header">
        <span class="verify-title">核查信息</span>
        <div class="verify-actions">
          <el-button size="small" :disabled="saving" @click="handleCancel">
            取消
          </el-button>
          <el-button
            size="small"
            type="primary"
            :loading="saving"
            @click="handleSave"
          >
            保存
          </el-button>
        </div>
      </div>

      <div class="verify-body">
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-position="top"
          size="small"
          class="verify-form"
        >
          <el-form-item label="地貌特征" prop="landformFeature">
            <el-input
              v-model="form.landformFeature"
              placeholder="如：黄土高原沟壑"
              clearable
            />
          </el-form-item>

          <el-form-item label="地貌类型" prop="horstType">
            <el-input
              v-model="form.horstType"
              placeholder="如：园地"
              clearable
            />
          </el-form-item>

          <el-form-item label="是否敏感" prop="isSensitive">
            <el-radio-group v-model="form.isSensitive">
              <el-radio :label="0">否</el-radio>
              <el-radio :label="1">是</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="核查结论" prop="verificationConclusion">
            <el-input
              v-model="form.verificationConclusion"
              type="textarea"
              :rows="3"
              placeholder="请输入核查结论"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>

          <p class="verify-desc">
            拟选场址范围及附近不涉及新版生态红线、环境保护、基本农田、林地禁区、压覆矿产、文物古迹、军事等限制项目开发的敏感性因素。
          </p>

          <el-form-item label="附件" prop="attachments" class="verify-attachment-item">
            <el-upload
              v-model:file-list="form.attachments"
              :auto-upload="false"
              :limit="5"
              accept=".pdf,.doc,.docx"
              multiple
              class="verify-upload"
            >
              <el-button type="primary" link>上传附件</el-button>
            </el-upload>
            <div class="verify-upload-tip">
              <span class="danger">严禁上传国家秘密文件，违规必究</span>
              <span class="verify-upload-hint">支持pdf/docx文件格式（最多上传5个）</span>
            </div>
          </el-form-item>
        </el-form>
      </div>
    </aside>
  </transition>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { updateInfo } from '@/api/modules/selectConfig'

const props = defineProps({
  visible: { type: Boolean, default: false },
  project: { type: Object, default: null },
})

const emit = defineEmits(['close', 'save'])

const formRef = ref(null)
const saving = ref(false)

const form = ref({
  landformFeature: '',
  horstType: '',
  isSensitive: 0, // 0-否 1-是
  verificationConclusion: '',
  attachments: [],
})

// 是否敏感：选了"是" → 相关字段必填
const isSensitiveYes = computed(() => form.value.isSensitive === 1)

// 动态校验规则
const rules = computed(() => {
  const r = {
    isSensitive: [
      { required: true, message: '请选择是否敏感', trigger: 'change' },
    ],
  }
  if (isSensitiveYes.value) {
    r.landformFeature = [
      { required: true, message: '请输入地貌特征', trigger: 'blur' },
    ]
    r.horstType = [
      { required: true, message: '请输入地貌类型', trigger: 'blur' },
    ]
    r.verificationConclusion = [
      { required: true, message: '请输入核查结论', trigger: 'blur' },
    ]
  }
  return r
})

// 每次打开时从项目读初始值
watch(
  () => props.visible,
  (val) => {
    if (val && props.project) {
      form.value = {
        landformFeature: props.project.landformFeature || '',
        horstType: props.project.horstType || '',
        isSensitive:
          props.project.isSensitive === 1 ||
          props.project.isSensitive === true ||
          props.project.isSensitive === '1'
            ? 1
            : 0,
        verificationConclusion: props.project.verificationConclusion || '',
        attachments: Array.isArray(props.project.verificationAttachments)
          ? props.project.verificationAttachments.map((f, i) => ({
              name: f.fileName || `附件${i + 1}`,
              url: f.filePath || '',
              raw: f,
            }))
          : [],
      }
      setTimeout(() => formRef.value?.clearValidate(), 0)
    }
  }
)

// 切换"是否敏感"时，实时清除校验红字
watch(
  () => form.value.isSensitive,
  () => {
    if (formRef.value) {
      formRef.value.clearValidate([
        'landformFeature',
        'horstType',
        'verificationConclusion',
      ])
    }
  }
)

async function handleSave() {
  if (!props.project?.id) {
    ElMessage.error('缺少项目信息，无法保存')
    return
  }

  try {
    await formRef.value.validate()
  } catch {
    return
  }

  const sensitive = form.value.isSensitive === 1

const payload = {
  id: props.project.id,
  isVerified: 0,
  isSensitive: form.value.isSensitive,
  landformFeature: form.value.landformFeature || '',
  horstType: form.value.horstType || '',
  verificationConclusion: sensitive ? form.value.verificationConclusion : '',
  verificationAttachments: [],
}

  saving.value = true
  try {
    const res = await updateInfo(payload)
    if (res?.code === 200) {
      ElMessage.success('核查信息已保存')
      emit('save', { ...payload })
    } else {
      ElMessage.error(res?.msg || '保存失败')
    }
  } catch (err) {
    ElMessage.error(err?.message || '保存失败')
  } finally {
    saving.value = false
  }
}

function handleCancel() {
  emit('close')
}
</script>

<style scoped>
/* ---- 面板主体 ---- */
.verify-panel {
  position: fixed;
  top: 65px;
  right: 0;
  bottom: 0;
  width: 400px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  background: #fff;
  box-shadow: -4px 0 16px rgba(0, 0, 0, 0.08);
}

/* ---- 头部 ---- */
.verify-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 52px;
  padding: 0 16px;
  border-bottom: 1px solid #ebeef5;
}

.verify-title {
  color: #303133;
  font-size: 14px;
  font-weight: 600;
}

.verify-actions {
  display: flex;
  gap: 8px;
}

/* ---- 内容区 ---- */
.verify-body {
  flex: 1;
  padding: 16px;
  overflow: auto;
}

.verify-form :deep(.el-form-item) {
  margin-bottom: 16px;
}

.verify-form :deep(.el-form-item__label) {
  padding-bottom: 4px;
  color: #606266;
  font-size: 12px;
  font-weight: 500;
}

/* ---- 描述文字 ---- */
.verify-desc {
  padding: 10px 12px;
  margin: 8px 0 16px;
  color: #909399;
  font-size: 12px;
  line-height: 1.7;
  background: #f7f8fa;
  border-radius: 4px;
}

/* ---- 附件 ---- */
.verify-attachment-item :deep(.el-form-item__content) {
  display: block;
}

.verify-upload {
  display: inline-block;
}

.verify-upload-tip {
  margin-top: 6px;
  font-size: 12px;
  line-height: 1.8;
}

.verify-upload-tip .danger {
  color: #f56c6c;
}

.verify-upload-tip .verify-upload-hint {
  display: block;
  color: #909399;
}

/* ---- 过渡动画 ---- */
.verify-slide-enter-active,
.verify-slide-leave-active {
  transition: transform 0.25s ease;
}

.verify-slide-enter-from,
.verify-slide-leave-to {
  transform: translateX(100%);
}
</style>