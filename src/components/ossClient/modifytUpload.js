/**
 * 多云文件上传 Composable
 *
 * 支持：
 * - RustFS：S3 兼容协议
 * - 阿里云 OSS
 * - 华为云 OBS
 *
 * 后端 getCertificate 返回格式：
 * {
 *   code: 200,
 *   data: {
 *     expiresAt: 1786092002000,
 *     access: '临时 AccessKey',
 *     secret: '临时 Secret',
 *     securityToken: 'STS Token',
 *     fileManager: 'ali_oss' | 'rust_fs' | 'huawei_obs',
 *     privateBucket: 'xxx',
 *     publicBucket: 'xxx',
 *     region: 'cn-beijing'
 *   }
 * }
 */

 import { ref } from 'vue';
 import OSS from 'ali-oss';
 
 import { S3Client } from '@aws-sdk/client-s3';
 import {
     GetObjectCommand,
     HeadObjectCommand,
     DeleteObjectCommand,
     CopyObjectCommand,
 } from '@aws-sdk/client-s3';
 import { Upload as S3Upload } from '@aws-sdk/lib-storage';
 import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
 
 import ObsClient from 'esdk-obs-browserjs';
 
 import { getCertificate } from '@/api/modules/base.js';
 import { message } from 'ant-design-vue';
 
 
 // RustFS 服务地址
 const RUSTFS_ENDPOINT = 'https://rustfs.wh-ge.com';
 
 
 // 阿里云 Region 兼容处理
 // 后端可能返回：cn-beijing
 // OSS SDK 需要：oss-cn-beijing
 const normalizeAliRegion = (region) => {
     const value = String(region || '').trim();
 
     if (!value) {
         throw new Error('阿里云 OSS region 为空');
     }
 
     return value.startsWith('oss-') ? value : `oss-${value}`;
 };
 
 
 // 安全解码，避免非法编码导致整个流程报错
 const safeDecode = (value) => {
     let result = String(value || '');
 
     try {
         // 最多解码两次，兼容类似 %252Fxxx 这种双重编码
         for (let i = 0; i < 2; i += 1) {
             const decoded = decodeURIComponent(result);
 
             if (decoded === result) {
                 break;
             }
 
             result = decoded;
         }
     } catch {
         // 编码不完整时，保留原始值
     }
 
     return result;
 };
 
 
 // 删除 URL 参数和 Hash
 const removeUrlQuery = (value) => {
     return String(value || '').split(/[?#]/)[0];
 };
 
 
 // 拼接对象存储路径
 // 最终返回：/bucket/objectName
 const createStoredPath = (bucket, objectName) => {
     const cleanBucket = String(bucket || '').replace(/^\/+|\/+$/g, '');
     const cleanObjectName = String(objectName || '').replace(/^\/+/g, '');
 
     if (!cleanBucket) {
         return `${cleanObjectName}`;
     }
 
     return `${cleanObjectName}`;
 };
 
 
 // 处理上传目录
 // 例如：
 // storePath = 'project/files/'
 // file.name = 'demo.shp'
 // 结果：project/files/demo.shp
 const createObjectName = (file, storePath = '') => {
     const filename = String(file?.name || '').replace(/^\/+/g, '');
     const folder = String(storePath || '').replace(/^\/+|\/+$/g, '');
 
     if (!filename) {
         throw new Error('文件名称为空');
     }
 
     return folder ? `${folder}/${filename}` : filename;
 };
 
 
 // 将数据库中保存的路径转换为 OSS/S3 对象 Key
 //
 // 兼容：
 // /bucket/folder/file.pdf
 // bucket/folder/file.pdf
 // folder/file.pdf
 // file.pdf
 const getObjectKey = (filePath, bucket) => {
     let value = safeDecode(filePath);
     value = removeUrlQuery(value);
     value = value.replace(/^\/+/g, '');
 
     const cleanBucket = String(bucket || '').replace(/^\/+|\/+$/g, '');
 
     if (cleanBucket === value) {
         return '';
     }
 
     if (cleanBucket && value.startsWith(`${cleanBucket}/`)) {
         value = value.slice(cleanBucket.length + 1);
     }
 
     return value;
 };
 
 
 export function useOssUpload() {
     const processSize = ref(0);
     const urlPath = ref('');
 
     /**
      * 每次调用都重新获取后端临时凭证。
      *
      * 不做 sessionStorage 缓存。
      */
     const requestCredentials = async () => {
         const response = await getCertificate();
 
         if (!response || response.code !== 200 || !response.data) {
             throw new Error(response?.msg || '获取文件存储凭证失败');
         }
 
         const credentials = response.data;
 
         if (!credentials.fileManager) {
             throw new Error('后端未返回 fileManager');
         }
 
         if (!credentials.access) {
             throw new Error('后端未返回 access');
         }
 
         if (!credentials.secret) {
             throw new Error('后端未返回 secret');
         }
 
         if (!credentials.privateBucket) {
             throw new Error('后端未返回 privateBucket');
         }
 
         return credentials;
     };
 
 
     /**
      * 创建阿里云 OSS 客户端
      */
     const createAliOssClient = (credentials) => {
         const {
             access,
             secret,
             securityToken,
             region,
             privateBucket,
             expiresAt,
         } = credentials;
 
         const ossRegion = normalizeAliRegion(region);
 
         const client = new OSS({
             accessKeyId: access,
             accessKeySecret: secret,
             stsToken: securityToken || undefined,
             region: ossRegion,
             bucket: privateBucket,
             secure: true,
 
             /**
              * 阿里云 SDK 自己需要刷新 STS 时，
              * 强制重新请求后端，不使用缓存。
              */
             refreshSTSToken: async () => {
                 const freshResponse = await getCertificate();
 
                 if (
                     !freshResponse ||
                     freshResponse.code !== 200 ||
                     !freshResponse.data
                 ) {
                     throw new Error('刷新阿里云 OSS 凭证失败');
                 }
 
                 const fresh = freshResponse.data;
 
                 return {
                     accessKeyId: fresh.access,
                     accessKeySecret: fresh.secret,
                     stsToken: fresh.securityToken,
                 };
             },
         });
 
         return {
             type: 'ali_oss',
             client,
             bucket: privateBucket,
             region: ossRegion,
             expireAt: Number(expiresAt || 0),
         };
     };
 
 
     /**
      * 创建 RustFS S3 客户端
      */
     const createRustfsClient = (credentials) => {
         const {
             access,
             secret,
             securityToken,
             region,
             privateBucket,
             expiresAt,
         } = credentials;
 
         const client = new S3Client({
             region: region || 'us-east-1',
             endpoint: RUSTFS_ENDPOINT,
 
             credentials: {
                 accessKeyId: access,
                 secretAccessKey: secret,
 
                 // 如果 RustFS 后端也返回临时 Token，则使用它
                 ...(securityToken
                     ? { sessionToken: securityToken }
                     : {}),
             },
 
             forcePathStyle: true,
         });
 
         return {
             type: 'rust_fs',
             client,
             bucket: privateBucket,
             endpoint: RUSTFS_ENDPOINT,
             expireAt: Number(expiresAt || 0),
         };
     };
 
 
     /**
      * 创建华为云 OBS 客户端
      */
     const createHuaweiObsClient = (credentials) => {
         const {
             access,
             secret,
             securityToken,
             region,
             privateBucket,
             expiresAt,
         } = credentials;
 
         if (!region) {
             throw new Error('华为云 OBS region 为空');
         }
 
         const endpoint = `https://obs.${region}.myhuaweicloud.com`;
 
         const client = new ObsClient({
             access_key_id: access,
             secret_access_key: secret,
             security_token: securityToken || undefined,
             server: endpoint,
         });
 
         return {
             type: 'huawei_obs',
             client,
             bucket: privateBucket,
             endpoint,
             expireAt: Number(expiresAt || 0),
         };
     };
 
 
     /**
      * 根据后端返回的 fileManager 创建对应客户端
      */
     const buildClient = (credentials) => {
         switch (credentials.fileManager) {
             case 'ali_oss':
                 return createAliOssClient(credentials);
 
             case 'rust_fs':
                 return createRustfsClient(credentials);
 
             case 'huawei_obs':
                 return createHuaweiObsClient(credentials);
 
             default:
                 throw new Error(
                     `不支持的文件管理类型: ${credentials.fileManager}`,
                 );
         }
     };
 
 
     /**
      * 每次操作都重新获取凭证并创建客户端。
      */
     const getClient = async () => {
         const credentials = await requestCredentials();
         const clientInfo = buildClient(credentials);
 
         return {
             ...clientInfo,
             credentials,
         };
     };
 
 
     /**
      * 保存上传后的对象路径。
      *
      * 统一返回：
      * /bucket/objectName
      */
     const saveObjectPath = (bucket, objectName) => {
         const storedPath = createStoredPath(bucket, objectName);
 
         urlPath.value = storedPath;
 
         return {
             obsPath: storedPath,
         };
     };
 
 
     /**
      * 统一错误处理
      */
     const handleUploadError = (error) => {
         console.error('文件上传失败:', error);
 
         const code = error?.code;
         const name = error?.name;
         const errorMessage = error?.message || '未知错误';
 
         if (
             code === 'ConnectionTimeoutError' ||
             name === 'TimeoutError' ||
             name === 'NetworkError'
         ) {
             message.error('上传超时，请稍后重试！');
         } else if (code === 'ECONNABORTED') {
             message.error('网络错误，请检查您的网络连接！');
         } else {
             message.error(`上传失败: ${errorMessage}`);
         }
     };
 
 
     /**
      * 阿里云 OSS 上传
      */
     const uploadWithAliOss = async (
         clientInfo,
         file,
         objectName,
     ) => {
         const { client, bucket } = clientInfo;
 
         // 小文件直接上传
         if (file.size < 5 * 1024 * 1024) {
             await client.put(objectName, file, {
                 progress: (progress) => {
                     processSize.value = Math.floor(progress * 100);
                 },
             });
 
             processSize.value = 100;
 
             return saveObjectPath(bucket, objectName);
         }
 
         // 大文件分片上传
         await client.multipartUpload(objectName, file, {
             partSize: 5 * 1024 * 1024,
             parallel: 1,
             timeout: 120000,
 
             progress: (progress) => {
                 processSize.value = Math.floor(progress * 100);
             },
         });
 
         processSize.value = 100;
 
         return saveObjectPath(bucket, objectName);
     };
 
 
     /**
      * RustFS 上传
      */
     const uploadWithRustfs = async (
         clientInfo,
         file,
         objectName,
     ) => {
         const {
             client,
             bucket,
         } = clientInfo;
 
         const upload = new S3Upload({
             client,
             params: {
                 Bucket: bucket,
                 Key: objectName,
                 Body: file,
                 ContentType: file.type || 'application/octet-stream',
             },
             queueSize: 1,
             partSize: 5 * 1024 * 1024,
             leavePartsOnError: false,
         });
 
         upload.on('httpUploadProgress', ({ loaded, total }) => {
             if (total) {
                 processSize.value = Math.floor((loaded / total) * 100);
             }
         });
 
         await upload.done();
 
         processSize.value = 100;
 
         return saveObjectPath(bucket, objectName);
     };
 
 
     /**
      * 华为云 OBS 上传
      */
     const uploadWithHuaweiObs = (
         clientInfo,
         file,
         objectName,
     ) => {
         const {
             client,
             bucket,
         } = clientInfo;
 
         return new Promise((resolve, reject) => {
             let settled = false;
 
             const resolveOnce = (value) => {
                 if (settled) return;
                 settled = true;
                 resolve(value);
             };
 
             const rejectOnce = (error) => {
                 if (settled) return;
                 settled = true;
                 reject(error);
             };
 
             const abortAndReject = (error, uploadId) => {
                 if (!uploadId) {
                     rejectOnce(error);
                     return;
                 }
 
                 let abortFinished = false;
 
                 const finishAbort = () => {
                     if (abortFinished) return;
                     abortFinished = true;
                     rejectOnce(error);
                 };
 
                 try {
                     client.abortMultipartUpload(
                         {
                             Bucket: bucket,
                             Key: objectName,
                             UploadId: uploadId,
                         },
                         finishAbort,
                     );
 
                     // 某些 OBS SDK 版本 abort 回调可能不返回
                     setTimeout(finishAbort, 3000);
                 } catch {
                     finishAbort();
                 }
             };
 
 
             // 小文件直接上传
             if (file.size < 5 * 1024 * 1024) {
                 client.putObject(
                     {
                         Bucket: bucket,
                         Key: objectName,
                         Body: file,
                         ContentType: file.type || 'application/octet-stream',
 
                         ProgressCallback: (transferred, total) => {
                             if (total) {
                                 processSize.value = Math.floor(
                                     (transferred / total) * 100,
                                 );
                             }
                         },
                     },
                     (error) => {
                         if (error) {
                             rejectOnce(error);
                             return;
                         }
 
                         processSize.value = 100;
                         resolveOnce(saveObjectPath(bucket, objectName));
                     },
                 );
 
                 return;
             }
 
 
             // 大文件分片上传
             client.initiateMultipartUpload(
                 {
                     Bucket: bucket,
                     Key: objectName,
                 },
                 (initError, initResult) => {
                     if (initError) {
                         rejectOnce(initError);
                         return;
                     }
 
                     const uploadId =
                         initResult?.UploadId ||
                         initResult?.IntroducedBucket?.UploadId;
 
                     if (!uploadId) {
                         rejectOnce(
                             new Error('华为云 OBS 未返回 UploadId'),
                         );
                         return;
                     }
 
                     const partSize = 5 * 1024 * 1024;
                     const totalParts = Math.ceil(file.size / partSize);
                     const uploadedParts = [];
                     let currentPartNumber = 1;
 
 
                     const uploadNextPart = () => {
                         if (currentPartNumber > totalParts) {
                             client.completeMultipartUpload(
                                 {
                                     Bucket: bucket,
                                     Key: objectName,
                                     UploadId: uploadId,
                                     Parts: uploadedParts.sort(
                                         (a, b) =>
                                             a.PartNumber - b.PartNumber,
                                     ),
                                 },
                                 (completeError) => {
                                     if (completeError) {
                                         abortAndReject(
                                             completeError,
                                             uploadId,
                                         );
                                         return;
                                     }
 
                                     processSize.value = 100;
                                     resolveOnce(
                                         saveObjectPath(
                                             bucket,
                                             objectName,
                                         ),
                                     );
                                 },
                             );
 
                             return;
                         }
 
 
                         const partNumber = currentPartNumber;
                         const start = (partNumber - 1) * partSize;
                         const end = Math.min(
                             start + partSize,
                             file.size,
                         );
                         const chunk = file.slice(start, end);
 
                         client.uploadPart(
                             {
                                 Bucket: bucket,
                                 Key: objectName,
                                 PartNumber: partNumber,
                                 UploadId: uploadId,
                                 Body: chunk,
 
                                 ProgressCallback: (transferred, total) => {
                                     if (total) {
                                         const overall =
                                             (
                                                 (partNumber - 1) *
                                                     partSize +
                                                 transferred
                                             ) / file.size;
 
                                         processSize.value = Math.floor(
                                             overall * 100,
                                         );
                                     }
                                 },
                             },
                             (partError, partResult) => {
                                 if (partError) {
                                     abortAndReject(partError, uploadId);
                                     return;
                                 }
 
                                 uploadedParts.push({
                                     PartNumber: partNumber,
                                     ETag: partResult?.ETag,
                                 });
 
                                 currentPartNumber += 1;
                                 uploadNextPart();
                             },
                         );
                     };
 
                     uploadNextPart();
                 },
             );
         });
     };
 
 
     /**
      * 上传文件
      *
      * 与当前组件的调用方式兼容：
      *
      * const result = await ossUpload.uploadFile(
      *     file,
      *     sessionStorage.getItem('obsFilePath') || '',
      * );
      *
      * 返回：
      * {
      *   obsPath: '/bucket/path/file.ext'
      * }
      */
     const uploadFile = async (
         file,
         storePath = '',
     ) => {
         processSize.value = 0;
 
         try {
             if (!file) {
                 throw new Error('上传文件为空');
             }
 
             const objectName = createObjectName(file, storePath);
 
             // 每次上传重新获取凭证
             const clientInfo = await getClient();
 
             switch (clientInfo.type) {
                 case 'ali_oss':
                     return await uploadWithAliOss(
                         clientInfo,
                         file,
                         objectName,
                     );
 
                 case 'rust_fs':
                     return await uploadWithRustfs(
                         clientInfo,
                         file,
                         objectName,
                     );
 
                 case 'huawei_obs':
                     return await uploadWithHuaweiObs(
                         clientInfo,
                         file,
                         objectName,
                     );
 
                 default:
                     throw new Error(
                         `未知文件管理类型: ${clientInfo.type}`,
                     );
             }
         } catch (error) {
             handleUploadError(error);
 
             return {
                 msg: '上传失败',
                 obsPath: '',
             };
         }
     };
 
 
     /**
      * 获取文件 URL
      *
      * 当前下载方法：
      *
      * const url = await ossUpload.getFileUrl(record.pdfReportPath);
      * window.open(url);
      *
      * 支持：
      * - 对象路径
      * - 带 bucket 的对象路径
      * - 完整 HTTP/HTTPS URL
      */
     const getFileUrl = async (filePath) => {
         try {
             if (!filePath) {
                 return '';
             }
 
             const rawPath = String(filePath).trim();
 
             // 如果已经是完整 URL，直接使用
             if (/^https?:\/\//i.test(rawPath)) {
                 return rawPath;
             }
 
             // 兼容被编码成 https%3A%2F%2F... 的 URL
             const decodedPath = safeDecode(rawPath);
 
             if (/^https?:\/\//i.test(decodedPath)) {
                 return decodedPath;
             }
 
             // 获取当前存储服务的最新临时凭证
             const clientInfo = await getClient();
             const objectKey = getObjectKey(
                 decodedPath,
                 clientInfo.bucket,
             );
 
             if (!objectKey) {
                 throw new Error('文件对象路径为空');
             }
 
             if (clientInfo.type === 'ali_oss') {
                 return await clientInfo.client.signatureUrl(objectKey, {
                     expires: 3600,
                 });
             }
 
             if (clientInfo.type === 'rust_fs') {
                 return await getSignedUrl(
                     clientInfo.client,
                     new GetObjectCommand({
                         Bucket: clientInfo.bucket,
                         Key: objectKey,
                     }),
                     {
                         expiresIn: 3600,
                     },
                 );
             }
 
             if (clientInfo.type === 'huawei_obs') {
                 const result = clientInfo.client.createSignedUrlSync({
                     Method: 'GET',
                     Bucket: clientInfo.bucket,
                     Key: objectKey,
                     Expires: 3600,
                 });
 
                 return result?.SignedUrl || '';
             }
 
             return '';
         } catch (error) {
             console.error('获取文件 URL 失败:', error);
             return '';
         }
     };
 
 
     /**
      * 判断文件是否存在
      */
     const isExistObject = async (objectName) => {
         try {
             const clientInfo = await getClient();
 
             const objectKey = getObjectKey(
                 objectName,
                 clientInfo.bucket,
             );
 
             if (!objectKey) {
                 return false;
             }
 
             if (clientInfo.type === 'ali_oss') {
                 await clientInfo.client.head(objectKey);
                 return true;
             }
 
             if (clientInfo.type === 'rust_fs') {
                 await clientInfo.client.send(
                     new HeadObjectCommand({
                         Bucket: clientInfo.bucket,
                         Key: objectKey,
                     }),
                 );
 
                 return true;
             }
 
             if (clientInfo.type === 'huawei_obs') {
                 return await new Promise((resolve) => {
                     clientInfo.client.getObjectMetadata(
                         {
                             Bucket: clientInfo.bucket,
                             Key: objectKey,
                         },
                         (error) => {
                             resolve(!error);
                         },
                     );
                 });
             }
 
             return false;
         } catch (error) {
             console.error('检查文件是否存在失败:', error);
             return false;
         }
     };
 
 
     /**
      * 删除文件
      */
     const delFile = async (objectName) => {
         try {
             const clientInfo = await getClient();
 
             const objectKey = getObjectKey(
                 objectName,
                 clientInfo.bucket,
             );
 
             if (!objectKey) {
                 return false;
             }
 
             const exists = await isExistObject(objectKey);
 
             if (!exists) {
                 message.error('文件不存在！');
                 return false;
             }
 
             if (clientInfo.type === 'ali_oss') {
                 await clientInfo.client.delete(objectKey);
                 return true;
             }
 
             if (clientInfo.type === 'rust_fs') {
                 await clientInfo.client.send(
                     new DeleteObjectCommand({
                         Bucket: clientInfo.bucket,
                         Key: objectKey,
                     }),
                 );
 
                 return true;
             }
 
             if (clientInfo.type === 'huawei_obs') {
                 return await new Promise((resolve) => {
                     clientInfo.client.deleteObject(
                         {
                             Bucket: clientInfo.bucket,
                             Key: objectKey,
                         },
                         (error) => {
                             if (error) {
                                 console.error(
                                     '华为云 OBS 删除文件失败:',
                                     error,
                                 );
                                 resolve(false);
                             } else {
                                 resolve(true);
                             }
                         },
                     );
                 });
             }
 
             return false;
         } catch (error) {
             console.error('删除文件失败:', error);
             return false;
         }
     };
 
 
     /**
      * 复制文件
      */
     const copyFile = async (sourceObject, targetObject) => {
         try {
             const clientInfo = await getClient();
 
             const sourceKey = getObjectKey(
                 sourceObject,
                 clientInfo.bucket,
             );
 
             const targetKey = getObjectKey(
                 targetObject,
                 clientInfo.bucket,
             );
 
             if (!sourceKey || !targetKey) {
                 return false;
             }
 
             if (clientInfo.type === 'ali_oss') {
                 const sourceResult = await clientInfo.client.get(sourceKey);
 
                 await clientInfo.client.put(
                     targetKey,
                     sourceResult.content,
                 );
 
                 return true;
             }
 
             if (clientInfo.type === 'rust_fs') {
                 await clientInfo.client.send(
                     new CopyObjectCommand({
                         Bucket: clientInfo.bucket,
                         CopySource: `${clientInfo.bucket}/${sourceKey}`,
                         Key: targetKey,
                     }),
                 );
 
                 return true;
             }
 
             if (clientInfo.type === 'huawei_obs') {
                 return await new Promise((resolve) => {
                     clientInfo.client.copyObject(
                         {
                             Bucket: clientInfo.bucket,
                             Key: targetKey,
                             CopySource: `${clientInfo.bucket}/${sourceKey}`,
                         },
                         (error) => {
                             if (error) {
                                 console.error(
                                     '华为云 OBS 复制文件失败:',
                                     error,
                                 );
                                 resolve(false);
                             } else {
                                 resolve(true);
                             }
                         },
                     );
                 });
             }
 
             return false;
         } catch (error) {
             console.error('复制文件失败:', error);
             return false;
         }
     };
 
 
     return {
         uploadFile,
         processSize,
         getFileUrl,
         urlPath,
         delFile,
         copyFile,
         isExistObject,
     };
 }