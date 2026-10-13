import { publicService4, publicService6 } from '@/api/base'

// ========================================================
// 支持性文件解析
// ========================================================
export async function fileParse(data) {
  return await publicService6.post('/api/parse', data)
}

// ========================================================
// 0. 查询流程文件材料类型枚举关系
//    GET /ai/api/aiProjectFile/projectStageFileEnum
//    返回：[{ stageCode, stageDesc, children: [{ fileCode, fileDesc }] }]
// ========================================================
export async function getFileType() {
  return await publicService4.get('/ai/api/aiProjectFile/projectStageFileEnum')
}

// ========================================================
// 1. 根据项目ID和阶段查询文件列表
//    GET /ai/api/aiProjectFile/list-by-project
//    params: { aiProjectId, firstBusinessTitle? }
// ========================================================
export async function getFileListByProjectid(data) {
  return await publicService4.get('/ai/api/aiProjectFile/list-by-project', data)
}

// ========================================================
// 1.1 根据项目ID、一级文件类型、二级业务标题、configDataParentId 初始化数据
//     GET /ai/api/aiProjectFile/init-by-configDataParentId
//     params: { aiProjectId, configDataParentId, firstBusinessTitle, secondaryBusinessTitle }
// ========================================================
export async function initFileByConfig(data) {
  return await publicService4.get('/ai/api/aiProjectFile/init-by-configDataParentId', data)
}

// ========================================================
// 2. 新增上传文件
//    POST /ai/api/aiProjectFile/upload
//    body: AiProjectFileSaveReqVO
// ========================================================
export async function addFileType(data) {
  return await publicService4.post('/ai/api/aiProjectFile/upload', data)
}

// ========================================================
// 3. 修改文件信息
//    PUT /ai/api/aiProjectFile/update
//    body: AiProjectFileSaveReqVO（id 必填）
// ========================================================
export async function updateFile(data) {
  return await publicService4.put('/ai/api/aiProjectFile/update', data)
}

// ========================================================
// 3. 分配任务人
//    PUT /ai/api/aiProjectFile/assign
//    body: AiProjectFileSaveReqVO
// ========================================================
export async function assignTask(data) {
  return await publicService4.put('/ai/api/aiProjectFile/assign', data)
}

// ========================================================
// 4. 删除数据（删除文件类型，或类型下没有文件时调用）
//    DELETE /ai/api/aiProjectFile/delete?id=xx
// ========================================================
export async function delFileType(id) {
  return await publicService4.del(`/ai/api/aiProjectFile/delete?id=${id}`)
}

// ========================================================
// 5. 批量新增上传文件
//    POST /ai/api/aiProjectFile/upload-batch
//    body: AiProjectFileSaveReqVO[]
// ========================================================
export async function addFileBatch(data) {
  return await publicService4.post('/ai/api/aiProjectFile/upload-batch', data)
}

// ========================================================
// 6. 批量修改文件信息
//    PUT /ai/api/aiProjectFile/update-batch
//    body: AiProjectFileSaveReqVO[]
// ========================================================
export async function updateFileBatch(data) {
  return await publicService4.put('/ai/api/aiProjectFile/update-batch', data)
}

// ========================================================
// 7. 触发文件自动生成
//    PUT /ai/api/aiProjectFile/trigger-generate?id=xx
// ========================================================
export async function triggerGenerate(data) {
  return await publicService4.put('/ai/api/aiProjectFile/trigger-generate', data)
}

// ========================================================
// 8. 重新生成文件（用于失败后重试）
//    PUT /ai/api/aiProjectFile/retry-generate?id=xx
// ========================================================
export async function retryGenerate(data) {
  return await publicService4.put('/ai/api/aiProjectFile/retry-generate', data)
}

// ========================================================
// 获取详情
//    GET /ai/api/aiProjectFile/get?id=xx
// ========================================================
export async function getFileDetail(data) {
  return await publicService4.get('/ai/api/aiProjectFile/get', data)
}

// ========================================================
// 分页查询
//    GET /ai/api/aiProjectFile/page
//    params: { pageNo, pageSize, ...filters }
// ========================================================
export async function pageFile(data) {
  return await publicService4.get('/ai/api/aiProjectFile/page', data)
}

// ========================================================
// 批量设置任务及通知时间
//    PUT /ai/api/aiProjectFile/batch-set-task
//    body: { items: [{ id, advanceDays, assignedUploaderId, ... }] }
// ========================================================
export async function batchSetTask(data) {
  return await publicService4.put('/ai/api/aiProjectFile/batch-set-task', data)
}