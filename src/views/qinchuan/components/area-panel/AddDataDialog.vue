<!-- components/area-panel/AddDataDialog.vue -->
<!-- 添加数据弹窗：选文件类型标签 → 上传 → 保存。
     - WIND_TOWER 走 AnemometerTower（内部完成校验 + OSS 上传 + 图片上传）
     - 其他 tag 走通用 Upload（立即上传 OSS，直接拿 filePath）
     - 提交阶段整体 loading -->
     <template>
        <el-dialog
          :model-value="visible"
          :title="`添加${sectionTitle || '数据'}`"
          width="640px"
          :close-on-click-modal="false"
          :close-on-press-escape="!submitStage"
          :show-close="!submitStage"
          @update:model-value="handleVisibleChange"
          @closed="handleClosed"
        >
          <div v-loading="!!submitStage" :element-loading-text="submitTip" class="add-data-form">
            <div class="form-row">
              <span class="form-label">文件类型</span>
              <el-select
                v-model="selectedTag"
                placeholder="请选择文件类型"
                style="width: 100%"
                :loading="tagLoading"
                :disabled="!!submitStage"
              >
                <el-option
                  v-for="item in tagOptions"
                  :key="item.tag"
                  :label="item.desc"
                  :value="item.tag"
                />
              </el-select>
            </div>
      
            <!-- 测风塔：使用专用的 AnemometerTower（内建校验 + 上传 + 图片） -->
            <div v-if="selectedTag === 'WIND_TOWER'" class="form-row">
              <AnemometerTower
                ref="anemometerTowerRef"
                @upAnemomentTowerFiles="handleTowerFilesChange"
              />
            </div>
      
            <!-- 其他类型：通用上传 -->
            <template v-else>
              <div class="form-row">
                <span class="form-label">选择文件</span>
                <div class="upload-wrap">
                  <Upload
                    v-model:defaultFiles="fileList"
                    :fileTypes="uploadConfig.fileTypes"
                    :fileSize="uploadConfig.fileSize"
                    :maxCount="1"
                    :isImmediatelyUpload="true"
                    :disabled="isSubmitting || !selectedTag"
                    :fileTypeMessage="uploadConfig.fileTypeMessage"
                    :fileSizeMessage="uploadConfig.fileSizeMessage"
                    @upFileList="handleUpload"
                  >
                    <template #customBtn>
                      <el-button :disabled="!selectedTag" :loading="isUploading">
                        点击上传
                      </el-button>
                    </template>
                    <template #tip>
                      <span>{{ uploadConfig.tip }}</span>
                    </template>
                  </Upload>
                  <div v-if="!selectedTag" class="upload-hint">请先选择文件类型</div>
                </div>
              </div>
            </template>
      
            <div class="form-row">
              <span class="form-label">备注</span>
              <el-input
                v-model="notes"
                type="textarea"
                :rows="2"
                placeholder="选填"
                maxlength="200"
                :disabled="!!submitStage"
              />
            </div>
          </div>
      
          <template #footer>
            <el-button :disabled="!!submitStage" @click="handleVisibleChange(false)">取消</el-button>
            <el-button
              type="primary"
              :loading="isSubmitting"
              :disabled="!canSubmit || !!submitStage"
              @click="handleSubmit"
            >
              保存
            </el-button>
          </template>
        </el-dialog>
      </template>
      
      <script setup>
      import { ref, computed, watch } from 'vue'
      import { ElMessage } from 'element-plus'
      import Upload from '@/components/upload/Upload.vue'
      import AnemometerTower from '@/components/anemometerTower/AnemometerTower.vue'
      import { addItem, getTagList } from '@/api/modules/newAPI'
      
      const props = defineProps({
        visible: { type: Boolean, default: false },
        aiProjectId: { type: [Number, String], required: true },
        dataCategory: { type: String, required: true },
        sectionTitle: { type: String, default: '' },
      })
      
      const emit = defineEmits(['update:visible', 'success'])
      
      // 需要触发解析的板块：地形（含地勘）/ 环保 / 水保 / 接入
      const NEED_PARSE_CATEGORIES = [
        'TERRAIN',
        'ENVIRONMENT',
        'WATER_CONSERVANCY',
        'ACCESS_REPORT_INFO',
      ]
      
      const tagOptions = ref([])
      const tagLoading = ref(false)
      const selectedTag = ref('')
      const fileList = ref([])
      const uploadedFile = ref(null)
      const notes = ref('')
      const isSubmitting = ref(false)
      const isUploading = ref(false)
      
      // 提交阶段：'' | 'saving'（AnemometerTower 内部自己会做校验/上传，这里只标保存阶段）
      const submitStage = ref('')
      
      // 测风塔数据（来自 AnemometerTower 的 upAnemomentTowerFiles）
      const anemometerTowerRef = ref(null)
      const towerFiles = ref([])
      
      const submitTip = computed(() => {
        switch (submitStage.value) {
          case 'saving':
            return '数据保存中，请稍候…'
          default:
            return ''
        }
      })
      
      const uploadConfig = computed(() => {
        if (props.dataCategory === 'TERRAIN') {
          return {
            fileTypes: 'pdf,doc,docx,xlsx,xls,dwg,txt',
            fileSize: 200,
            fileTypeMessage: '支持 pdf / doc / docx / xlsx / xls / dwg / txt 格式',
            fileSizeMessage: '文件最大 200M',
            tip: '支持 pdf / doc / docx / xlsx / xls / dwg / txt，文件最大 200M',
          }
        }
        if (props.dataCategory === 'WIND') {
          return {
            fileTypes: 'pdf,doc,docx,xlsx,xls,txt,zip',
            fileSize: 500,
            fileTypeMessage: '支持 pdf / doc / docx / xlsx / xls / txt / zip 格式',
            fileSizeMessage: '文件最大 500M',
            tip: '支持 pdf / doc / docx / xlsx / xls / txt / zip，文件最大 500M',
          }
        }
        return {
          fileTypes: 'pdf,doc,docx,xlsx,xls,txt',
          fileSize: 200,
          fileTypeMessage: '支持 pdf / doc / docx / xlsx / xls / txt 格式',
          fileSizeMessage: '文件最大 200M',
          tip: '支持 pdf / doc / docx / xlsx / xls / txt，文件最大 200M',
        }
      })
      
      const canSubmit = computed(() => {
        if (!selectedTag.value) return false
        if (selectedTag.value === 'WIND_TOWER') {
          const tower = towerFiles.value[0]
          // AnemometerTower 校验通过后才会写入 filePath
          return !!tower?.filePath
        }
        return !!uploadedFile.value?.filePath
      })
      
      async function fetchTagList() {
        if (!props.dataCategory) return
        tagLoading.value = true
        try {
          const res = await getTagList(props.dataCategory)
          tagOptions.value = res?.data ?? []
        } catch (err) {
          console.error('获取文件类型标签失败:', err)
          tagOptions.value = []
        } finally {
          tagLoading.value = false
        }
      }
      
      function resetState() {
        selectedTag.value = ''
        fileList.value = []
        uploadedFile.value = null
        towerFiles.value = []
        notes.value = ''
        isSubmitting.value = false
        isUploading.value = false
        submitStage.value = ''
      }
      
      function handleUpload(fileInfo) {
        if (!fileInfo?.filePath) {
          ElMessage.error('文件上传成功，但未获取到存储路径')
          isUploading.value = false
          return
        }
        uploadedFile.value = fileInfo
        fileList.value = [
          { ...fileInfo, name: fileInfo.fileName || fileInfo.name },
        ]
        isUploading.value = false
      }
      
      // AnemometerTower 里校验 + OSS 上传 + 图片上传完成后抛出 { file, pointList }
      function handleTowerFilesChange(payload) {
        towerFiles.value = payload?.file || []
      }
      
      function handleVisibleChange(val) {
        if (submitStage.value) return
        emit('update:visible', val)
      }
      
      function handleClosed() {
        resetState()
      }
      
      // 把 AnemometerTower children 里的图片路径转成 addItem 需要的 imageList 元素
      function pathToImageItem(path) {
        if (!path) return null
        const name = path.split('/').pop()?.split('?')[0] || ''
        const suffix = name.includes('.') ? name.split('.').pop().toLowerCase() : ''
        return {
          fileName: name,
          filePath: path,
          fileSuffix: suffix,
        }
      }
      
      async function handleSubmit() {
        if (!canSubmit.value) return
      
        let reqDTO
      
        if (selectedTag.value === 'WIND_TOWER') {
          const tower = towerFiles.value[0]
          const fileName = tower.fileName || tower.name || ''
          const fileSuffix = fileName.includes('.')
            ? fileName.split('.').pop().toLowerCase()
            : ''
      
          reqDTO = {
            aiProjectId: Number(props.aiProjectId),
            dataCategory: props.dataCategory,
            fileName,
            filePath: tower.filePath,
            fileSuffix,
            fileTypeTag: 'WIND_TOWER',
            needParse: NEED_PARSE_CATEGORIES.includes(props.dataCategory),
            notes: notes.value || undefined,
          }
      
          const imageList = (tower.children || [])
            .map(pathToImageItem)
            .filter(Boolean)
          if (imageList.length) {
            reqDTO.imageList = imageList
          }
        } else {
          const fileInfo = uploadedFile.value
          const fileSuffix = String(fileInfo.fileSuffix || fileInfo.suffix || '')
            .replace('.', '')
            .toLowerCase()
      
          reqDTO = {
            aiProjectId: Number(props.aiProjectId),
            dataCategory: props.dataCategory,
            fileName: fileInfo.fileName || fileInfo.name || '',
            filePath: fileInfo.filePath,
            fileSuffix,
            fileTypeTag: selectedTag.value,
            needParse: NEED_PARSE_CATEGORIES.includes(props.dataCategory),
            notes: notes.value || undefined,
          }
        }
      
        isSubmitting.value = true
        submitStage.value = 'saving'
      
        try {
          const res = await addItem(reqDTO)
          if (res?.code === 200) {
            ElMessage.success('添加成功')
            emit('success')
            emit('update:visible', false)
          } else {
            ElMessage.error(res?.msg || '添加失败')
          }
        } catch (err) {
          console.error('保存失败:', err)
          ElMessage.error(err?.message || '保存失败，请稍后重试')
        } finally {
          isSubmitting.value = false
          submitStage.value = ''
        }
      }
      
      // 打开时重置 + 拉 tag
      watch(
        () => props.visible,
        (val) => {
          if (val) {
            resetState()
            fetchTagList()
          }
        }
      )
      
      // 切换 tag 时清空已有的上传状态，避免串数据
      watch(selectedTag, () => {
        uploadedFile.value = null
        fileList.value = []
        towerFiles.value = []
      })
      </script>
      
      <style scoped>
      .add-data-form {
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
      
      .upload-wrap {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      
      .upload-hint {
        color: #e6a23c;
        font-size: 12px;
      }



      /* 覆盖 AnemometerTower 内部的删除图标：强制始终显示、位置放进卡片内 */
:deep(.up-list .up-load-list .upload-shanchu) {
  display: block !important;
  top: 4px !important;
  right: 8px !important;
  color: #909399 !important;
  transition: color 0.15s;
}

:deep(.up-list .up-load-list .upload-shanchu:hover) {
  color: #f56c6c !important;
}

/* 校验失败的文件名已经在 AnemometerTower 里用 .err-msg 变红，这里保证卡片本身有边框区分 */
:deep(.up-list .up-load-list) {
  border: 1px solid rgba(0, 0, 0, 0.06);
}
      </style>