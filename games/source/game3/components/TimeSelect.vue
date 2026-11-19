<template>
  <div class="time-select-screen">
    <h2>{{ t('selectDuration') }}</h2>
    <div class="time-buttons">
      <button @click="selectTime(60)" class="time-btn">1{{ t('minute') }}</button>
      <button @click="selectTime(180)" class="time-btn">3{{ t('minute') }}</button>
      <button @click="selectTime(300)" class="time-btn">5{{ t('minute') }}</button>
    </div>
    <button @click="goBack" class="back-btn">{{ t('back') }}</button>
  </div>
</template>

<script>
export default {
  name: 'TimeSelect',
  props: {
    t: {
      type: Function,
      required: true
    }
  },
  emits: ['select', 'back'],
  methods: {
    selectTime(duration) {
      this.$emit('select', duration);
    },
    goBack() {
      this.$emit('back');
    }
  }
}
</script>

<style scoped>
.time-select-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
}

.time-select-screen h2 {
  font-size: 36px;
  color: white;
  margin-bottom: 40px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.time-buttons {
  display: flex;
  gap: 20px;
  margin-bottom: 40px;
  flex-wrap: wrap;
  justify-content: center;
}

.time-btn {
  padding: 20px 40px;
  font-size: 24px;
  background: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-weight: bold;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  min-width: 150px;
}

.time-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
}

.back-btn {
  padding: 12px 40px;
  font-size: 18px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-weight: bold;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.back-btn:hover {
  background: white;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .time-select-screen h2 {
    font-size: 28px;
    margin-bottom: 30px;
  }

  .time-btn {
    font-size: 20px;
    padding: 15px 30px;
    min-width: 130px;
  }

  .time-buttons {
    gap: 15px;
  }
}

@media (max-width: 480px) {
  .time-select-screen {
    padding: 15px;
  }

  .time-select-screen h2 {
    font-size: 24px;
    margin-bottom: 25px;
  }

  .time-btn {
    font-size: 18px;
    padding: 12px 25px;
    min-width: 110px;
  }

  .time-buttons {
    gap: 12px;
    margin-bottom: 30px;
  }

  .back-btn {
    padding: 10px 30px;
    font-size: 16px;
  }
}

@media (max-width: 360px) {
  .time-select-screen h2 {
    font-size: 20px;
    margin-bottom: 20px;
  }

  .time-btn {
    font-size: 16px;
    padding: 10px 20px;
    min-width: 90px;
  }

  .time-buttons {
    gap: 10px;
    margin-bottom: 25px;
  }

  .back-btn {
    padding: 8px 25px;
    font-size: 14px;
  }
}
</style>
