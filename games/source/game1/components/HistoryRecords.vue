<template>
  <div class="container">
    <div class="flex-row">
      <h2 class="title" style="margin: 0;">{{ t('history.title') }}</h2>
      <button class="btn btn-primary" @click="exportRecords">{{ t('history.export') }}</button>
    </div>

    <!-- 空状态 -->
    <div class="flex-center" style="height: 200px;" v-if="records.length === 0">
      <p>{{ t('history.empty') }}</p>
    </div>

    <!-- 记录表格 -->
    <table class="record-table" v-else>
      <thead>
        <tr>
          <th>{{ t('history.th.time') }}</th>
          <th>{{ t('history.th.level') }}</th>
          <th>{{ t('history.th.duration') }}</th>
          <th>{{ t('history.th.total') }}</th>
          <th>{{ t('history.th.success') }}</th>
          <th>{{ t('history.th.rate') }}</th>
          <th>{{ t('history.th.score') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="record in records" :key="record.recordId">
          <td>{{ record.trainingTime }}</td>
          <td>{{ record.difficultyLevel }}</td>
          <td>{{ record.actualDuration }}</td>
          <td>{{ record.totalTimes }}</td>
          <td>{{ record.successTimes }}</td>
          <td>{{ record.successRate.toFixed(1) }}</td>
          <td>{{ record.score }}</td>
        </tr>
      </tbody>
    </table>

    <div class="flex-center" style="margin-top: 30px;">
      <button class="btn btn-secondary" @click="goBack">{{ t('history.back') }}</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Game1HistoryRecords'
};
</script>

<script setup>
import { ref, onMounted, inject } from '@vue/composition-api';
// 移除 defineEmits 的导入
const emit = defineEmits(['back']);
import { getHistoryRecords, exportRecordsToCsv } from '../utils/recordUtils';

const records = ref([]);
const t = inject('t');
const lang = inject('lang');
const messages = inject('messages');

// 获取历史记录
const fetchRecords = () => {
  records.value = getHistoryRecords();
};

// 导出记录
const exportRecords = () => {
  exportRecordsToCsv(records.value, (lang && lang.value) || 'zh', messages);
};

// 返回主页
const goBack = () => {
  emit('back');
};

onMounted(() => {
  fetchRecords();
});
</script>