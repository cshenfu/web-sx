import { publicService } from '@/api/base'

/**
 * 1. 根据 objectKey 下载文件
 * GET /admin-api/det/fs/download/object-key
 * @param {string} objectKey
 */
export async function downloadByObjectKey(objectKey) {
  return await publicService.get(
    `/admin-api/det/fs/download/object-key?objectKey=${encodeURIComponent(objectKey)}`
  )
}

/**
 * 2. 通过 objectKey 获取临时访问地址
 * GET /admin-api/det/fs/get/object-key/temp-url
 * @param {string} objectKey
 */
export async function getTempUrl(objectKey) {
  return await publicService.get(
    `/admin-api/det/fs/get/object-key/temp-url?objectKey=${encodeURIComponent(objectKey)}`
  )
}

/**
 * 3. 获取上传文件的 objectKey（项目相关）
 * GET /admin-api/det/fs/getObjectKeyByProjectId
 * @param {string} namePrefix
 * @param {number} projectId
 */
export async function getObjectKeyByProjectId(namePrefix, projectId) {
  return await publicService.get(
    `/admin-api/det/fs/getObjectKeyByProjectId?namePrefix=${encodeURIComponent(namePrefix)}&projectId=${encodeURIComponent(projectId)}`
  )
}

/**
 * 4. 获取上传文件的 objectKey（用户相关）
 * GET /admin-api/det/fs/getObjectKeyByUserName
 * @param {string} namePrefix
 * @param {string} userName
 */
export async function getObjectKeyByUserName(namePrefix, userName) {
  return await publicService.get(
    `/admin-api/det/fs/getObjectKeyByUserName?namePrefix=${encodeURIComponent(namePrefix)}&userName=${encodeURIComponent(userName)}`
  )
}


export async function uploadFile(objectKey, file) {
  const fd = new FormData()
  fd.append('file', file)

  return await publicService.post(
      `/admin-api/det/fs/uploadFileToObsMultipartFile?objectKey=${encodeURIComponent(objectKey)}`,
      fd
  )
}