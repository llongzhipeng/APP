<template>
  <div class="menu-screen">
    <h1 class="game-title">{{ t('gameTitle') }}</h1>
    <div class="menu-buttons">
      <button @click="handleStartGame" class="menu-btn start-btn">
        {{ t('startGame') }}
      </button>
      <button @click="showRules" class="menu-btn">
        {{ t('rulesBtn') }}
      </button>
      <button @click="showHistory" class="menu-btn">
        {{ t('historyBtn') }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MenuScreen',
  props: {
    t: {
      type: Function,
      required: true
    }
  },
  emits: ['start-game', 'show-rules', 'show-history'],
  methods: {
    handleStartGame() {
      this.$emit('start-game');
    },
    showRules() {
      this.$emit('show-rules');
    },
    showHistory() {
      this.$emit('show-history');
    }
  }
}
</script>

<style scoped>
.menu-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
}

.game-title {
  font-size: 48px;
  color: white;
  margin-bottom: 60px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.menu-buttons {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.menu-btn {
  padding: 15px 60px;
  font-size: 20px;
  background: white;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  font-weight: bold;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  min-width: 250px;
  max-width: 100%;
  white-space: nowrap;
}

.menu-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
}

.start-btn {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

@media (max-width: 768px) {
  .game-title {
    font-size: 36px;
    margin-bottom: 40px;
  }

  .menu-btn {
    font-size: 18px;
    padding: 12px 40px;
    min-width: 200px;
  }
}

@media (max-width: 480px) {
  .game-title {
    font-size: 28px;
    margin-bottom: 30px;
  }

  .menu-btn {
    font-size: 16px;
    padding: 10px 30px;
    min-width: 160px;
  }
}

@media (max-width: 360px) {
  .game-title {
    font-size: 24px;
    margin-bottom: 25px;
  }

  .menu-btn {
    font-size: 14px;
    padding: 8px 20px;
    min-width: 140px;
  }
}
</style>
