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

import { getCertificate } from '@/api/modules/public.js';
import { ElMessage } from 'element-plus';


// RustFS 服务地址
const RUSTFS_ENDPOINT = 'https://rustfs.wh-ge.com';


// 统一处理阿里云 Region
// 后端返回 cn-beijing 时，转换成 OSS SDK 需要的 oss-cn-beijing
const normalizeAliRegion = (region) => {
    const value = String(region || '').trim();

    if (!value) {
        throw new Error('阿里云 OSS region 为空');
    }

    return value.startsWith('oss-')
        ? value
        : `oss-${value}`;
};


// 安全解码，兼容普通编码和双重编码
const safeDecode = (value) => {
    let result = String(value || '');

    for (let i = 0; i < 2; i += 1) {
        try {
            const decoded = decodeURIComponent(result);

            if (decoded === result) {
                break;
            }

            result = decoded;
        } catch {
            break;
        }
    }

    return result;
};


// 去掉 URL 查询参数和 hash
const removeQueryAndHash = (value) => {
    return String(value || '').split(/[?#]/)[0];
};


// 统一生成保存到后端的路径
// 例如：/whln-test-private/project/demo.shp
const createStoredPath = (bucket, objectKey) => {
    const cleanBucket = String(bucket || '')
        .replace(/^\/+|\/+$/g, '');

    const cleanObjectKey = String(objectKey || '')
        .replace(/^\/+/g, '');

    console.log(cleanBucket)

    return `${cleanObjectKey}`;
};


// 从路径中提取对象 Key
//
// 兼容：
// /bucket/folder/file.pdf
// bucket/folder/file.pdf
// folder/file.pdf
// https://bucket.xxx.com/folder/file.pdf
const extractObjectKey = (filePath, bucket) => {
    if (!filePath) {
        return '';
    }

    let value = safeDecode(String(filePath).trim());
    const cleanBucket = String(bucket || '').replace(/^\/+|\/+$/g, '');

    // 如果传入完整 URL，取 pathname
    if (/^https?:\/\//i.test(value)) {
        try {
            const parsedUrl = new URL(value);
            value = parsedUrl.pathname;
        } catch {
            // URL 无法解析时继续使用原始内容
        }
    }

    value = removeQueryAndHash(value);
    value = value.replace(/^\/+/g, '');

    // 去掉桶名
    if (cleanBucket && value === cleanBucket) {
        return '';
    }

    if (cleanBucket && value.startsWith(`${cleanBucket}/`)) {
        value = value.slice(cleanBucket.length + 1);
    }

    return value;
};


// 根据上传目录和文件名生成对象 Key
const createObjectKey = (file, storePath, bucket) => {
    if (!file || !file.name) {
        throw new Error('上传文件名称为空');
    }

    let folder = safeDecode(storePath || '');
    folder = removeQueryAndHash(folder);
    folder = folder.replace(/^\/+|\/+$/g, '');

    // 如果传入的是 /bucket/folder/，自动去掉桶名
    const cleanBucket = String(bucket || '').replace(/^\/+|\/+$/g, '');

    if (cleanBucket && folder.startsWith(`${cleanBucket}/`)) {
        folder = folder.slice(cleanBucket.length + 1);
    }

    if (folder === cleanBucket) {
        folder = '';
    }

    folder = folder.replace(/^\/+|\/+$/g, '');

    const filename = String(file.name).replace(/^\/+/g, '');

    // 如果 storePath 已经包含当前文件名，避免重复拼接
    if (folder.endsWith(`/${filename}`) || folder === filename) {
        return folder;
    }

    return folder ? `${folder}/${filename}` : filename;
};


// ★ 新增：根据 credentials + usePublicBucket 决定实际使用的桶名
// usePublicBucket 默认 false，即所有旧调用不传该参数时行为完全不变（私有桶）
const resolveBucket = (credentials, usePublicBucket=true) => {
    if (!usePublicBucket) {
        return credentials.privateBucket;
    }

    if (!credentials.publicBucket) {
        throw new Error('后端未返回 publicBucket，无法使用公有桶');
    }

    return credentials.publicBucket;
};


export function useOssUpload() {
    const processSize = ref(0);
    const urlPath = ref('');

    /**
     * 每次调用都重新获取后端凭证。
     *
     * 后端返回示例：
     * {
     *   code: 200,
     *   data: {
     *     expiresAt: 1786092002000,
     *     access: '***',
     *     secret: '***',
     *     securityToken: '***',
     *     fileManager: 'ali_oss',
     *     publicBucket: 'whln-test-public',
     *     privateBucket: 'whln-test-private',
     *     region: 'cn-beijing'
     *   }
     * }
     */
    const requestCredentials = async () => {
        const response = await getCertificate();

        if (!response || !response.data) {
            throw new Error('getCertificate 接口返回异常');
        }

        if (
            response.code !== undefined &&
            response.code !== 200
        ) {
            throw new Error(response.msg || '获取文件存储凭证失败');
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
     * ★ usePublicBucket 默认 false，不传即为原来的私有桶逻辑
     */
    const createAliOssClient = (credentials, usePublicBucket = true) => {
        const {
            access,
            secret,
            securityToken,
            region,
            expiresAt,
        } = credentials;

        const bucket = resolveBucket(credentials, usePublicBucket); // ★

        const ossRegion = normalizeAliRegion(region);

        const client = new OSS({
            accessKeyId: access,
            accessKeySecret: secret,
            stsToken: securityToken || undefined,
            region: ossRegion,
            bucket,
            secure: true,

            // 阿里云 SDK 需要刷新凭证时，直接重新调用后端
            refreshSTSToken: async () => {
                const freshResponse = await getCertificate();

                if (!freshResponse || !freshResponse.data) {
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
            bucket,
            region: ossRegion,
            isPublic: usePublicBucket, // ★
            expireAt: Number(expiresAt || 0),
        };
    };


    /**
     * 创建 RustFS S3 客户端
     * ★ usePublicBucket 默认 false，不传即为原来的私有桶逻辑
     */
    const createRustfsClient = (credentials, usePublicBucket = true) => {
        const {
            access,
            secret,
            securityToken,
            region,
            expiresAt,
        } = credentials;

        const bucket = resolveBucket(credentials, usePublicBucket); // ★

        const client = new S3Client({
            region: region || 'us-east-1',
            endpoint: RUSTFS_ENDPOINT,

            credentials: {
                accessKeyId: access,
                secretAccessKey: secret,

                // RustFS 如果没有 securityToken，则不会传该字段
                ...(securityToken
                    ? { sessionToken: securityToken }
                    : {}),
            },

            forcePathStyle: true,
        });

        return {
            type: 'rust_fs',
            client,
            bucket,
            endpoint: RUSTFS_ENDPOINT,
            isPublic: usePublicBucket, // ★
            expireAt: Number(expiresAt || 0),
        };
    };


    /**
     * 创建华为云 OBS 客户端
     * ★ usePublicBucket 默认 false，不传即为原来的私有桶逻辑
     */
    const createHuaweiObsClient = (credentials, usePublicBucket = true) => {
        const {
            access,
            secret,
            securityToken,
            region,
            expiresAt,
        } = credentials;

        const bucket = resolveBucket(credentials, usePublicBucket); // ★

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
            bucket,
            endpoint,
            isPublic: usePublicBucket, // ★
            expireAt: Number(expiresAt || 0),
        };
    };


    /**
     * 根据后端 fileManager 创建对应客户端
     * ★ 透传 usePublicBucket，默认 false
     */
    const buildClient = (credentials, usePublicBucket = false) => {
        switch (credentials.fileManager) {
            case 'ali_oss':
                return createAliOssClient(credentials, usePublicBucket);

            case 'rust_fs':
                return createRustfsClient(credentials, usePublicBucket);

            case 'huawei_obs':
                return createHuaweiObsClient(credentials, usePublicBucket);

            default:
                throw new Error(
                    `不支持的 fileManager: ${credentials.fileManager}`,
                );
        }
    };


    /**
     * 每次操作都重新获取凭证并创建客户端。
     * ★ usePublicBucket 默认 false —— 所有旧代码里 getClient() 不传参，
     *   行为与原来完全一致（私有桶）。
     */
    const getClient = async (usePublicBucket = false) => {
        const credentials = await requestCredentials();
        const clientInfo = buildClient(credentials, usePublicBucket);

        return {
            ...clientInfo,
            credentials,
        };
    };


    /**
     * 保存上传后的对象路径
     */
    const saveObjectPath = (bucket, objectKey) => {
        const path = createStoredPath(bucket, objectKey);

        urlPath.value = path;

        return {
            obsPath: path,
        };
    };


    // ★ 新增：拼公有桶的永久直链（不带签名，公开可访问）
    const buildPublicUrl = (clientInfo, objectKey) => {
        const { type, bucket, endpoint, credentials } = clientInfo;
        const encodedKey = String(objectKey || '')
            .split('/')
            .map((seg) => encodeURIComponent(seg))
            .join('/');

        if (type === 'rust_fs') {
            // path-style: endpoint/bucket/key
            return `${endpoint}/${bucket}/${encodedKey}`;
        }

        if (type === 'ali_oss') {
            const region = normalizeAliRegion(credentials.region);
            return `https://${bucket}.${region}.aliyuncs.com/${encodedKey}`;
        }

        if (type === 'huawei_obs') {
            const region = credentials.region;
            return `https://${bucket}.obs.${region}.myhuaweicloud.com/${encodedKey}`;
        }

        return '';
    };


    /**
     * 统一错误处理
     */
    const handleUploadError = (error) => {
        console.error('文件上传失败:', error);

        const code = error?.code;
        const name = error?.name;

        if (
            code === 'ConnectionTimeoutError' ||
            name === 'TimeoutError' ||
            name === 'NetworkError'
        ) {
            ElMessage.error('上传超时，请稍后重试！');
        } else if (code === 'ECONNABORTED') {
            ElMessage.error('网络错误，请检查您的网络连接！');
        } else {
            ElMessage.error(
                `上传失败: ${error?.message || '未知错误'}`,
            );
        }
    };


    /**
     * 阿里云 OSS 上传
     */
    const uploadWithAliOss = async (
        clientInfo,
        file,
        objectKey,
    ) => {
        const {
            client,
            bucket,
        } = clientInfo;

        // 小文件上传
        if (file.size < 5 * 1024 * 1024) {
            await client.put(objectKey, file, {
                progress: (progress) => {
                    processSize.value = Math.floor(progress * 100);
                },
            });
        } else {
            // 大文件分片上传
            await client.multipartUpload(objectKey, file, {
                partSize: 5 * 1024 * 1024,
                parallel: 4,
                timeout: 120000,

                progress: (progress) => {
                    processSize.value = Math.floor(progress * 100);
                },
            });
        }

        processSize.value = 100;

        return saveObjectPath(bucket, objectKey);
    };


    /**
     * RustFS S3 上传
     */
    const uploadWithRustfs = async (
        clientInfo,
        file,
        objectKey,
    ) => {
        const {
            client,
            bucket,
        } = clientInfo;

        const upload = new S3Upload({
            client,
            params: {
                Bucket: bucket,
                Key: objectKey,
                Body: file,
                ContentType: file.type || 'application/octet-stream',
            },
            queueSize: 1,
            partSize: 5 * 1024 * 1024,
            leavePartsOnError: false,
        });

        upload.on(
            'httpUploadProgress',
            ({ loaded, total }) => {
                if (total) {
                    processSize.value = Math.floor(
                        (loaded / total) * 100,
                    );
                }
            },
        );

        await upload.done();

        processSize.value = 100;

        return saveObjectPath(bucket, objectKey);
    };


    /**
     * 华为云 OBS 上传
     */
    const uploadWithHuaweiObs = (
        clientInfo,
        file,
        objectKey,
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
                            Key: objectKey,
                            UploadId: uploadId,
                        },
                        finishAbort,
                    );

                    // 兼容部分 SDK 不触发 abort 回调
                    setTimeout(finishAbort, 3000);
                } catch {
                    finishAbort();
                }
            };


            // 小文件上传
            if (file.size < 5 * 1024 * 1024) {
                client.putObject(
                    {
                        Bucket: bucket,
                        Key: objectKey,
                        Body: file,
                        ContentType:
                            file.type || 'application/octet-stream',

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
                        resolveOnce(
                            saveObjectPath(bucket, objectKey),
                        );
                    },
                );

                return;
            }


            // 大文件分片上传
            client.initiateMultipartUpload(
                {
                    Bucket: bucket,
                    Key: objectKey,
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
                            new Error(
                                '华为云 OBS 未返回 UploadId',
                            ),
                        );
                        return;
                    }

                    const partSize = 5 * 1024 * 1024;
                    const totalParts = Math.ceil(
                        file.size / partSize,
                    );
                    const uploadedParts = [];
                    let currentPartNumber = 1;

                    const uploadNextPart = () => {
                        if (currentPartNumber > totalParts) {
                            client.completeMultipartUpload(
                                {
                                    Bucket: bucket,
                                    Key: objectKey,
                                    UploadId: uploadId,
                                    Parts: uploadedParts.sort(
                                        (a, b) =>
                                            a.PartNumber -
                                            b.PartNumber,
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
                                            objectKey,
                                        ),
                                    );
                                },
                            );

                            return;
                        }

                        const partNumber = currentPartNumber;
                        const start =
                            (partNumber - 1) * partSize;
                        const end = Math.min(
                            start + partSize,
                            file.size,
                        );
                        const chunk = file.slice(start, end);

                        client.uploadPart(
                            {
                                Bucket: bucket,
                                Key: objectKey,
                                PartNumber: partNumber,
                                UploadId: uploadId,
                                Body: chunk,

                                ProgressCallback: (
                                    transferred,
                                    total,
                                ) => {
                                    if (total) {
                                        const overall =
                                            (
                                                (partNumber - 1) *
                                                    partSize +
                                                transferred
                                            ) / file.size;

                                        processSize.value =
                                            Math.floor(
                                                overall * 100,
                                            );
                                    }
                                },
                            },
                            (partError, partResult) => {
                                if (partError) {
                                    abortAndReject(
                                        partError,
                                        uploadId,
                                    );
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
     * 原有调用方式完全不变（私有桶，行为与之前一致）：
     *
     * const result = await ossUpload.uploadFile(
     *     file,
     *     sessionStorage.getItem('obsFilePath') || '',
     * );
     * // result = { obsPath: 'xxx.jpg' }
     *
     * ★ 新增：需要公有桶（例如富文本插图，需要永久直链）时，
     *   第三个参数传 { isPublic: true }：
     *
     * const result = await ossUpload.uploadFile(file, 'editor-images/', { isPublic: true });
     * // result = { obsPath: 'editor-images/xxx.jpg', url: 'https://.../editor-images/xxx.jpg' }
     * // url 字段仅在 isPublic 为 true 时才会返回
     */
    const uploadFile = async (
        file,
        storePath = '',
        options = {}, // ★ 新增参数，默认空对象，不传等于原来的行为
    ) => {
        const { isPublic = false } = options; // ★ 默认 false = 私有桶

        processSize.value = 0;

        try {
            if (!file) {
                throw new Error('上传文件为空');
            }

            // 每次上传前重新获取凭证
            const clientInfo = await getClient(isPublic); // ★

            const objectKey = createObjectKey(
                file,
                storePath,
                clientInfo.bucket,
            );

            let result;

            switch (clientInfo.type) {
                case 'ali_oss':
                    result = await uploadWithAliOss(
                        clientInfo,
                        file,
                        objectKey,
                    );
                    break;

                case 'rust_fs':
                    result = await uploadWithRustfs(
                        clientInfo,
                        file,
                        objectKey,
                    );
                    break;

                case 'huawei_obs':
                    result = await uploadWithHuaweiObs(
                        clientInfo,
                        file,
                        objectKey,
                    );
                    break;

                default:
                    throw new Error(
                        `未知文件管理类型: ${clientInfo.type}`,
                    );
            }

            // ★ 只有显式要求公有桶时，才额外附加永久直链 url 字段
            // 不影响原有只读 obsPath 的调用方
            if (isPublic) {
                result.url = buildPublicUrl(clientInfo, objectKey);
            }

            return result;
        } catch (error) {
            handleUploadError(error);

            return {
                msg: '上传失败',
                obsPath: '',
            };
        }
    };


    /**
     * 获取文件签名 URL
     *
     * 使用方式（行为不变，仍然只用私有桶凭证签名）：
     *
     * const url = await ossUpload.getFileUrl(
     *     record.pdfReportPath,
     * );
     * window.open(url);
     */
    const getFileUrl = async (filePath) => {
        try {
            if (!filePath) {
                return '';
            }

            // 已经是完整 URL 时，直接使用
            // 这里不能删除 ? 后面的签名参数
            if (/^https?:\/\//i.test(String(filePath))) {
                return String(filePath);
            }

            // 每次获取文件地址重新获取凭证
            const clientInfo = await getClient();

            const objectKey = extractObjectKey(
                filePath,
                clientInfo.bucket,
            );

            if (!objectKey) {
                throw new Error('文件对象 Key 为空');
            }

            if (clientInfo.type === 'ali_oss') {
                return await clientInfo.client.signatureUrl(
                    objectKey,
                    {
                        expires: 3600,
                    },
                );
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
                const result =
                    clientInfo.client.createSignedUrlSync({
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

            const objectKey = extractObjectKey(
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

            const objectKey = extractObjectKey(
                objectName,
                clientInfo.bucket,
            );

            if (!objectKey) {
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
    const copyFile = async (
        sourceObject,
        targetObject,
    ) => {
        try {
            const clientInfo = await getClient();

            const sourceKey = extractObjectKey(
                sourceObject,
                clientInfo.bucket,
            );

            const targetKey = extractObjectKey(
                targetObject,
                clientInfo.bucket,
            );

            if (!sourceKey || !targetKey) {
                return false;
            }

            if (clientInfo.type === 'ali_oss') {
                const sourceResult =
                    await clientInfo.client.get(sourceKey);

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
                        CopySource:
                            `${clientInfo.bucket}/${sourceKey}`,
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
                            CopySource:
                                `${clientInfo.bucket}/${sourceKey}`,
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