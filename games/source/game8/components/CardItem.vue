<template>
  <div
    class="card"
    :class="[`state-${state}`, size === 'large' ? 'card-large' : 'card-normal']"
    @click="$emit('click')"
  >
    <div class="shapes-wrap" :class="`qty-${card.quantity}`">
      <div
        v-for="i in card.quantity"
        :key="i"
        class="shape-cell"
        :class="[`qty-cell-${card.quantity}`, lastOfFive(i) ? 'last-five' : '']"
      >
        <svg viewBox="0 0 40 40" class="shape-svg" xmlns="http://www.w3.org/2000/svg">
          <!-- Circle -->
          <circle
            v-if="card.shape === 'circle'"
            cx="20" cy="20" r="17"
            :fill="colorVal"
            stroke="rgba(0,0,0,0.18)"
            stroke-width="2"
          />
          <!-- Triangle -->
          <polygon
            v-else-if="card.shape === 'triangle'"
            points="20,4 37,36 3,36"
            :fill="colorVal"
            stroke="rgba(0,0,0,0.18)"
            stroke-width="2"
          />
          <!-- Square -->
          <rect
            v-else-if="card.shape === 'square'"
            x="4" y="4" width="32" height="32"
            :fill="colorVal"
            stroke="rgba(0,0,0,0.18)"
            stroke-width="2"
          />
          <!-- Star -->
          <polygon
            v-else-if="card.shape === 'star'"
            points="20,2 24.4,13.9 37.1,14.4 27.1,22.3 30.6,34.6 20,27.5 9.4,34.6 12.9,22.3 2.9,14.4 15.6,13.9"
            :fill="colorVal"
            stroke="rgba(0,0,0,0.18)"
            stroke-width="1.5"
          />
          <!-- Diamond -->
          <polygon
            v-else-if="card.shape === 'diamond'"
            points="20,3 37,20 20,37 3,20"
            :fill="colorVal"
            stroke="rgba(0,0,0,0.18)"
            stroke-width="2"
          />
        </svg>
      </div>
    </div>
  </div>
</template>

<script>
import { COLOR_VALUES } from '../utils/gameData.js'

export default {
  name: 'CardItem',
  props: {
    card: { type: Object, required: true },
    size: { type: String, default: 'normal' },  // 'normal' | 'large'
    state: { type: String, default: 'idle' },   // 'idle' | 'selected' | 'correct' | 'wrong'
  },
  emits: ['click'],
  computed: {
    colorVal() {
      return COLOR_VALUES[this.card.color] || '#888'
    },
  },
  methods: {
    lastOfFive(i) {
      return this.card.quantity === 5 && i === 5
    },
  },
}
</script>

<style scoped>
.card {
  background: #fff;
  border-radius: 1.2vmin;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.2vmin;
  box-sizing: border-box;
  cursor: pointer;
  box-shadow: 0 0.3vmin 1.5vmin rgba(0,0,0,0.13);
  border: 0.35vmin solid #e0e0e0;
  transition: transform 0.12s, box-shadow 0.12s, border-color 0.15s;
  user-select: none;
}

.card-normal {
  width: 13.5vmin;
  height: 18vmin;
}

.card-large {
  width: 15vmin;
  height: 20vmin;
}

.card:hover {
  transform: translateY(-0.4vmin);
  box-shadow: 0 0.8vmin 2.5vmin rgba(0,0,0,0.2);
}

/* State styles */
.state-selected {
  border-color: #1E88E5;
  box-shadow: 0 0 0 0.3vmin rgba(30,136,229,0.4);
}
.state-correct {
  border-color: #43A047;
  background: #E8F5E9;
  box-shadow: 0 0 0 0.3vmin rgba(67,160,71,0.5);
}
.state-wrong {
  border-color: #E53935;
  background: #FFEBEE;
  box-shadow: 0 0 0 0.3vmin rgba(229,57,53,0.4);
}

/* Shape grid layouts */
.shapes-wrap {
  display: grid;
  gap: 0.6vmin;
  width: 100%;
  height: 100%;
  place-items: center;
  align-content: center;
  justify-content: center;
}

.qty-1 { grid-template-columns: 1fr; }
.qty-2 { grid-template-columns: 1fr; grid-template-rows: 1fr 1fr; }
.qty-3 { grid-template-columns: 1fr; grid-template-rows: 1fr 1fr 1fr; }
.qty-4 { grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; }
.qty-5 { grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr 1fr; }

.shape-cell {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Shape sizes based on quantity */
.qty-cell-1  { width: 7.5vmin; height: 7.5vmin; }
.qty-cell-2  { width: 6vmin;   height: 6vmin;   }
.qty-cell-3  { width: 4.8vmin; height: 4.8vmin; }
.qty-cell-4  { width: 4.5vmin; height: 4.5vmin; }
.qty-cell-5  { width: 4vmin;   height: 4vmin;   }

/* 5th shape spans full width */
.last-five {
  grid-column: 1 / -1;
}

.shape-svg {
  width: 100%;
  height: 100%;
}
</style>
