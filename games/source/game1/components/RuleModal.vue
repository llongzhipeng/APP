<template>
  <div class="modal-mask" v-if="visible" @click.self="close">
    <div class="modal-content">
      <div class="modal-title">{{ t('rule.title') }}</div>
      <div class="modal-body">
        <p v-for="line in t('rule.lines')" :key="line">{{ line }}</p>
      </div>
      <div class="modal-footer">
        <button class="btn btn-primary" @click="close">{{ t('rule.ok') }}</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Game1RuleModal'
};
</script>

<script setup>
import { inject } from '@vue/composition-api';
// 移除 defineProps/defineEmits 的导入
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close']);
const t = inject('t');

const close = () => {
  emit('close');
};
</script>