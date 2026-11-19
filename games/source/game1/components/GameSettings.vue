<template>
  <div class="container">
    <h2 class="title">{{ t('settings.title') }}</h2>
    
    <div class="flex-center" style="margin: 30px 0;">
      <div style="width: 300px;">
        <p style="margin-bottom: 15px; font-size: 18px;">{{ t('settings.choose') }}</p>
        <div v-for="item in durationOptions" :key="item.value" class="flex-row" style="margin: 10px 0;">
          <input 
            type="radio" 
            :id="`duration-${item.value}`" 
            v-model="selectedDuration" 
            :value="item.value"
          >
          <label :for="`duration-${item.value}`" style="margin-left: 8px;">{{ item.label }}</label>
        </div>
      </div>
    </div>

    <div class="flex-center" style="gap: 20px; margin-top: 30px;">
      <button class="btn btn-primary" @click="confirmSettings">{{ t('settings.confirm') }}</button>
      <button class="btn btn-secondary" @click="goBack">{{ t('settings.back') }}</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Game1GameSettings'
};
</script>

<script setup>
import { ref, inject, computed } from '@vue/composition-api';

// 移除 defineEmits 的导入
const emit = defineEmits(['confirm', 'back']);

const t = inject('t');
const lang = inject('lang');

// 训练时长选项（秒）
const durationOptions = computed(() => ([
  { label: t('duration.60'), value: 60 },
  { label: t('duration.180'), value: 180 },
  { label: t('duration.300'), value: 300 }
]));

// 选中的时长，默认1分钟
const selectedDuration = ref(60);

// 确认设置
const confirmSettings = () => {
  emit('confirm', selectedDuration.value);
};

// 返回主页
const goBack = () => {
  emit('back');
};
</script>