<script setup>
import { computed } from 'vue'
import { findGame } from '../services/games'

const props = defineProps({
  title: String,
  gameKey: String,
  note: String,
  completed: Boolean,
  taskRow: Boolean,
  disabled: Boolean,
})
defineEmits(['select'])
const game = computed(() => findGame(props.gameKey))
</script>

<template>
  <button class="training-card" :class="{ completed, 'task-row': taskRow }" :disabled="disabled" @click="$emit('select')">
    <view class="cover">
      <image v-if="game" class="art" :src="'/static/covers/' + game.key + '.jpg'" mode="aspectFill" lazy-load />
      <image v-else class="fallback icon" src="/static/icons/brain.png" mode="aspectFit" />
    </view>
    <view class="caption">
      <text class="name">{{ title }}</text>
      <text v-if="note" class="note">{{ note }}</text>
    </view>
    <text v-if="taskRow" class="stamp">{{ completed ? '已完成' : '未完成' }}</text>
  </button>
</template>

<style scoped>
.training-card {
  width: 100%;
  min-width: 0;
  padding: 8px;
  margin: 0;
  border: 1px solid #dce5f7;
  border-radius: 12px;
  background: #f7f9fe;
  color: #172846;
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: left;
  line-height: 1.3;
}
.training-card:not([disabled]):active { border-color: #879ff4; background: #eaf0ff; }
.cover { display: flex; align-items: center; justify-content: center; position: relative; width: 100%; height: auto; aspect-ratio: 1.58; overflow: hidden; border-radius: 7px; background: #e9eefb; }
.art { display: block; width: 100%; height: 100%; }
.fallback { width: 35px; height: 35px; }
.task-row { min-height: 60px; padding: 8px 12px; flex-direction: row; align-items: center; gap: 12px; border-radius: 9px; background: #f1f5fc; }
.task-row .cover { width: 38px; height: 38px; flex: 0 0 38px; aspect-ratio: auto; border-radius: 50%; }
.task-row .fallback { width: 23px; height: 23px; }
.task-row .caption { flex: 1; min-width: 0; padding: 0; }
.stamp { flex: 0 0 auto; padding: 5px 10px; border-radius: 999px; background: #e6e9ef; color: #45546d; font-size: 12px; line-height: 1.2; white-space: nowrap; }
.completed .stamp { background: #e1f3e8; color: #20704e; }
.caption { width: 100%; display: flex; flex-direction: column; gap: 4px; padding: 1px 4px 4px; }
.name { font-size: 14px; min-height: 18px; font-weight: 750; overflow-wrap: anywhere; }
.note { font-size: 12px; color: #55647e; }
.completed[disabled] { color: #172846; background: #f5faf8; }
</style>
