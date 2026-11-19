<template>
  <div class="game-controls">
    <!-- 跳过统一放顶部（仅一键启动）；此处保留结束训练 -->
    <button class="control-btn finish-btn" @click="$emit('finish')">
      {{ t('finish') }}
    </button>
  </div>
</template>

<script>
export default {
  name: 'GameControls',
  inject: ['i18n'],
  computed: {
    t() {
      return key => this.i18n.t(key)
    }
  },
}
</script>

<style scoped>
.game-controls {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
}

.control-btn {
  padding: 12px 30px;
  font-size: 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
}

.back-btn {
  background-color: #9E9E9E;
  color: #fff;
}

.back-btn:hover {
  background-color: #757575;
  transform: translateY(-2px);
}

.finish-btn {
  background-color: #F44336;
  color: #fff;
}

.finish-btn:hover {
  background-color: #d32f2f;
  transform: translateY(-2px);
}
</style>
