<template>
  <div class="shape-item">
    <img v-if="item.type === 'image'" :src="item.src" class="shape-img" />

    <svg v-else-if="item.type === 'basic'" viewBox="0 0 100 100" class="shape-svg">
      <circle v-if="item.form === 'circle'" cx="50" cy="50" r="42" :fill="item.fill" />
      <rect v-else-if="item.form === 'rect'" x="8" y="8" width="84" height="84" rx="4" :fill="item.fill" />
      <polygon v-else points="50,8 92,92 8,92" :fill="item.fill" />
    </svg>

    <svg v-else-if="item.type === 'poly'" viewBox="0 0 100 100" class="shape-svg">
      <path
        :d="POLY_PATHS[item.path]"
        :fill="item.fill"
        :stroke="item.stroke || 'none'"
        :stroke-width="item.stroke ? 7 : 0"
        stroke-linejoin="round"
      />
    </svg>

    <div v-else-if="item.type === 'multi'" class="multi-wrap">
      <svg v-for="(s, i) in item.items" :key="i" viewBox="0 0 100 100" class="shape-svg">
        <path
          :d="POLY_PATHS[s.path]"
          :fill="s.fill"
          :stroke="s.stroke || 'none'"
          :stroke-width="s.stroke ? 7 : 0"
          stroke-linejoin="round"
        />
      </svg>
    </div>
  </div>
</template>

<script>
import { POLY_PATHS } from '../utils/config.js'
export default {
  name: 'ShapeItem',
  props: { item: { type: Object, required: true } },
  data() { return { POLY_PATHS } },
}
</script>

<style scoped>
.shape-item { display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; }
.shape-img { width: 100%; height: 100%; object-fit: contain; }
.shape-svg { width: 100%; height: 100%; }
.multi-wrap { display: flex; gap: 8%; width: 100%; height: 100%; align-items: center; justify-content: center; }
.multi-wrap .shape-svg { width: 48%; height: 100%; }
</style>
