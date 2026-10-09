<template>
  <div class="login-page">
    <div class="bg-image" />

    <div class="login-card">
      <div class="card-left">
        <img src="@/assets/login-robot.png" alt="AI" class="robot-img" />
      </div>

      <div class="card-right">
        <h2 class="form-title">您好，请登录</h2>

        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-position="top"
          @submit.prevent="handleLogin"
        >
          <el-form-item prop="username">
            <el-input
              v-model.trim="form.username"
              autocomplete="username"
              clearable
              placeholder="请输入账号"
              size="large"
              @keyup.enter="handleLogin"
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model.trim="form.password"
              autocomplete="current-password"
              placeholder="请输入密码"
              show-password
              size="large"
              type="password"
              @keyup.enter="handleLogin"
            />
          </el-form-item>

          <div class="form-links">
            <el-link type="primary" :underline="false">没账号？去申请</el-link>
            <el-link :underline="false">忘记密码</el-link>
          </div>

          <el-button
            class="login-button"
            native-type="submit"
            type="primary"
            size="large"
            :disabled="loading"
            :loading="loading"
          >
            登录
          </el-button>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { login } from '@/api/modules/login'
import { getCertificate, getCustomer } from '@/api/modules/base.js'
import { ossClientInfo } from '@/assets/js/static.js'

const route = useRoute()
const router = useRouter()
const formRef = ref(null)
const loading = ref(false)

const form = reactive({
  username: '',
  password: '',
})

const rules = {
  username: [
    { required: true, message: '账号不能为空', trigger: ['blur', 'change'] },
  ],
  password: [
    { required: true, message: '密码不能为空', trigger: ['blur', 'change'] },
  ],
}

const errorMessages = {
  1002000001: '您的账户被禁用',
  1002000002: '您的服务已停用',
}

/**
 * 仅允许跳转到站内路径，避免 redirect 参数形成外部跳转。
 */
function getRedirectPath() {
  const redirect = route.query.redirect

  if (
    typeof redirect === 'string' &&
    redirect.startsWith('/') &&
    !redirect.startsWith('//')
  ) {
    return redirect
  }

  return '/overview'
}

function saveLoginSession(data) {
  if (!data) return

  sessionStorage.setItem('accessToken', data.accessToken || '')
  sessionStorage.setItem('refreshToken', data.refreshToken || '')
  sessionStorage.setItem('userId', data.userId || '')
  sessionStorage.setItem('userName', form.username)
}

function showLoginError(response) {
  const code = Number(response?.code)
  const message = response?.msg || '用户名或密码错误，请重新输入'

  if (/^1002/.test(String(code)) && code !== 1002000000) {
    ElMessageBox.alert(
      `${errorMessages[code] || message}\n\n如有问题可联系平台客服：155-6259-8617`,
      '温馨提示',
      {
        confirmButtonText: '知道了',
        type: 'warning',
      },
    )
    return
  }

  ElMessage.error(message)
}

/**
 * 登录成功后初始化旧页面依赖的用户信息和 OSS 临时凭证。
 * 这里不再保存旧组件中的硬编码 accessKey，而只使用接口返回的临时凭证。
 */
async function initializeUserContext(loginResponse) {
  const userId = loginResponse?.data?.userId

  if (typeof window.gtag === 'function') {
    window.gtag('event', 'user_login', {
      user_info_id: userId,
    })
  }

  const [certificateResult, customerResult] = await Promise.allSettled([
    getCertificate(),
    // getCustomer(),
  ])

  if (
    certificateResult.status === 'fulfilled' &&
    certificateResult.value?.data
  ) {
    const certificate = certificateResult.value.data
    const credentials = {
      accessKeyId: certificate.access || certificate.accessKeyId || '',
      accessKeySecret:
        certificate.secret || certificate.accessKeySecret || '',
      stsToken: certificate.securityToken || certificate.stsToken || '',
      expiration: certificate.expiration || '',
      bucket: ossClientInfo.bucketname,
      region: ossClientInfo.region,
      refreshSTSToken: async () => {
        const result = await getCertificate()
        const nextCertificate = result?.data || {}

        return {
          accessKeyId:
            nextCertificate.access || nextCertificate.accessKeyId || '',
          accessKeySecret:
            nextCertificate.secret ||
            nextCertificate.accessKeySecret ||
            '',
          stsToken:
            nextCertificate.securityToken ||
            nextCertificate.stsToken ||
            '',
          expiration: nextCertificate.expiration || '',
        }
      },
    }

    sessionStorage.setItem('ossCredentials', JSON.stringify(credentials))
  }

  // if (
  //   customerResult.status === 'fulfilled' &&
  //   customerResult.value?.code === 200 &&
  //   customerResult.value?.data
  // ) {
  //   const customer = customerResult.value.data
  //   sessionStorage.setItem(
  //     'customerInfo',
  //     JSON.stringify({
  //       name: customer.customerManagerName,
  //       phone: customer.customerManagerPhone,
  //       companyProfile: customer.companyProfile,
  //     }),
  //   )
  // }
}

function redirectAfterLogin() {
  router.replace(getRedirectPath())
}

async function handleLogin() {
  if (!formRef.value || loading.value) return

  try {
    await formRef.value.validate()
  } catch {
    return
  }

  loading.value = true

  try {
    const response = await login({
      enterpriseUid: 'Hdshanxi',
      username: form.username,
      password: form.password,
    })

    if (response?.code !== 200 || !response?.data) {
      showLoginError(response)
      return
    }

    saveLoginSession(response.data)
    await initializeUserContext(response)
    redirectAfterLogin()
  } catch (error) {
    console.error('登录请求失败：', error)
    ElMessage.error('登录失败，请检查账号密码或网络连接')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 56px;
  box-sizing: border-box;
}

.bg-image {
  position: fixed;
  inset: 0;
  background: url('@/assets/login-bg.jpg') center / cover no-repeat;
  z-index: -1;
}

.login-card {
  display: flex;
  width: 680px;
  height: 340px;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

.card-left {
  width: 44%;
  background: #0a1628;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.robot-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-right {
  flex: 1;
  padding: 40px 36px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.form-title {
  font-size: 22px;
  font-weight: 600;
  color: #1a3f6f;
  margin: 0 0 24px;
}

.form-links {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 13px;
}

.login-button {
  width: 100%;
  margin-top: 8px;
}
</style>