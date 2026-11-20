<script setup>
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import Brand from '../../components/Brand.vue'
import { demoCode, demoPin, getSession, isDemo, signIn } from '../../services/training'

import { getTrainingLanguage, setTrainingLanguage } from '../../services/language'

const language = ref(getTrainingLanguage())
const code = ref('')
const pin = ref('')
const error = ref('')
const busy = ref(false)
const english = computed({
  get: () => language.value === 'en',
  set: enabled => {
    language.value = enabled ? 'en' : 'zh'
    setTrainingLanguage(language.value)
  },
})
const copy = computed(() => english.value ? {
  title: 'Pediatric Cognitive Rehabilitation System',
  description: 'Enter the training code and PIN from your clinician.',
  code: 'Training code', pin: 'PIN', start: 'Start training', loading: 'Signing in…',
  invalidPin: 'Incorrect PIN.', networkError: 'Network connection failed. Try again.', signInError: 'Sign-in failed. Try again.',
  demo: 'Demo access', fill: 'Use demo credentials', required: 'Enter your training code and PIN.',
} : {
  title: '儿童认知康复训练系统',
  description: '请输入医生提供的训练码和 PIN',
  code: '训练码', pin: 'PIN 密码', start: '开始训练', loading: '登录中…',
  invalidPin: 'PIN 码不正确', networkError: '网络连接失败，请检查网络后重试',
  demo: '演示登录', fill: '填入演示账号', required: '请输入训练码和 PIN。',
})

onLoad(() => {
  if (getSession()) openToday()
})

function openToday() {
  uni.reLaunch({ url: '/pages/today/index' })
}

function fillDemo() {
  code.value = demoCode
  pin.value = demoPin
  error.value = ''
}

async function submit() {
  if (busy.value) return
  error.value = ''
  if (!code.value.trim() || !pin.value.trim()) {
    error.value = copy.value.required
    return
  }
  busy.value = true
  try {
    await signIn(code.value.trim(), pin.value.trim())
    openToday()
  } catch (cause) {
    if (cause.code === 'INVALID_PIN') error.value = copy.value.invalidPin
    else if (cause.code === 'NETWORK_ERROR') error.value = copy.value.networkError
    else error.value = english.value ? copy.value.signInError : cause.message
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <view class="topbar">
    <view class="topbar-inner">
      <view class="language">
        <button class="language-option" :class="{ current: !english }" @click="english = false; error = ''">中</button>
        <button class="language-option" :class="{ current: english }" @click="english = true; error = ''">EN</button>
      </view>
    </view>
  </view>
  <view class="login">
    <view class="login-intro">
      <Brand class="hero-mark" />
      <text class="headline">{{ copy.title }}</text>
      <text class="description">{{ copy.description }}</text>
    </view>
    <view class="login-fields">
      <view class="form">
        <view class="field">
          <text class="label">{{ copy.code }}</text>
          <view class="field-box">
            <image class="icon" src="/static/icons/hash.png" mode="aspectFit" />
            <input v-model="code" :placeholder="copy.code" :aria-label="copy.code" maxlength="64" confirm-type="next" />
          </view>
        </view>
        <view class="field">
          <text class="label">{{ copy.pin }}</text>
          <view class="field-box">
            <image class="icon" src="/static/icons/key.png" mode="aspectFit" />
            <input v-model="pin" password :placeholder="copy.pin" :aria-label="copy.pin" maxlength="32" confirm-type="go" @confirm="submit" />
          </view>
        </view>
        <text v-if="error" class="error" role="alert">{{ error }}</text>
        <button class="primary" :disabled="busy" @click="submit">{{ busy ? copy.loading : copy.start }}</button>
      </view>
      <view v-if="isDemo" class="demo">
        <view>
          <text class="demo-title">{{ copy.demo }}</text>
          <text class="demo-credentials">{{ demoCode }} · {{ demoPin }}</text>
        </view>
        <button class="secondary" @click="fillDemo">{{ copy.fill }}</button>
      </view>
    </view>
  </view>
</template>

<style scoped>
.language { margin-left: auto; display: flex; gap: 2px; padding: 3px; border: 1px solid #cfE3ed; border-radius: 8px; background: #eef6fa; }
.language-option { display: flex; align-items: center; justify-content: center; margin: 0; min-width: 37px; min-height: 30px; border-radius: 5px; background: transparent; color: #385e71; font-weight: 700; font-size: 12px; }
.language-option.current { background: #3658d3; color: #fff; }
.login { width: calc(100% - 36px); max-width: 426px; margin: 0 auto; padding: 58px 0 34px; display: flex; flex-direction: column; align-items: center; }
.login-intro { display: flex; flex-direction: column; align-items: center; }
.login-fields { width: 100%; }
.hero-mark { margin-bottom: 20px; }
.headline { color: #233b75; font-size: 36px; font-weight: 800; line-height: 1.2; margin: 7px 0 10px; text-align: center; }
.description { color: #486575; font-size: 15px; text-align: center; line-height: 1.5; }
.form { width: 100%; margin-top: 28px; padding: 22px; border: 1px solid #dce8ef; border-radius: 20px; background: #fff; display: flex; flex-direction: column; gap: 15px; box-shadow: 0 5px 24px #123d5410; }
.form .primary { background: #3658d3; }
.form .primary[disabled] { background: #637ab4; }
.field { display: flex; flex-direction: column; gap: 7px; }
.label { font-size: 13px; font-weight: 700; }
.field-box { min-height: 49px; border: 1px solid #c6dbe6; border-radius: 9px; background: #f8fbfd; display: flex; align-items: center; gap: 12px; padding: 0 13px; }
.field-box:focus-within { border-color: #506ee0; box-shadow: 0 0 0 1px #506ee0; }
.field-box input { flex: 1; min-width: 0; min-height: 46px; color: #123e56; font-size: 15px; }
.demo { margin-top: 16px; width: 100%; padding: 11px 13px; border: 1px solid #dce8ef; border-radius: 12px; display: flex; align-items: center; justify-content: space-between; gap: 10px; background: #f9fcfd; }
.demo-title, .demo-credentials { display: block; }
.demo-title { font-size: 12px; font-weight: 750; color: #2f5b70; }
.demo-credentials { margin-top: 3px; font-size: 12px; color: #446273; }
@media (min-width: 680px) {
  .login { max-width: 490px; padding: 68px 0 40px; }
  .headline { font-size: 38px; }
  .description { font-size: 17px; }
  .label { font-size: 15px; }
  .form { padding: 27px; gap: 19px; }
  .field-box, .field-box input { min-height: 54px; }
  .field-box input { font-size: 17px; }
  .login .primary { min-height: 58px; font-size: 18px; }
  .language-option { display: flex; align-items: center; justify-content: center; margin: 0; min-width: 43px; min-height: 38px; }
}
@media (min-width: 900px) and (orientation: landscape) {
  .login { width: calc(100% - 96px); max-width: 936px; min-height: calc(100vh - 88px); display: grid; grid-template-columns: 1fr 1fr; gap: clamp(36px, 7vw, 96px); padding: 40px 0; }
  .login-intro { align-items: flex-start; }
  .hero-mark { margin-bottom: 27px; }
  .headline, .description { text-align: left; }
  .headline { font-size: clamp(34px, 3.6vw, 44px); }
  .form { margin-top: 0; }
}
@media (max-width: 520px) { .login { padding-top: 35px; } .hero-mark { margin-bottom: 17px; } .headline { font-size: 31px; } .form { padding: 17px; } }
</style>
