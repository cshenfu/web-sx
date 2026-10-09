<!-- components/area-panel/AddImageDialog.vue -->
<!-- 追加测风塔图片：选中某个测风塔文件后，为其追加一张或多张图片。
     调用 addItemImg(towerFileId, imageList) 提交。 -->
     <template>
        <el-dialog
          :model-value="visible"
          title="追加测风塔图片"
          width="480px"
          :close-on-click-modal="false"
          @update:model-value="handleVisibleChange"
          @closed="handleClosed"
        >
          <div class="add-image-form">
            <div class="form-row">
              <span class="form-label">测风塔文件</span>
              <span class="file-name" :title="towerFileName">{{ towerFileName || '-' }}</span>
            </div>
      
            <div class="form-row">
              <span class="form-label">选择图片</span>
              <Upload
                v-model:defaultFiles="imageList"
                fileTypes="jpg,jpeg,png"
                :fileSize="20"
                :maxCount="10"
                :isImmediatelyUpload="true"
                :disabled="isSubmitting"
                fileTypeMessage="支持 jpg / png 格式"
                fileSizeMessage="单张最大 20M"
                @upFileList="handleImageUpload"
              >
                <template #customBtn>
                  <el-button :loading="isSubmitting">点击上传</el-button>
                </template>
                <template #tip>
                  <span>支持 jpg / png，单张最大 20M，可一次选多张</span>
                </template>
              </Upload>
            </div>
      
            <div v-if="uploadedImages.length" class="uploaded-list">
              已上传 {{ uploadedImages.length }} 张：
              <span v-for="(img, i) in uploadedImages" :key="i" class="uploaded-item">
                {{ img.fileName }}<span v-if="i < uploadedImages.length - 1">、</span>
              </span>
            </div>
          </div>
      
          <template #footer>
            <el-button @click="handleVisibleChange(false)">取消</el-button>
            <el-button
              type="primary"
              :loading="isSubmitting"
              :disabled="!uploadedImages.length"
              @click="handleSubmit"
            >
              保存
            </el-button>
          </template>
        </el-dialog>
      </template>
      
      <script setup>
      import { ref } from 'vue'
      import { ElMessage } from 'element-plus'
      import Upload from '@/components/upload/Upload.vue'
      import { addItemImg } from '@/api/modules/newAPI'
      
      const props = defineProps({
        visible: { type: Boolean, default: false },
        towerFileId: { type: [Number, String], default: null },
        towerFileName: { type: String, default: '' },
      })
      
      const emit = defineEmits(['update:visible', 'success'])
      
      const imageList = ref([])
      const uploadedImages = ref([])
      const isSubmitting = ref(false)
      
      function handleImageUpload(fileInfo) {
        if (!fileInfo?.filePath) {
          ElMessage.error('图片上传失败，未获取到存储路径')
          return
        }
      
        const record = {
          fileName: fileInfo.fileName || fileInfo.name || '',
          filePath: fileInfo.filePath,
          fileSuffix: String(fileInfo.fileSuffix || fileInfo.suffix || '')
            .replace('.', '')
            .toLowerCase(),
        }
      
        const idx = uploadedImages.value.findIndex(
          (img) => img.filePath === record.filePath
        )
        if (idx >= 0) {
          uploadedImages.value[idx] = record
        } else {
          uploadedImages.value.push(record)
        }
      }
      
      function handleVisibleChange(val) {
        emit('update:visible', val)
      }
      
      function handleClosed() {
        imageList.value = []
        uploadedImages.value = []
        isSubmitting.value = false
      }
      
      async function handleSubmit() {
        if (!props.towerFileId || !uploadedImages.value.length) return
      console.log(props.towerFileId)
        isSubmitting.value = true
        try {
            const res = await addItemImg({
                towerFileId: Number(props.towerFileId),
                imageList: uploadedImages.value,
                })
          // ⚠️ 上面这行需要按你的 api 封装方式调整，见下方说明
          if (res?.code === 200) {
            ElMessage.success('图片追加成功')
            emit('success')
            emit('update:visible', false)
          } else {
            ElMessage.error(res?.msg || '图片追加失败')
          }
        } catch (err) {
          console.error('addItemImg failed:', err)
          ElMessage.error('图片追加失败，请稍后重试')
        } finally {
          isSubmitting.value = false
        }
      }
      </script>
      
      <style scoped>
      .add-image-form {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      
      .form-row {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      
      .form-label {
        color: #606266;
        font-size: 13px;
      }
      
      .file-name {
        overflow: hidden;
        color: #303133;
        font-size: 13px;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      
      .uploaded-list {
        color: #67c23a;
        font-size: 12px;
        line-height: 1.7;
      }
      
      .uploaded-item {
        color: #67c23a;
      }
      </style>